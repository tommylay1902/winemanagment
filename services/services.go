package services

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DatabaseService struct {
	db *gorm.DB
}

type Wine struct {
	gorm.Model
	Winery          string `gorm:"not null"`
	Varietal        string `gorm:"not null"`
	Description     string
	Type            string `gorm:"not null"`
	Year            *int
	Aging           bool `gorm:"default:false"`
	DrinkBy         *time.Time
	Price           float32 `gorm:"check:price >= 0"`
	Premium         bool    `gorm:"default:false"`
	SpecialOccasion bool    `gorm:"default:false"`
	Notes           string
	LocationID      *uint
	Location        *Location `gorm:"foreignKey:LocationID"`
}

type Location struct {
	gorm.Model
	Name string // Allow nulls
	Row  string // Allow nulls
	Bin  string // Allow nulls
	Code string
	// WineID *uint `gorm:"uniqueIndex"` // Existing unique constraint
	// Wine   *Wine `gorm:"foreignKey:WineID"`
}

type WineStorage struct {
	gorm.Model
	Name      string
	Locations []Location `gorm:"many2many:wine_storage_locations;"`
}

func NewDatabaseService() (*DatabaseService, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get config directory: %w", err)
	}

	appDir := filepath.Join(configDir, "winemanagment")
	fmt.Println("HELLOOOOOO", appDir)
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create app directory: %w", err)
	}

	dbPath := filepath.Join(appDir, "database.db")

	// Configure GORM with SQLite
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	// drop table logic if we are updating schema
	// err = db.Migrator().DropTable(&Wine{}, &Location{}, &WineStorage{})
	// if err != nil {
	// 	return nil, err
	// }

	// Auto migrate schema
	err = db.AutoMigrate(&Wine{}, &Location{}, &WineStorage{})
	if err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}
	//generate unique constraint if name, row, bin are all not null
	err = db.Exec(`
	CREATE UNIQUE INDEX IF NOT EXISTS idx_location_unique_grid 
	ON locations(name, row, bin) 
	WHERE name IS NOT NULL 
	  AND row IS NOT NULL 
	  AND bin IS NOT NULL
	`).Error

	if err != nil {
		return nil, fmt.Errorf("failed to create unique index: %w", err)
	}

	// Set connection pool settings
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get generic database object: %w", err)
	}
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return &DatabaseService{db: db}, nil
}

func (s *DatabaseService) GetAllWines() ([]Wine, error) {
	var wines []Wine
	result := s.db.Preload("Location").Find(&wines)

	return wines, result.Error
}

func (s *DatabaseService) CreateWine(wine *Wine) error {
	return s.db.Create(wine).Error
}

func (s *DatabaseService) CreateWines(wines []Wine) error {

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Batch size for efficient inserts (adjust based on your needs)
		const batchSize = 50

		// Pre-create all locations first to get their IDs
		for i := range wines {
			if wines[i].Location != nil {
				// Create or update location based on unique code
				result := tx.Where(Location{Code: wines[i].Location.Code}).
					Assign(*wines[i].Location).
					FirstOrCreate(wines[i].Location)

				if result.Error != nil {
					return fmt.Errorf("location error: %w", result.Error)
				}
				wines[i].LocationID = &wines[i].Location.ID
			}
		}

		// Batch create wines with locations
		if err := tx.CreateInBatches(wines, batchSize).Error; err != nil {
			return fmt.Errorf("wine creation error: %w", err)
		}

		return nil
	})
}

func (s *DatabaseService) DeleteWineByID(id uint) error {
	return s.db.Delete(&Wine{}, id).Error
}
func (s *DatabaseService) DeleteWines(ids []uint) error {
	return s.db.Where("id IN ?", ids).Delete(&Wine{}).Error
}

func (s *DatabaseService) ProcessWineImport(wines []Wine) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// First create all locations
		locationCache := make(map[string]uint)

		// Process locations first
		for i := range wines {
			if loc := wines[i].Location; loc != nil {
				// Create consistent key for Storage with empty row/bin
				locKey := fmt.Sprintf("%s|%s|%s",
					loc.Name,
					loc.Row,
					loc.Bin,
				)

				// Check if location exists
				if locID, exists := locationCache[locKey]; exists {
					wines[i].LocationID = &locID
					wines[i].Location = nil
				} else {
					// Find or create location
					var existingLoc Location
					err := tx.Where(
						"name = ? AND COALESCE(row, '') = ? AND COALESCE(bin, '') = ?",
						loc.Name,
						loc.Row,
						loc.Bin,
					).First(&existingLoc).Error

					if err == nil {
						locationCache[locKey] = existingLoc.ID
						wines[i].LocationID = &existingLoc.ID
						wines[i].Location = nil
					} else {
						if err := tx.Create(loc).Error; err != nil {
							return err
						}
						locationCache[locKey] = loc.ID
						wines[i].LocationID = &loc.ID
					}
				}
			}
		}

		// Now create wines in batches
		const batchSize = 50
		return tx.CreateInBatches(wines, batchSize).Error
	})
}
func (s *DatabaseService) Close() error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
