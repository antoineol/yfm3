import { z } from "zod";

export const cardFormSchema = z.object({
  cardId: z.number({ message: "Required" }).int().min(0),
  name: z.string().min(1, "Name is required"),
  attack: z.number({ message: "Required" }).int().min(0),
  defense: z.number({ message: "Required" }).int().min(0),
  kind1: z.string().min(1, "Kind 1 is required"),
  kind2: z.string().optional(),
  kind3: z.string().optional(),
  color: z.string().optional(),
});

export type CardFormValues = z.infer<typeof cardFormSchema>;
