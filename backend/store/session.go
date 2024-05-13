package store

import (
	"context"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Session struct {
	Stage        string `json:"stage"`
	TotalSeconds int    `json:"total_seconds"`
	Timestamp    string `json:"timestamp"`
	SecondsLeft  int    `json:"seconds_left"`
}

type SessionDbRow struct {
	ID int64
	Session
}

type SessionDbRowMonth struct {
	Week int `json:"week"`
	SessionDbRow
}

type SessionDbRowYear struct {
	Month int `json:"month"`
	SessionDbRow
}

type ResponseByDateInnerMap map[string]SessionDbRow
type ResponseByDateMap map[string]ResponseByDateInnerMap

type InnerMapWrapper struct {
	InnerWrapper map[string]SessionDbRow `json:"innerWrapper"`
}

type ResponseByDate struct {
	Item map[string]InnerMapWrapper `json:"item"`
}

const InitQueryReport string = `
WITH date_stage AS (
	SELECT *
	FROM (SELECT DISTINCT date("timestamp") as date FROM sessions),
		(values ('FOCUS TIME'),('SHORT BREAK'),('LONG BREAK'))
),
default_values AS (
	SELECT id, stage, total_seconds, "timestamp", seconds_left
	FROM sessions
	UNION ALL
	SELECT -1, column1, 0, date, 0
	FROM date_stage
)
`

func (s *Store) AddSession(create *Session) (int64, error) {
	runtime.LogDebugf(s.ctx, "Adding session %v", create)
	result, err := s.db.ExecContext(
		context.Background(),
		`INSERT INTO sessions (stage, total_seconds, "timestamp", seconds_left) VALUES(?, ?, ?, ?);`, create.Stage, create.TotalSeconds, create.Timestamp, create.SecondsLeft,
	)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error adding session %v", err)
		println("Error adding session", create, err)
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error getting last insterted id %v", err)
		println("Error getting last insterted id", err)
		return 0, err
	}
	runtime.LogDebugf(s.ctx, "Added session %d", id)
	return id, nil
}

func (s *Store) GetDaysAccessedByStage() (uint16, error) {
	runtime.LogDebugf(s.ctx, "Start searching days accessed")
	var days uint16
	row := s.db.QueryRowContext(
		context.Background(),
		`SELECT count(distinct date("timestamp")) FROM sessions WHERE stage = 'FOCUS TIME';`,
	)
	err := row.Scan(&days)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error reading days accessed - %v", err)
		return days, err
	}
	runtime.LogDebugf(s.ctx, "Found days accessed = %d", days)
	return days, nil
}

func (s *Store) GetSecondsFocussed() (uint32, error) {
	runtime.LogDebugf(s.ctx, "Start searching seconds focussed")
	var seconds uint32
	row := s.db.QueryRowContext(
		context.Background(),
		`SELECT coalesce(sum(total_seconds - seconds_left), 0) FROM sessions WHERE stage = 'FOCUS TIME';`,
	)
	err := row.Scan(&seconds)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error reading seconds focussed - %v", err)
		return seconds, err
	}
	runtime.LogDebugf(s.ctx, "Found seconds focussed %d", seconds)
	return seconds, nil
}

func (s *Store) GetDaysStreak() (uint16, error) {
	runtime.LogDebugf(s.ctx, "Start searching seconds focussed")
	var days uint16
	row := s.db.QueryRowContext(
		context.Background(),
		`with cte as (
			select date("timestamp") as created_at
			from sessions
			where date("timestamp") <= date('now')
			group by date(created_at)
		  ),
		  cte2 as (
			select *, julianday(created_at) - julianday(lag(created_at) over (order by created_at)) as date_diff
			from cte 
		  ),
		  cte3 as (
			select *, SUM(CASE WHEN date_diff = 1 THEN 0 ELSE 1 END) OVER (order by created_at) AS grp 
			from cte2
		  )
		  
		select count(1) as period_length
		from cte3
		group by grp
		ORDER BY created_at DESC
		LIMIT 1;`,
	)
	err := row.Scan(&days)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error reading seconds focussed - %v", err)
		return days, err
	}
	runtime.LogDebugf(s.ctx, "Found seconds focussed %d", days)
	return days, nil
}

func (s *Store) UpdateSecondsLeft(ID int64, seconds_left int) (bool, error) {
	runtime.LogDebugf(s.ctx, "Start updating session by id %d with secondsLeft = %d", ID, seconds_left)
	result, err := s.db.ExecContext(
		context.Background(),
		`UPDATE sessions SET seconds_left=? WHERE id=?;`, seconds_left, ID,
	)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error updating seconds left %v", err)
		println("Error updating seconds left", ID, err)
		return false, err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error getting last insterted id %v", err)
		println("Error getting last insterted id", err)
		return false, err
	}
	runtime.LogDebugf(s.ctx, "Updated session %d - %v", ID, rowsAffected > 0)
	return rowsAffected > 0, nil
}

