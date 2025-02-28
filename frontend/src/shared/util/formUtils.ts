// src/shared/util/formUtils.ts

import { FormFieldConfig } from "../form/wineForm"; // Import your config type
// Type guard for numeric fields
export const isNumberField = (
  field: FormFieldConfig
): field is FormFieldConfig & { type: "number" } => {
  return field.type === "number";
};

// Type-safe value converter
export const getInputValue = (
  value: unknown,
  type: FormFieldConfig["type"]
): string => {
  if (value === null || value === undefined) return "";
  if (type === "number") return value.toString();
  return String(value);
};

export const getWineryInputValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

// Optional: Generic change handler
export const handleFieldChange = (
  field: FormFieldConfig,
  value: string
): unknown => {
  if (isNumberField(field)) {
    const numericValue = Number(value);
    return isNaN(numericValue) ? 0 : numericValue;
  }
  return value;
};
