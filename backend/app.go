package backend

import (
	"context"
	"fmt"
	"pomodoro/backend/store"

	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx    context.Context
	Store  *store.Store
	Logger logger.Logger
	Config ConfigStore
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

type DaysReport struct {
	DaysAccessed    uint16 `json:"daysAccessed"`
	SecondsFocussed uint32 `json:"secondsFocussed"`
	DaysStreak      uint16 `json:"daysStreak"`
}

// NewApp creates a new App application struct
func NewApp(logger logger.Logger, config ConfigStore) *App {
	return &App{
		Logger: logger,
		Config: config,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.Store = store.New(ctx)
	a.updateWindowTheme()
}

func (a *App) Shutdown(ctx context.Context) {
	a.Store.Close()
}

func (a *App) StartPomo(addPomo store.Session) (int64, error) {
	sessionId, err := a.Store.AddSession(&addPomo)
	if err != nil {
		return 0, err
	}
	return sessionId, err
}

func (a *App) GetDaysReport() (DaysReport, error) {
	daysAccessed, err := a.Store.GetDaysAccessedByStage()
	if err != nil {
		a.Logger.Error("Error reading days accessed")
	}
	daysStreak, err := a.Store.GetDaysStreak()
	if err != nil {
		a.Logger.Error("Error reading days streak")
	}
	secondsFocussed, err := a.Store.GetSecondsFocussed()

	return DaysReport{
		DaysAccessed:    daysAccessed,
		DaysStreak:      daysStreak,
		SecondsFocussed: secondsFocussed,
	}, err
}

func (a *App) GetPomoWeekReport(date string) (store.ResponseByDate, error) {
	return a.Store.GetWeekReport(date)
}

func (a *App) GetPomoMonthReport(date string) (store.ResponseByDate, error) {
	return a.Store.GetMonthReport(date)
}

func (a *App) GetPomoYearReport(date string) (store.ResponseByDate, error) {
	return a.Store.GetYearReport(date)
}

func (a *App) UpdatePomoSecondsLeft(updateSessionSecondsLeft UpdateSessionSecondsLeft) (bool, error) {
	return a.Store.UpdateSecondsLeft(updateSessionSecondsLeft.ID, updateSessionSecondsLeft.SecondsLeft)
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) updateWindowTheme() {
	authState, err := a.Config.GetConfig(AppState{
		Theme: "light",
	})
	if err != nil {
		a.Logger.Error("Could not load configuration file on startup")
	}
	a.Logger.Debug("Loading window theme mode")
	if authState.Theme == "dark" {
		runtime.WindowSetDarkTheme(a.ctx)
	} else {
		runtime.WindowSetLightTheme(a.ctx)
	}
}
