// src/schemas/wineSchema.ts
import { z } from "zod";

export const wineFormSchema = z.object({
  Winery: z.string().min(2, "Winery must be at least 2 characters"),
  Varietal: z.string().min(2, "Varietal must be at least 2 characters"),
  Description: z.string().optional(),
  Type: z.enum(["Red", "White", "Rosé", "Sparkling", "Dessert"]),
  Year: z
    .number()
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear() + 10, "Invalid future year"),
  Aging: z.boolean().default(false),
  Price: z.number().min(0, "Price cannot be negative"),
  Premium: z.boolean().default(false),
  SpecialOccasion: z.boolean().default(false),
  Notes: z.string().optional(),
  DrinkBy: z.date().nullable(),
  // Location can be added later if needed
});

// Export the type for TypeScript
export type WineFormValues = z.infer<typeof wineFormSchema>;
