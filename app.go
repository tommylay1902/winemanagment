package main

import (
	"context"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
	err := InitializeStorage()
	if err != nil {
		runtime.LogError(a.ctx, "Storage initialization failed: "+err.Error())
	}

}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

func (a *App) GetWines() []Wine {
	// wines, _ := createWineDataWithLocationFromCSV("./resources/storage.csv")
	// fmt.Println(len(wines))
	// return wines
	path, err := GetStoragePath()
	if err != nil {
		fmt.Println("Error getting storage path:", err)
		return []Wine{}
	}
	wines, _ := createWineDataWithLocationFromCSV(path)

	return wines
}

func (a *App) SelectFile() string {
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{})
	if err != nil {
		return err.Error()
	}
	return file
}

func (a *App) ImportFileFromJstoGo(blob string) {
	// Decode the base64 string to byte slice
	fileContent, err := base64.StdEncoding.DecodeString(blob)
	if err != nil {
		fmt.Println("Error decoding base64:", err)
		return
	}

	// Save the file to a temporary location as .xlsx
	tempFilePath := "/tmp/uploaded_file.xlsx"
	err = os.WriteFile(tempFilePath, fileContent, 0644)
	if err != nil {
		fmt.Println("Error saving file:", err)
		return
	}
	defer os.Remove(tempFilePath) // Clean up the temp file after processing

	storagePath, err := GetStoragePath()
	if err != nil {
		runtime.LogError(a.ctx, "Path error: "+err.Error())
		return
	}
	// Pass correct storage path to converter
	ConvertExcelImportToStorage(tempFilePath, storagePath)
}

func (a *App) AddWine(data string) error {
	// fmt.Println(data)
	wine := Wine{}
	json.Unmarshal([]byte(data), &wine)
	fmt.Println("printing", wine)
	path, _ := GetStoragePath()
	file, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close()
	writer := csv.NewWriter(file)
	defer writer.Flush()
	wineArr := strings.Split(wine.String(), ",")

	err = writer.Write(wineArr)

	return err

}

func GetStoragePath() (string, error) {
	// Option 1: Store next to the executable (may require write permissions)
	exePath, err := os.Executable()
	if err != nil {
		return "", err
	}
	exeDir := filepath.Dir(exePath)
	storagePath := filepath.Join(exeDir, "storage.csv")

	// Option 2: Use user-specific storage (recommended for writable files)
	// usr, _ := user.Current()
	// storagePath = filepath.Join(usr.HomeDir, ".yourapp", "storage.csv")
	return storagePath, nil
}

func InitializeStorage() error {
	path, err := GetStoragePath()
	if err != nil {
		return err
	}

	// Create directory if using user-specific storage
	// os.MkdirAll(filepath.Dir(path), 0755)

	if _, err := os.Stat(path); os.IsNotExist(err) {
		file, err := os.Create(path)
		if err != nil {
			return err
		}
		defer file.Close()
	}
	return nil
}
