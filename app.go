package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/xuri/excelize/v2"
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
	return LoadInitialExcelFile()
}

func (a *App) SelectFile() string {
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{})
	if err != nil {
		return err.Error()
	}
	return file
}

// func (a *App) ImportFileFromJstoGo(blob string) {

// 	file := []byte{}

// 	if err := json.Unmarshal([]byte(file), &blob); err != nil {
// 		fmt.Println(err)
// 	}

// }

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

	// Open the Excel file using excelize
	f, err := excelize.OpenFile(tempFilePath)
	if err != nil {
		log.Fatal("Error opening Excel file:", err)
	}

	// Get the sheet names (optional)
	sheetNames := f.GetSheetList()
	fmt.Println("Sheet Names:", sheetNames)

	// Read data from the first sheet (or any other sheet)

	rows, err := f.GetRows("Wine Inventory")
	if err != nil {
		log.Fatal("Error reading rows:", err)
	}

	// Process rows (just printing for now)
	for _, row := range rows {
		fmt.Println(row) // Each row is a slice of strings (cell values)
	}

	// You can now process the data as needed, e.g., extract specific cells or process data
}
