package backend

import (
	"log"
	"os"

	"github.com/adrg/xdg"
	"github.com/wailsapp/wails/v2/pkg/logger"
)

// FileLogger is a utility to log messages to a number of destinations
type FileLogger struct {
	filename string
}

// NewFileLogger creates a new Logger.
func NewFileLogger(filename string) logger.Logger {
	return &FileLogger{
		filename: filename,
	}
}

// Print works like Sprintf.
func (l *FileLogger) Print(message string) {
	dbFilePath, err := xdg.ConfigFile("pomodoro-cycle" + string(os.PathSeparator) + "logs" + string(os.PathSeparator) + l.filename)
	if err != nil {
		log.Fatal(err)
	}
	f, err := os.OpenFile(dbFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}
	myLog := log.New(f, "wails_", log.Ldate|log.Ltime|log.Lshortfile)

	myLog.SetPrefix("wails_")

	myLog.Print(message)

	f.Close()
}

func (l *FileLogger) Println(message string) {
	l.Print(message + "\n")
}

// Trace level logging. Works like Sprintf.
func (l *FileLogger) Trace(message string) {
	l.Println("TRACE | " + message)
}

// Debug level logging. Works like Sprintf.
func (l *FileLogger) Debug(message string) {
	l.Println("DEBUG | " + message)
}

// Info level logging. Works like Sprintf.
func (l *FileLogger) Info(message string) {
	l.Println("INFO  | " + message)
}

// Warning level logging. Works like Sprintf.
func (l *FileLogger) Warning(message string) {
	l.Println("WARN  | " + message)
}

// Error level logging. Works like Sprintf.
func (l *FileLogger) Error(message string) {
	l.Println("ERROR | " + message)
}

// Fatal level logging. Works like Sprintf.
func (l *FileLogger) Fatal(message string) {
	l.Println("FATAL | " + message)
	os.Exit(1)
}
