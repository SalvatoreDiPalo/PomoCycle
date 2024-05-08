package store

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
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
	runtime.LogDebugf(s.ctx, "Adding session %v", activity)
	result, err := s.db.ExecContext(
		context.Background(),
		`INSERT INTO activities (operation, "timestamp", id_session) VALUES(?, ?, ?);`, activity.Operation, activity.Timestamp, activity.IdSession,
	)
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error adding activity %v", err)
		println("Error adding activity", activity, err)
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		runtime.LogErrorf(s.ctx, "Error getting last insterted id %v", err)
		return 0, err
	}
	runtime.LogDebugf(s.ctx, "Added activity %d", id)
	return id, nil
}
