package store

import (
	"context"
	"database/sql"

	"github.com/adrg/xdg"
	_ "modernc.org/sqlite"
)

type Store struct {
	db *sql.DB
}

func New() *Store {
	dbPath := newDbStore()

	var err error
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		println("Error opening database:", err.Error())
	}
	//TODO check if table already exist
	_, err = db.ExecContext(
		context.Background(),
		`CREATE TABLE if not exists sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			stage TEXT NOT NULL,
			total_seconds INTEGER NOT NULL,
			"timestamp" TEXT NOT NULL,
			seconds_left INTEGER
		);
		CREATE TABLE if not exists activities (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			operation INTEGER NOT NULL,
			"timestamp" TEXT NOT NULL,
			id_session INTEGER NOT NULL,
			CONSTRAINT activities_FK FOREIGN KEY (id_session) REFERENCES sessions(id)
		);`,
	)
	if err != nil {
		println("Error:", err.Error())
	}
	return &Store{
		db: db,
	}
}

func (s *Store) Close() error {
	return s.db.Close()
}

func newDbStore() string {
	dbFilePath, err := xdg.ConfigFile("pomodoro-cycle/pomo.db")
	if err != nil {
		println("Could not resolve path for db file", err)
	}

	return dbFilePath
}
