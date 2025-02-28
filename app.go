package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"winemanagment/services"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx       context.Context
	dbService *services.DatabaseService
}

// NewApp creates a new App application struct
func NewApp(dbService *services.DatabaseService) *App {
	return &App{
		dbService: dbService,
	}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
	// err := InitializeStorage()

	// if err != nil {
	// 	runtime.LogError(a.ctx, "Storage initialization failed: "+err.Error())
	// }

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

func (a *App) DeleteWines(id []string) error {
	fmt.Println(id)
	var uintIDs []uint
	for _, idStr := range id {
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fmt.Errorf("invalid ID format: %s", idStr)
		}
		uintIDs = append(uintIDs, uint(id))
	}

	// a.dbService.DeleteWineByID(uintIDs[0])
	a.dbService.DeleteWines(uintIDs)
	return nil
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
	tmpFile, err := os.CreateTemp("", "wine-import-*.xlsx")
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Temp file creation error: %v", err))
		return
	}
	defer func() {
		tmpFile.Close()
		os.Remove(tmpFile.Name())
	}()

	// Write the content to temp file
	if _, err := tmpFile.Write(fileContent); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("File write error: %v", err))
		return
	}

	if err := tmpFile.Sync(); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("File sync error: %v", err))
		return
	}

	wines, err := ImportExcelData(tmpFile.Name())
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Import error: %v", err))
		return
	}

	if err := a.dbService.ProcessWineImport(wines); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Database error: %v", err))
		return
	}
}

func GetStoragePath() (string, error) {
	// Option 1: Store next to the executable (may require write permissions)
	exePath, err := os.Executable()
	if err != nil {
		return "", err
	}
	exeDir := filepath.Dir(exePath)
	storagePath := filepath.Join(exeDir, "storage.csv")
	return storagePath, nil
}

func (a *App) GetWines() []services.Wine {
	wines, err := a.dbService.GetAllWines()
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Error getting wines: %v", err))
		return []services.Wine{}
	}
	return wines
}

func (a *App) GetAllWineries() []services.Winery {
	wineries, err := a.dbService.GetAllWineries()
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Error getting wines: %v", err))
		return []services.Winery{}
	}
	return wineries
}

func (a *App) AddWinery(data string) (*uint, error) {
	var winery services.Winery
	if err := json.Unmarshal([]byte(data), &winery); err != nil {
		return nil, fmt.Errorf("error unmarshaling winery data: %w", err)
	}

	fmt.Println("hell!!!", winery.Name)

	_, err := a.dbService.CreateWinery(winery.Name)

	if err != nil {
		return nil, err
	}
	return &winery.ID, nil
}

func (a *App) AddWine(data string) (*uint, error) {
	var wine services.Wine
	if err := json.Unmarshal([]byte(data), &wine); err != nil {
		return nil, fmt.Errorf("error unmarshaling wine data: %w", err)
	}
	err := a.dbService.CreateWine(&wine)
	if err != nil {
		return nil, err
	}

	return &wine.ID, nil
}
