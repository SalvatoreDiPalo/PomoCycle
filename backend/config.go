package backend

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"os"

	"github.com/wailsapp/wails/v2/pkg/logger"

	"github.com/adrg/xdg"
)

type ConfigStore struct {
	configPath string
	fileName   string
	Logger     logger.Logger
}

type AppState struct {
	FocusTime      uint8  `json:"focusTime"`
	ShortBreakTime uint8  `json:"shortBreakTime"`
	LongBreakTime  uint8  `json:"longBreakTime"`
	Rounds         uint8  `json:"rounds"`
	Volume         uint8  `json:"volume"`
	Theme          string `json:"theme"`
	AlarmSound     string `json:"alarmSound"`
}

func NewConfigStore(logger logger.Logger, folderName string, fileName string) (*ConfigStore, error) {
	configFilePath, err := xdg.ConfigFile(folderName)
	if err != nil {
		logger.Error(fmt.Sprintf("could not resolve path for config file: %v", err))
		return nil, fmt.Errorf("could not resolve path for config file: %w", err)
	}

	return &ConfigStore{
		configPath: configFilePath,
		Logger:     logger,
		fileName:   fileName,
	}, nil
}

func (s *ConfigStore) GetConfig(defaultValue AppState) (AppState, error) {
	_, err := os.Stat(s.configPath + string(os.PathSeparator) + s.fileName)
	if os.IsNotExist(err) {
		s.Logger.Error(fmt.Sprintf("could not find config file: %v", err))
		return defaultValue, nil
	}
	buf, err := fs.ReadFile(os.DirFS(s.configPath), s.fileName)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("could not read the configuration file: %v", err))
		return defaultValue, fmt.Errorf("could not read the configuration file: %w", err)
	}
	var appState AppState
	err = json.Unmarshal([]byte(buf), &appState)
	return appState, err
}

func (s *ConfigStore) SetConfig(value AppState) error {
	err := os.MkdirAll(s.configPath, 0755)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("could not create the configuration directory: %v", err))
		return fmt.Errorf("could not create the configuration directory: %w", err)
	}
	data, _ := json.Marshal(&value)
	err = os.WriteFile(s.configPath+string(os.PathSeparator)+s.fileName, []byte(data), 0644)
	if err != nil {
		s.Logger.Error(fmt.Sprintf("could not write the configuration file: %v", err))
		return fmt.Errorf("could not write the configuration file: %w", err)
	}
	return nil
}
