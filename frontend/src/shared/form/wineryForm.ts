// src/schemas/wineForm.ts

import { WineryFormValues } from "./zod/winerySchema";

// Type from Zod schema

// Form field configuration type
export type WineryFormFieldConfig = {
  name: keyof WineryFormValues;
  label: string;
  type: "text";
  placeholder?: string;
  options?: string[]; // For select inputs
  description?: string;
};

// Form configuration using Zod schema metadata
export const wineryFormConfig: WineryFormFieldConfig[] = [
  {
    name: "name",
    label: "Winery Name",
    type: "text",
    placeholder: "Enter winery name",
    description: "Official name of the winery",
  },
];
