package backend

import (
	"context"
	"database/sql"
	"fmt"
	"pomodoro/backend/model"

	"github.com/adrg/xdg"
	_ "modernc.org/sqlite"
)

// App struct
type App struct {
	ctx    context.Context
	db     *sql.DB
	dbPath string
}

type UpdateSessionSecondsLeft struct {
	ID          int64 `json:"id"`
	SecondsLeft int   `json:"seconds_left"`
}

type Pomo struct {
	ID           int64  `json:"id"`
	Stage        string `json:"stage"`
	TotalSeconds int    `json:"total_seconds"`
	Timestamp    string `json:"timestamp"`
	SecondsLeft  int    `json:"seconds_left"`
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
}

func (a *App) shutdown(ctx context.Context) {
	a.db.Close()
}

func (a *App) StartPomo(addPomo model.Session) (int64, error) {
	s := model.Session{
		Stage:        addPomo.Stage,
		TotalSeconds: addPomo.TotalSeconds,
		Timestamp:    addPomo.Timestamp,
		SecondsLeft:  addPomo.SecondsLeft,
	}
	sessionId, err := s.AddSession(a.db, &s)
	if err != nil {
		return 0, err
	}
	activity := model.Activity{
		Operation: int(START),
		Timestamp: s.Timestamp,
		IdSession: sessionId,
	}
	activity.AddActivity(a.db, &activity)
	return sessionId, err
}

func (a *App) GetPomos(stage string) ([]model.SessionDbRow, error) {
	s := model.Session{}
	return s.GetSessionsByStage(a.db, stage)
}

func (a *App) AddActivityFromPomo(addActivity model.Activity) (int64, error) {
	s := model.SessionDbRow{ID: addActivity.IdSession}
	_, err := s.GetSessionByID(a.db, addActivity.IdSession)
	if err != nil {
		return addActivity.IdSession, err
	}
	activity := model.Activity{
		Operation: addActivity.Operation,
		Timestamp: addActivity.Timestamp,
		IdSession: addActivity.IdSession,
	}
	activityId, err := activity.AddActivity(a.db, &activity)
	return activityId, err
}

func (a *App) UpdatePomoSecondsLeft(updateSessionSecondsLeft UpdateSessionSecondsLeft) (bool, error) {
	s := model.Session{
		SecondsLeft: updateSessionSecondsLeft.SecondsLeft,
	}
	return s.UpdateSecondsLeft(a.db, updateSessionSecondsLeft.ID, updateSessionSecondsLeft.SecondsLeft)
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
