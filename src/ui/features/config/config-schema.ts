import type { FunctionArgs } from "convex/server";
import { z } from "zod";
import type { api } from "../../../../convex/_generated/api.js";
import { DECK_SIZE, HAND_SIZE, MAX_FUSION_DEPTH } from "../../../engine/types/constants.ts";

export const configSchema = z.object({
  deckSize: z.number().int().min(HAND_SIZE).max(DECK_SIZE),
  fusionDepth: z.number().int().min(1).max(MAX_FUSION_DEPTH),
  useEquipment: z.boolean(),
  terrain: z.number().int().min(0).max(6),
});

export type ConfigFormValues = z.infer<typeof configSchema>;

// Compile-time assertion: ConfigFormValues must match the Convex mutation args.
// If a config field is added/renamed in the Convex schema, this line will error.
type MutationArgs = Required<
  Pick<
    FunctionArgs<typeof api.userModSettings.updateModSettings>,
    "deckSize" | "fusionDepth" | "useEquipment" | "terrain"
  >
>;
type AssertEqual<T, U> = [T] extends [U] ? ([U] extends [T] ? true : never) : never;
const _sync: AssertEqual<ConfigFormValues, MutationArgs> = true;
void _sync;
