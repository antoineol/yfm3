import { v, type Infer } from "convex/values";

export const handSourceModeValidator = v.union(v.literal("all"), v.literal("deck"));

export type HandSourceMode = Infer<typeof handSourceModeValidator>;
