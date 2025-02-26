package main

import (
	"fmt"
	"strconv"
	"strings"
	"time"
	"winemanagment/services"

	"github.com/xuri/excelize/v2"
)

func ImportExcelData(filepath string) ([]services.Wine, error) {
	data, err := excelize.OpenFile(filepath)
	if err != nil {
		return nil, fmt.Errorf("failed to open Excel file: %w", err)
	}
	defer data.Close()

	rows, err := data.GetRows("Wine Inventory")
	if err != nil {
		return nil, fmt.Errorf("failed to get rows: %w", err)
	}

	if len(rows) < 2 {
		return nil, fmt.Errorf("no data rows found")
	}

	const (
		wineryCol          = 0
		varietalCol        = 1
		descriptionCol     = 2
		typeCol            = 3
		yearCol            = 4
		agingCol           = 5
		drinkByCol         = 6
		priceCol           = 7
		premiumCol         = 8
		specialOccasionCol = 9
		notesCol           = 10
		locationNameCol    = 11
		rowCol             = 12
		binCol             = 13
		codeCol            = 14
	)

	var wines []services.Wine

	for i, row := range rows[1:] {
		if len(row) < 15 {
			return nil, fmt.Errorf("row %d has insufficient columns", i+1)
		}

		// Parse year
		var year *int

		if strings.TrimSpace(row[yearCol]) != "" {

			y, err := strconv.Atoi(row[yearCol])
			if err != nil || y < 1900 || y > 2100 {
				return nil, fmt.Errorf("invalid year in row %d: %s", i+1, row[yearCol])
			}
			year = &y
		}

		// Parse price
		price, err := parsePrice(row[priceCol])
		if err != nil || price < 0 {
			return nil, fmt.Errorf("invalid price in row %d: %s", i+1, row[priceCol])
		}

		// Create wine with location info
		wine := services.Wine{
			Winery: &services.Winery{
				Name: row[wineryCol],
			},
			Varietal:        row[varietalCol],
			Description:     row[descriptionCol],
			Type:            row[typeCol],
			Year:            year,
			Aging:           parseBool(row[agingCol]),
			DrinkBy:         parseTime(row[drinkByCol]),
			Price:           price,
			Premium:         parseBool(row[premiumCol]),
			SpecialOccasion: parseBool(row[specialOccasionCol]),
			Notes:           row[notesCol],
			Location: &services.Location{
				Name: row[locationNameCol],
				Row:  row[rowCol],
				Bin:  row[binCol],
				Code: row[codeCol],
			},
		}

		wines = append(wines, wine)
	}

	return wines, nil
}

// Keep helper functions the same
func parsePrice(s string) (float32, error) {
	cleaned := strings.TrimSpace(s)
	cleaned = strings.ReplaceAll(cleaned, ",", "")
	cleaned = strings.TrimPrefix(cleaned, "$")
	cleaned = strings.TrimPrefix(cleaned, "€")
	cleaned = strings.TrimPrefix(cleaned, "£")

	val, err := strconv.ParseFloat(cleaned, 32)
	if err != nil {
		return 0, fmt.Errorf("invalid price format: %w", err)
	}

	price := float32(val)
	if price < 0 {
		return 0, fmt.Errorf("price cannot be negative")
	}
	return price, nil
}

func parseBool(s string) bool {
	return strings.EqualFold(s, "yes") || s == "1"
}

func parseTime(s string) *time.Time {
	if s == "" {
		return nil
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return nil
	}
	return &t
}
