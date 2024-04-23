package model

import (
	"context"
	"database/sql"
)

type Activity struct {
	Operation int    `json:"operation"`
	Timestamp string `json:"timestamp"`
	IdSession int64  `json:"session_id"`
}

type ActivityDbRow struct {
	ID int64
	Activity
}

func (a *Activity) AddActivity(db *sql.DB, activity *Activity) (int64, error) {
	result, err := db.ExecContext(
		context.Background(),
		`INSERT INTO activities (operation, "timestamp", id_session) VALUES(?, ?, ?);`, activity.Operation, activity.Timestamp, activity.IdSession,
	)
	if err != nil {
		println("Error adding activity", activity, err)
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return id, nil
}
