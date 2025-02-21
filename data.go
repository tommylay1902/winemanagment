package main

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

type Wine struct {
	Id              int        `json:"Id"`
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
	fields := make([]string, 16) // Explicit 16 columns

	fields[0] = strconv.Itoa(w.Id)
	// Helper function for boolean conversion
	boolToYesNo := func(b bool) string {
		if b {
			return "Yes"
		}
		return "No"
	}

	// Map values to their positions
	fields[1] = w.Winery
	fields[2] = w.Varietal
	fields[3] = w.Description
	fields[4] = w.Type
	fields[5] = fmt.Sprintf("%d", w.Year)
	fields[6] = boolToYesNo(w.Aging)
	fields[7] = ""
	if w.DrinkBy != nil {
		fields[7] = w.DrinkBy.Format("2006-01-02")
	}
	fields[8] = fmt.Sprintf("%.2f", w.Price)
	fields[9] = boolToYesNo(w.Premium)
	fields[10] = boolToYesNo(w.SpecialOccasion)
	fields[11] = w.Notes
	fields[12] = ""
	fields[13] = ""
	fields[14] = ""
	fields[15] = ""
	if w.Location != nil {
		fields[12] = w.Location.Name
		fields[13] = w.Location.Row
		fields[14] = w.Location.Bin
		fields[15] = w.Location.Code
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
