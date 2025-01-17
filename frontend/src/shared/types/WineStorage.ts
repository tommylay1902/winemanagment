import { WineLocation } from "./WineLocation";

export interface WineStorage {
  id: string;
  name: string;
  locations?: WineLocation[][];
  storageCapacity: number;
}

export function generateLocationMatrix(
  row: number,
  column: number
  // storage: string
): WineLocation[][] {
  const wineLocation = [];

  for (let i = 0; i < row; i++) {
    let wineRow: WineLocation[] = [];

    for (let j = 0; j < column; j++) {
      const wineLocation: WineLocation = {
        Name: `${j}`,
        Row: `${i}`,
        Bin: `${j}`,
        Code: `${i}${j}`,
      };
      wineRow.push(wineLocation);
    }

    wineLocation.push(wineRow);
  }

  return wineLocation;
}
