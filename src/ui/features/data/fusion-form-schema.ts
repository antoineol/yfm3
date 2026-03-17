import { z } from "zod";

export const fusionFormSchema = z.object({
  materialA: z.string().min(1, "Material A is required"),
  materialB: z.string().min(1, "Material B is required"),
  resultName: z.string().min(1, "Result name is required"),
  resultAttack: z.number().int().min(0),
  resultDefense: z.number().int().min(0),
});

export type FusionFormValues = z.infer<typeof fusionFormSchema>;
