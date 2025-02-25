export namespace services {
	
	export class Location {
	    ID: number;
	    // Go type: time
	    CreatedAt: any;
	    // Go type: time
	    UpdatedAt: any;
	    // Go type: gorm
	    DeletedAt: any;
	    Name: string;
	    Row: string;
	    Bin: string;
	    Code: string;
	
	    static createFrom(source: any = {}) {
	        return new Location(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CreatedAt = this.convertValues(source["CreatedAt"], null);
	        this.UpdatedAt = this.convertValues(source["UpdatedAt"], null);
	        this.DeletedAt = this.convertValues(source["DeletedAt"], null);
	        this.Name = source["Name"];
	        this.Row = source["Row"];
	        this.Bin = source["Bin"];
	        this.Code = source["Code"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Wine {
	    ID: number;
	    // Go type: time
	    CreatedAt: any;
	    // Go type: time
	    UpdatedAt: any;
	    // Go type: gorm
	    DeletedAt: any;
	    Winery: string;
	    Varietal: string;
	    Description: string;
	    Type: string;
	    Year?: number;
	    Aging: boolean;
	    // Go type: time
	    DrinkBy?: any;
	    Price: number;
	    Premium: boolean;
	    SpecialOccasion: boolean;
	    Notes: string;
	    LocationID?: number;
	    Location?: Location;
	
	    static createFrom(source: any = {}) {
	        return new Wine(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CreatedAt = this.convertValues(source["CreatedAt"], null);
	        this.UpdatedAt = this.convertValues(source["UpdatedAt"], null);
	        this.DeletedAt = this.convertValues(source["DeletedAt"], null);
	        this.Winery = source["Winery"];
	        this.Varietal = source["Varietal"];
	        this.Description = source["Description"];
	        this.Type = source["Type"];
	        this.Year = source["Year"];
	        this.Aging = source["Aging"];
	        this.DrinkBy = this.convertValues(source["DrinkBy"], null);
	        this.Price = source["Price"];
	        this.Premium = source["Premium"];
	        this.SpecialOccasion = source["SpecialOccasion"];
	        this.Notes = source["Notes"];
	        this.LocationID = source["LocationID"];
	        this.Location = this.convertValues(source["Location"], Location);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

