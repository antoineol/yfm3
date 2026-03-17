import { z } from "zod";
import { MAX_CARD_ID } from "../../../engine/types/constants.ts";

const cardIdSchema = z.number().int().min(0).max(MAX_CARD_ID - 1);

export const importExportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  collection: z.array(cardIdSchema),
  deck: z.array(cardIdSchema),
});

export type ImportExportData = z.infer<typeof importExportSchema>;
