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
