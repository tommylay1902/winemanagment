package main

import (
	"fmt"
	"strings"
	"time"
)

type Wine struct {
	Id              string     `json:"Id"`
	Winery          string     `json:"Winery"`
	Varietal        string     `json:"Varietal"`
	Description     string     `json:"Description"`
	Type            string     `json:"Type"`
	Year            int        `json:"Year"`
	Aging           bool       `json:"Aging"`
	DrinkBy         *time.Time `json:"DrinkBy,omitempty"`
	Price           float32    `json:"Price"`
	Premium         bool       `json:"Premium"`
	SpecialOccasion bool       `json:"SpecialOccasion"`
	Notes           string     `json:"Notes"`
	Location        *Location  `json:"Location,omitempty"`
}

func (w *Wine) String() string {
	fields := make([]string, 15) // Explicit 15 columns

	// Helper function for boolean conversion
	boolToYesNo := func(b bool) string {
		if b {
			return "Yes"
		}
		return "No"
	}

	// Map values to their positions
	fields[0] = w.Winery
	fields[1] = w.Varietal
	fields[2] = w.Description
	fields[3] = w.Type
	fields[4] = fmt.Sprintf("%d", w.Year)
	fields[5] = boolToYesNo(w.Aging)
	fields[6] = ""
	if w.DrinkBy != nil {
		fields[6] = w.DrinkBy.Format("2006-01-02")
	}
	fields[7] = fmt.Sprintf("%.2f", w.Price)
	fields[8] = boolToYesNo(w.Premium)
	fields[9] = boolToYesNo(w.SpecialOccasion)
	fields[10] = w.Notes
	fields[11] = ""
	fields[12] = ""
	fields[13] = ""
	fields[14] = ""
	if w.Location != nil {
		fields[11] = w.Location.Name
		fields[12] = w.Location.Row
		fields[13] = w.Location.Bin
		fields[14] = w.Location.Code
	}

	return strings.Join(fields, ",")
}

type Location struct {
	Name string
	Row  string
	Bin  string
	Code string
	Wine *Wine
}

type WineStorage struct {
	Name     string
	Location [][]Location
}
