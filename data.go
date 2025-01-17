package main

import "time"

type Wine struct {
	Name            string
	Winery          string
	Varietal        string
	Description     string
	Type            string
	Year            int
	Aging           bool
	DrinkBy         *time.Time
	Price           float32
	Premium         bool
	SpecialOccasion bool
	Notes           string
	Location        *Location
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
