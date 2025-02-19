// src/schemas/wineForm.ts
import { z } from "zod";
import { wineFormSchema } from "./zod/wineSchema";

// Type from Zod schema
export type WineFormValues = z.infer<typeof wineFormSchema>;

// Form field configuration type
export type FormFieldConfig = {
  name: keyof WineFormValues;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "date" | "textarea";
  placeholder?: string;
  options?: string[]; // For select inputs
  description?: string;
};

//,Notes,Location,Row,Bin,Code

// Form configuration using Zod schema metadata
export const formConfig: FormFieldConfig[] = [
  {
    name: "Winery",
    label: "Winery Name",
    type: "text",
    placeholder: "Enter winery name",
    description: "Official name of the winery",
  },
  {
    name: "Varietal",
    label: "Varietal",
    type: "text",
    placeholder: "Enter varietal of the wine",
    description: "Varietal of the wine",
  },
  {
    name: "Description",
    label: "Description",
    type: "text",
    placeholder: "Enter description for the wine",
    description: "Description of the wine",
  },
  {
    name: "Type",
    label: "Wine Type",
    type: "select",
    options: ["Red", "White", "Rosé", "Sparkling", "Dessert"],
    description: "Select the wine category",
  },
  {
    name: "Year",
    label: "Vintage Year",
    type: "number",
    placeholder: "2020",
    description: "Harvest year of the grapes",
  },
  {
    name: "Aging",
    label: "Requires Aging",
    type: "checkbox",
    description: "Check if the wine needs cellaring",
  },
  {
    name: "DrinkBy",
    label: "Drink Wine By",
    type: "date",
    description: "Date you would like to drink this wine by",
  },
  {
    name: "Price",
    label: "Price",
    type: "number",
    description: "Price of wine",
  },
  {
    name: "Premium",
    label: "Premium",
    type: "checkbox",
    description: "Is the wine a premium",
  },
  {
    name: "SpecialOccasion",
    label: "Special Occasion",
    type: "checkbox",
    description: "Is reserved for a special occasion",
  },
  {
    name: "Notes",
    label: "Additional Notes",
    type: "text",
    description: "Additional notes you would like to add about the wine",
  },
];
