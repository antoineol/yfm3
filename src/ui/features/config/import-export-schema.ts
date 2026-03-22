import { z } from "zod";
import { MAX_CARD_ID } from "../../../engine/types/constants.ts";

const cardIdSchema = z
  .number()
  .int()
  .min(0)
  .max(MAX_CARD_ID - 1);

export const importExportSchema = z.union([
  // v2: includes mod field
  z.object({
    version: z.literal(2),
    exportedAt: z.string(),
    mod: z.string(),
    collection: z.array(cardIdSchema),
    deck: z.array(cardIdSchema),
  }),
  // v1: no mod field — treated as "rp"
  z.object({
    version: z.literal(1),
    exportedAt: z.string(),
    collection: z.array(cardIdSchema),
    deck: z.array(cardIdSchema),
  }),
]);

export type ImportExportData = z.infer<typeof importExportSchema>;
