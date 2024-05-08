package backend

import (
	"context"
	"fmt"
	"pomodoro/backend/store"

	"github.com/wailsapp/wails/v2/pkg/logger"
)

// App struct
type App struct {
	ctx    context.Context
	Store  *store.Store
	Logger logger.Logger
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
func NewApp(logger logger.Logger) *App {
	return &App{
		Logger: logger,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.Store = store.New(ctx)
}

func (a *App) Shutdown(ctx context.Context) {
	a.Store.Close()
}

func (a *App) StartPomo(addPomo store.Session) (int64, error) {
	sessionId, err := a.Store.AddSession(&addPomo)
	if err != nil {
		return 0, err
	}
	a.Store.AddActivity(&store.Activity{
		Operation: int(START),
		Timestamp: addPomo.Timestamp,
		IdSession: sessionId,
	})
	return sessionId, err
}

func (a *App) GetPomos(stage string) ([]store.SessionDbRow, error) {
	return a.Store.GetSessionsByStage(stage)
}

func (a *App) GetPomoWeekReport(date string) ([]store.SessionDbRow, error) {
	return a.Store.GetWeekReport(date)
}

func (a *App) GetPomoMonthReport(date string) ([]store.SessionDbRowMonth, error) {
	return a.Store.GetMonthReport(date)
}

func (a *App) GetPomoYearReport(date string) ([]store.SessionDbRowYear, error) {
	return a.Store.GetYearReport(date)
}

func (a *App) AddActivityFromPomo(addActivity store.Activity) (int64, error) {
	_, err := a.Store.GetSessionByID(addActivity.IdSession)
	if err != nil {
		return addActivity.IdSession, err
	}
	activityId, err := a.Store.AddActivity(&store.Activity{
		Operation: addActivity.Operation,
		Timestamp: addActivity.Timestamp,
		IdSession: addActivity.IdSession,
	})
	return activityId, err
}

func (a *App) UpdatePomoSecondsLeft(updateSessionSecondsLeft UpdateSessionSecondsLeft) (bool, error) {
	return a.Store.UpdateSecondsLeft(updateSessionSecondsLeft.ID, updateSessionSecondsLeft.SecondsLeft)
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
