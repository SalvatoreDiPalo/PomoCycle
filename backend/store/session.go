package store

import (
	"context"

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

func (s *Store) GetSessionsByStage(stage string) ([]SessionDbRow, error) {
	runtime.LogDebugf(s.ctx, "Start searching session by stage %v", stage)
	var sessions []SessionDbRow
	rows, err := s.db.QueryContext(
		context.Background(),
		`SELECT * FROM sessions WHERE stage = ? ORDER BY "timestamp";`, stage,
	)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error searching session by stage %v", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var session SessionDbRow
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft); err != nil {
			runtime.LogErrorf(s.ctx, "Error reading session %v - %v", session, err)
			return nil, err
		}
		sessions = append(sessions, session)
		runtime.LogDebugf(s.ctx, "Added to list %v", session)
	}
	runtime.LogDebugf(s.ctx, "Founded %d", len(sessions))
	return sessions, err
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

func (s *Store) GetWeekReport(date string) ([]SessionDbRow, error) {
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
		return nil, err
	}
	defer rows.Close()
	var weekSessions []SessionDbRow
	for rows.Next() {
		var session SessionDbRow
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft); err != nil {
			runtime.LogErrorf(s.ctx, "Error reading session %v - %v", session, err)
			return nil, err
		}
		weekSessions = append(weekSessions, session)
		runtime.LogDebugf(s.ctx, "Added to week list %v", session)
	}
	runtime.LogDebugf(s.ctx, "Founded %d", len(weekSessions))
	return weekSessions, nil
}

func (s *Store) GetMonthReport(date string) ([]SessionDbRowMonth, error) {
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
		return nil, err
	}
	defer rows.Close()
	var monthSessions []SessionDbRowMonth
	for rows.Next() {
		var session SessionDbRowMonth
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft, &session.Week); err != nil {
			runtime.LogErrorf(s.ctx, "Error reading session %v - %v", session, err)
			return nil, err
		}
		monthSessions = append(monthSessions, session)
		runtime.LogDebugf(s.ctx, "Added to month list %v", session)
	}
	runtime.LogDebugf(s.ctx, "Founded sessions %d", len(monthSessions))
	return monthSessions, nil
}

func (s *Store) GetYearReport(date string) ([]SessionDbRowYear, error) {
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
		return nil, err
	}
	defer rows.Close()
	var yearSessions []SessionDbRowYear
	for rows.Next() {
		var session SessionDbRowYear
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft, &session.Month); err != nil {
			runtime.LogErrorf(s.ctx, "Error reading session %v - %v", session, err)
			return nil, err
		}
		yearSessions = append(yearSessions, session)
		runtime.LogDebugf(s.ctx, "Added to year list %v", session)
	}
	return yearSessions, nil
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
