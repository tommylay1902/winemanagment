package main

import (
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"
)

// columns hardcoded as in the order of them matter, find dynamic way in the future
func LoadInitialExcelFile() []Wine {
	data, err := excelize.OpenFile("./Wine Inventory-1-4.xlsx")

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

	if err != nil {
		fmt.Println(err)
		return nil
	}

	for i, row := range rows {
		if i == 0 {
			continue
		}
		currWine := Wine{}
		wineValue := reflect.ValueOf(&currWine).Elem()
		for j, cellValue := range row {
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
		}

		wines = append(wines, currWine)
	}

	return wines
}
