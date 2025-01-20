export namespace main {
	
	export class Wine {
	    Id: string;
	    Name: string;
	    Winery: string;
	    Varietal: string;
	    Description: string;
	    Type: string;
	    Year: number;
	    Aging: boolean;
	    // Go type: time
	    DrinkBy?: any;
	    Price: number;
	    Premium: boolean;
	    SpecialOccasion: boolean;
	    Notes: string;
	    Location?: Location;
	
	    static createFrom(source: any = {}) {
	        return new Wine(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Id = source["Id"];
	        this.Name = source["Name"];
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
	export class Location {
	    Name: string;
	    Row: string;
	    Bin: string;
	    Code: string;
	    Wine?: Wine;
	
	    static createFrom(source: any = {}) {
	        return new Location(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Row = source["Row"];
	        this.Bin = source["Bin"];
	        this.Code = source["Code"];
	        this.Wine = this.convertValues(source["Wine"], Wine);
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

