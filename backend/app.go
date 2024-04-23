package backend

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/adrg/xdg"
	_ "modernc.org/sqlite"
)

// App struct
type App struct {
	ctx    context.Context
	db     *sql.DB
	dbPath string
}

type Session struct {
	Stage        string `json:"stage"`
	TotalSeconds int    `json:"total_seconds"`
	Timestamp    int    `json:"timestamp"`
	SecondsLeft  int    `json:"seconds_left"`
}

type UpdateSessionSecondsLeft struct {
	ID          int64 `json:"id"`
	SecondsLeft int   `json:"seconds_left"`
}

type SessionDbRow struct {
	ID int64
	Session
}

type Activity struct {
	Operation int   `json:"operation"`
	Timestamp int   `json:"timestamp"`
	IdSession int64 `json:"session_id"`
}

type AcitivityDbRow struct {
	ID int64
	Activity
}

type Operation int

const (
	START  Operation = 0
	PAUSE  Operation = 1
	RESUME Operation = 2
	FINISH Operation = 3
)

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.dbPath = NewDbStore()

	var err error
	a.db, err = sql.Open("sqlite", a.dbPath)
	if err != nil {
		println("Error opening database:", err.Error())
	}
	//TODO check if table already exist
	_, err = a.db.ExecContext(
		context.Background(),
		`CREATE TABLE if not exists sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			stage TEXT NOT NULL,
			total_seconds INTEGER NOT NULL,
			"timestamp" INTEGER NOT NULL,
			seconds_left INTEGER
		);
		CREATE TABLE if not exists activities (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			operation INTEGER NOT NULL,
			"timestamp" INTEGER NOT NULL,
			id_session INTEGER NOT NULL,
			CONSTRAINT activities_FK FOREIGN KEY (id_session) REFERENCES sessions(id)
		);`,
	)
	if err != nil {
		println("Error:", err.Error())
	}
}

func (a *App) shutdown(ctx context.Context) {
	a.db.Close()
}

func (a *App) addSession(session *Session) (int64, error) {
	result, err := a.db.ExecContext(
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

func (a *App) updateSecondsLeft(ID int64, seconds_left int) (bool, error) {
	result, err := a.db.ExecContext(
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

func (a *App) getSessionByID(id int64) (SessionDbRow, error) {
	var session SessionDbRow
	row := a.db.QueryRowContext(
		context.Background(),
		`SELECT * FROM sessions WHERE id=?`, id,
	)
	err := row.Scan(&session.ID, &session.Stage, &session.TotalSeconds, &session.Timestamp, &session.SecondsLeft)
	if err != nil {
		return session, err
	}
	return session, nil
}

func (a *App) addActivity(activity *Activity) (int64, error) {
	result, err := a.db.ExecContext(
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

func (a *App) StartPomo(session Session) (int64, error) {
	sessionId, err := a.addSession(&session)
	if err != nil {
		return 0, err
	}
	a.addActivity(&Activity{
		int(START),
		session.Timestamp,
		sessionId,
	})
	return sessionId, err
}

func (a *App) AddActivityFromPomo(activity Activity) (int64, error) {
	_, err := a.getSessionByID(activity.IdSession)
	if err != nil {
		return activity.IdSession, err
	}
	activityId, err := a.addActivity(&activity)
	return activityId, err
}

func (a *App) UpdatePomoSecondsLeft(session UpdateSessionSecondsLeft) (bool, error) {
	return a.updateSecondsLeft(session.ID, session.SecondsLeft)
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func NewDbStore() string {
	dbFilePath, err := xdg.ConfigFile("pomodoro-cycle/pomo.db")
	if err != nil {
		println("Could not resolve path for db file", err)
	}

	return dbFilePath
}
