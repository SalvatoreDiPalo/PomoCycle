package model

import (
	"context"
	"database/sql"
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

func (a *Session) AddSession(db *sql.DB, session *Session) (int64, error) {
	result, err := db.ExecContext(
		context.Background(),
		`INSERT INTO sessions (stage, total_seconds, "timestamp", seconds_left) VALUES(?, ?, ?, ?);`, session.Stage, session.TotalSeconds, session.Timestamp, session.SecondsLeft,
	)
	if err != nil {
		println("Error adding session", session, err)
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		println("Error getting last insterted id", err)
		return 0, err
	}
	return id, nil
}

func (a *Session) GetSessionsByStage(db *sql.DB, stage string) ([]SessionDbRow, error) {
	var sessions []SessionDbRow
	rows, err := db.QueryContext(
		context.Background(),
		`SELECT * FROM sessions WHERE stage = ? ORDER BY "timestamp";`, stage,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var session SessionDbRow
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft); err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}
	return sessions, err
}

func (a *Session) UpdateSecondsLeft(db *sql.DB, ID int64, seconds_left int) (bool, error) {
	result, err := db.ExecContext(
		context.Background(),
		`UPDATE sessions SET seconds_left=? WHERE id=?;`, seconds_left, ID,
	)
	if err != nil {
		println("Error updating seconds left", ID, err)
		return false, err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		println("Error getting last insterted id", err)
		return false, err
	}
	return rowsAffected > 0, nil
}

func (a *Session) GetSessionWeekReport(db *sql.DB, date string) ([]SessionDbRow, error) {
	println("Date", date)
	var sessions []SessionDbRow
	rows, err := db.QueryContext(
		context.Background(),
		`WITH date_stage AS (
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
		  SELECT id, stage, COALESCE(sum(total_seconds), 0), date("timestamp"), COALESCE(sum(seconds_left), 0)
		  FROM default_values
		  WHERE strftime('%W %Y', "timestamp") = strftime('%W %Y', ?)
		  GROUP BY date("timestamp"), stage;`, date,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var session SessionDbRow
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft); err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}
	return sessions, err
}

func (a *Session) GetSessionMonthReport(db *sql.DB, date string) ([]SessionDbRowMonth, error) {
	println("Date", date)
	var sessions []SessionDbRowMonth
	rows, err := db.QueryContext(
		context.Background(),
		`WITH date_stage AS (
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
		  SELECT id, stage, COALESCE(sum(total_seconds), 0), date("timestamp"), COALESCE(sum(seconds_left), 0), strftime('%W', "timestamp") as byWeek
		  FROM default_values
		  WHERE strftime('%m %Y', "timestamp") = strftime('%m %Y', ?)
		  GROUP BY byWeek, stage;`, date,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var session SessionDbRowMonth
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft, &session.Week); err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}
	return sessions, err
}

func (a *Session) GetSessionYearReport(db *sql.DB, date string) ([]SessionDbRowYear, error) {
	println("Date", date)
	var sessions []SessionDbRowYear
	rows, err := db.QueryContext(
		context.Background(),
		`WITH date_stage AS (
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
		  SELECT id, stage, COALESCE(sum(total_seconds), 0), date("timestamp"), COALESCE(sum(seconds_left), 0), strftime('%m', "timestamp") as byMonth
		  FROM default_values
		  WHERE strftime('%Y', "timestamp") = strftime('%Y', ?)
		  GROUP BY byMonth, stage;`, date,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var session SessionDbRowYear
		if err := rows.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft, &session.Month); err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}
	return sessions, err
}

func (a *Session) GetSessionByID(db *sql.DB, id int64) (SessionDbRow, error) {
	var session SessionDbRow
	row := db.QueryRowContext(
		context.Background(),
		`SELECT * FROM sessions WHERE id=?`, id,
	)
	err := row.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft)
	if err != nil {
		return session, err
	}
	return session, nil
}
