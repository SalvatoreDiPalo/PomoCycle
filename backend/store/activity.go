package store

import (
	"context"
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

func (s *Store) AddActivity(activity *Activity) (int64, error) {
	result, err := s.db.ExecContext(
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