func (s *Store) GetWeekReport(date string) (ResponseByDate, error) {
	runtime.LogDebugf(s.ctx, "Start searching session week report %v", date)
	const query = InitQueryReport + `
		SELECT id, stage, COALESCE(sum(total_seconds), 0), date("timestamp"), COALESCE(sum(seconds_left), 0)
		FROM default_values
		WHERE strftime('%W %Y', "timestamp") = strftime('%W %Y', ?)
		GROUP BY date("timestamp"), stage;
	`
	rows, err := s.db.QueryContext(context.Background(), query, date)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error searching session week report %v", err)
		return ResponseByDate{}, err
	}
	defer rows.Close()
	var responseByDate ResponseByDate
	responseByDate.Item = make(map[string]InnerMapWrapper)
	for rows.Next() {
		var session SessionDbRow
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft); err != nil {
			runtime.LogErrorf(s.ctx, "Error reading session %v - %v", session, err)
			return ResponseByDate{}, err
		}
		key := strings.Split(session.Timestamp, "T")[0]
		innerMap := responseByDate.Item[key]
		if innerMap.InnerWrapper == nil {
			innerMap.InnerWrapper = make(map[string]SessionDbRow)
		}
		innerMap.InnerWrapper[session.Stage] = session
		responseByDate.Item[key] = innerMap
		runtime.LogDebugf(s.ctx, "Added to inner %v", session)
	}
	runtime.LogDebugf(s.ctx, "Founded %v", responseByDate)
	return responseByDate, err
}

func (s *Store) GetMonthReport(date string) (ResponseByDate, error) {
	runtime.LogDebugf(s.ctx, "Start searching session month report %v", date)
	const query = InitQueryReport + `
		SELECT id, stage, COALESCE(sum(total_seconds), 0), date("timestamp"), COALESCE(sum(seconds_left), 0), strftime('%W', "timestamp") as byWeek
		FROM default_values
		WHERE strftime('%m %Y', "timestamp") = strftime('%m %Y', ?)
		GROUP BY byWeek, stage;
	`
	rows, err := s.db.QueryContext(context.Background(), query, date)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error searching session month report %v", err)
		return ResponseByDate{}, err
	}
	defer rows.Close()
	var responseByDate ResponseByDate
	responseByDate.Item = make(map[string]InnerMapWrapper)
	for rows.Next() {
		var session SessionDbRow
		var key int
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft, &key); err != nil {
			runtime.LogErrorf(s.ctx, "Error reading session %v - %v", session, err)
			return ResponseByDate{}, err
		}
		innerMap := responseByDate.Item[string(rune(key))]
		if innerMap.InnerWrapper == nil {
			innerMap.InnerWrapper = make(map[string]SessionDbRow)
		}
		innerMap.InnerWrapper[session.Stage] = session
		responseByDate.Item[string(rune(key))] = innerMap
		runtime.LogDebugf(s.ctx, "Added to inner %v", session)
	}
	runtime.LogDebugf(s.ctx, "Founded %v", responseByDate)
	return responseByDate, err
}

func (s *Store) GetYearReport(date string) (ResponseByDate, error) {
	runtime.LogDebugf(s.ctx, "Start searching session year report %v", date)
	const query = InitQueryReport + `
		SELECT id, stage, COALESCE(sum(total_seconds), 0), date("timestamp"), COALESCE(sum(seconds_left), 0), strftime('%m', "timestamp") as byMonth
		FROM default_values
		WHERE strftime('%Y', "timestamp") = strftime('%Y', ?)
		GROUP BY byMonth, stage;
	`
	rows, err := s.db.QueryContext(context.Background(), query, date)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error searching session year report %v", err)
		return ResponseByDate{}, err
	}
	defer rows.Close()
	var responseByDate ResponseByDate
	responseByDate.Item = make(map[string]InnerMapWrapper)
	for rows.Next() {
		var session SessionDbRow
		var key int
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft, &key); err != nil {
			runtime.LogErrorf(s.ctx, "Error reading session %v - %v", session, err)
			return ResponseByDate{}, err
		}
		innerMap := responseByDate.Item[string(rune(key))]
		if innerMap.InnerWrapper == nil {
			innerMap.InnerWrapper = make(map[string]SessionDbRow)
		}
		innerMap.InnerWrapper[session.Stage] = session
		responseByDate.Item[string(rune(key))] = innerMap
		runtime.LogDebugf(s.ctx, "Added to inner %v", session)
	}
	runtime.LogDebugf(s.ctx, "Founded %v", responseByDate)
	return responseByDate, err
}

func (s *Store) GetSessionByID(id int64) (SessionDbRow, error) {
	runtime.LogDebugf(s.ctx, "Start searching session by id %d", id)
	var session SessionDbRow
	row := s.db.QueryRowContext(
		context.Background(),
		`SELECT * FROM sessions WHERE id=?`, id,
	)
	err := row.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error reading session %d - %v", id, err)
		return session, err
	}
	runtime.LogDebugf(s.ctx, "Found session by id: %d = %v", id, session)
	return session, nil
}
