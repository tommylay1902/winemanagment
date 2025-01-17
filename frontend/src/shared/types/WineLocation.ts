import { Wine } from "./Wine";

export interface WineLocation {
  Name: string;
  Row: string;
  Bin: string;
  Code: string;
  wine?: Wine;
}
