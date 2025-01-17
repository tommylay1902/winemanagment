import { WineLocation } from "./WineLocation";

export interface Wine {
  Winery: string;
  Varietal: string;
  Description: string;
  Type: string;
  Year: number;
  Aging: boolean;
  DrinkBy?: string | null;
  Price: number;
  Premium: boolean;
  SpecialOccasion: boolean;
  Notes: string;
  Location?: WineLocation;
}
