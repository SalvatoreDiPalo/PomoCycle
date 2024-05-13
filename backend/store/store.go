package store

import (
	"context"
	"database/sql"
	"os"

	"github.com/adrg/xdg"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	_ "modernc.org/sqlite"
)

type Store struct {
	db  *sql.DB
	ctx context.Context
}

func New(ctx context.Context) *Store {
	dbPath := newDbStore(ctx)

	var err error
	db, err := sql.Open("sqlite", dbPath+"?_pragma=busy_timeout%3d50000")
	if err != nil {
		runtime.LogErrorf(ctx, "Error opening database: %v", err)
	}
	_, err = db.ExecContext(
		context.Background(),
		`CREATE TABLE if not exists sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			stage TEXT NOT NULL,
			total_seconds INTEGER NOT NULL,
			"timestamp" TEXT NOT NULL,
			seconds_left INTEGER
		);`,
	)
	if err != nil {
		runtime.LogErrorf(ctx, "Error init query: %v", err)
		println("Error:", err.Error())
	}
	return &Store{
		db:  db,
		ctx: ctx,
	}
}

func (s *Store) Close() error {
	return s.db.Close()
}

func newDbStore(ctx context.Context) string {
	dbFilePath, err := xdg.ConfigFile("pomodoro-cycle" + string(os.PathSeparator) + "pomo.db")
	if err != nil {
		runtime.LogErrorf(ctx, "Could not resolve path for db file %v", err)
	}

	return dbFilePath
}
