import { z } from "zod";

export const wineryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

// Export the type for TypeScript
export type WineryFormValues = z.infer<typeof wineryFormSchema>;
