package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"
)

func ImportExcelData() []Wine {
	data, err := excelize.OpenFile("./storage.csv")

	if err != nil {
		fmt.Println(err)
		return nil
	}

	defer func() {
		if err := data.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	rows, err := data.GetRows("Wine Inventory")
	if err != nil {
		fmt.Println(err)
		return nil
	}
	return createWineDataWithLocation(rows)
}

func createWineDataWithLocation(rows [][]string) []Wine {
	var wines []Wine

	wineKeyLookup := map[int]string{
		0:  "Winery",
		1:  "Varietal",
		2:  "Description",
		3:  "Type",
		4:  "Year",
		5:  "Aging",
		6:  "DrinkBy",
		7:  "Price",
		8:  "Premium",
		9:  "SpecialOccasion",
		10: "Notes",
	}

	locationKeyLookup := map[int]string{
		11: "Name",
		12: "Row",
		13: "Bin",
		14: "Code",
	}

	for i, row := range rows {
		if i == 0 {
			continue
		}
		currWine := Wine{}
		currLocation := Location{}
		wineValue := reflect.ValueOf(&currWine).Elem()
		locValue := reflect.ValueOf(&currLocation).Elem()
		for j, cellValue := range row {
			if j <= 10 {
				fieldName, ok := wineKeyLookup[j]
				if !ok {
					continue
				}
				field := wineValue.FieldByName(fieldName)

				if field.IsValid() && field.CanSet() {
					if field.Kind() == reflect.String {
						field.SetString(cellValue)
					} else if field.Kind() == reflect.Bool {
						if cellValue == "Yes" {
							field.SetBool(true)
						} else {
							field.SetBool(false)
						}
					} else if field.Kind() == reflect.Int {
						i, err := strconv.ParseInt(cellValue, 10, 64)
						if err != nil {
							fmt.Println(err)
							return nil
						}
						field.SetInt(i)
					} else if field.Kind() == reflect.Float32 {
						//ask in the future to just get rid of dollar sign from excel
						f, err := strconv.ParseFloat(strings.TrimPrefix(strings.TrimSpace(cellValue), "$"), 64)
						if err != nil {
							fmt.Println(err)
							return nil
						}
						field.SetFloat(f)
					} else if field.Type() == reflect.TypeOf(&time.Time{}) && cellValue != "" {
						layout := "2006-01-02"
						t, err := time.Parse(layout, cellValue)
						if err != nil {
							fmt.Print(err)
							return nil
						}
						field.Set(reflect.ValueOf(&t))
					}
				}
			} else {
				fieldName, ok := locationKeyLookup[j]
				if !ok {
					continue
				}

				field := locValue.FieldByName(fieldName)

				if field.Kind() == reflect.String {
					field.SetString(cellValue)
				}
			}
		}
		currWine.Id = i
		currWine.Location = &currLocation
		wines = append(wines, currWine)
	}

	return wines
}

func createWineDataWithLocationFromCSV(csvFilePath string) ([]Wine, error) {
	// Open the CSV file
	file, err := os.Open(csvFilePath)
	if err != nil {
		return nil, fmt.Errorf("error opening CSV file: %w", err)
	}
	defer file.Close()

	// Create a new CSV reader
	reader := csv.NewReader(file)

	// Read all rows from the CSV
	rows, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("error reading CSV file: %w", err)
	}

	// If CSV is empty, return an empty slice
	if len(rows) == 0 {
		return nil, fmt.Errorf("CSV file is empty")
	}

	var wines []Wine

	// Column index mappings
	wineKeyLookup := map[int]string{
		0:  "Id",
		1:  "Winery",
		2:  "Varietal",
		3:  "Description",
		4:  "Type",
		5:  "Year",
		6:  "Aging",
		7:  "DrinkBy",
		8:  "Price",
		9:  "Premium",
		10: "SpecialOccasion",
		11: "Notes",
	}

	locationKeyLookup := map[int]string{
		12: "Name",
		13: "Row",
		14: "Bin",
		15: "Code",
	}

	// Iterate over the rows (skip header)
	for i, row := range rows {
		if i == 0 {
			continue
		}

		currWine := Wine{}
		currLocation := Location{}
		wineValue := reflect.ValueOf(&currWine).Elem()
		locValue := reflect.ValueOf(&currLocation).Elem()

		for j, cellValue := range row {
			cellValue = strings.TrimSpace(cellValue) // Clean up whitespace

			// Process Wine attributes
			if j <= 10 {
				fieldName, ok := wineKeyLookup[j]
				if !ok {
					continue
				}
				field := wineValue.FieldByName(fieldName)

				if field.IsValid() && field.CanSet() {
					switch field.Kind() {
					case reflect.String:
						field.SetString(cellValue)
					case reflect.Bool:
						field.SetBool(strings.EqualFold(cellValue, "Yes"))
					case reflect.Int:
						if cellValue != "" {
							i, err := strconv.Atoi(cellValue)
							if err != nil {
								fmt.Println("Error parsing int:", err)
								return nil, err
							}
							field.SetInt(int64(i))
						}
					case reflect.Float32:
						if cellValue != "" {
							cleaned := strings.TrimSpace(cellValue)
							cleaned = strings.TrimPrefix(cleaned, "$")
							cleaned = strings.ReplaceAll(cleaned, ",", "")
							f, err := strconv.ParseFloat(cleaned, 64)
							if err != nil {
								fmt.Println("Error parsing float:", err)
								return nil, err
							}
							field.SetFloat(f)
						}
					default:
						if field.Type() == reflect.TypeOf(&time.Time{}) && cellValue != "" {
							layout := "2006-01-02"
							t, err := time.Parse(layout, cellValue)
							if err != nil {
								fmt.Println("Error parsing date:", err)
								return nil, err
							}
							field.Set(reflect.ValueOf(&t))
						}
					}
				}
			} else {
				// Process Location attributes
				fieldName, ok := locationKeyLookup[j]
				if !ok {
					continue
				}

				field := locValue.FieldByName(fieldName)
				if field.IsValid() && field.CanSet() && field.Kind() == reflect.String {
					field.SetString(cellValue)
				}
			}
		}

		// Assign a unique ID to the wine entry
		currWine.Location = &currLocation
		wines = append(wines, currWine)
	}

	return wines, nil
}

func LoadInitialExcelFile() []Wine {
	return []Wine{}
}

func ConvertExcelImportToStorage(tempFilePath string, storagePath string) {
	// Open the Excel file using excelize
	f, err := excelize.OpenFile(tempFilePath)
	if err != nil {
		log.Fatal("Error opening Excel file:", err)
	}

	// Get the sheet names (optional)
	sheetName := "Wine Inventory"
	//CATCH ERR LATER
	rows, _ := f.GetRows(sheetName)

	// Open a CSV file to write
	// csvFilePath := "./resources/storage.csv"
	csvFile, err := os.Create(storagePath)
	if err != nil {
		log.Fatal("Error creating CSV file:", err)
	}
	defer csvFile.Close()

	// Create a CSV writer
	writer := csv.NewWriter(csvFile)
	defer writer.Flush()

	// Write each row from Excel to CSV
	for i, row := range rows {
		if i == 0 {
			continue
		}

		//research more efficient method down the road
		row := append([]string{strconv.Itoa(i)}, row...)
		if err := writer.Write(row); err != nil {
			log.Fatal("Error writing to CSV:", err)
		}
	}
}
