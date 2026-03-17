"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { buildGoogleAuth } from "./googleAuth";
import { referenceCardFields, referenceFusionFields } from "./schema";
import {
  appendRow,
  deleteRow,
  findCardRow,
  findFusionRow,
  updateRow,
} from "./sheetsWriter";

// --- Actions: dual-write to Sheets then Convex ---

export const createCard = action({
  args: referenceCardFields,
  handler: async (ctx, args) => {
    await requireActionAuth(ctx);
    const { spreadsheetId, auth } = getSheetsConfig();
    const existing = await findCardRow(spreadsheetId, auth, args.name);
    if (existing) throw new Error(`Card "${args.name}" already exists in sheet`);
    await appendRow(spreadsheetId, auth, "Cards!A:H", cardToRow(args));
    await ctx.runMutation(internal.referenceData.insertCard, args);
  },
});

export const updateCard = action({
  args: { ...referenceCardFields, originalName: v.string() },
  handler: async (ctx, { originalName, ...fields }) => {
    await requireActionAuth(ctx);
    const { spreadsheetId, auth } = getSheetsConfig();
    const row = await findCardRow(spreadsheetId, auth, originalName);
    if (!row) throw new Error(`Card "${originalName}" not found in sheet`);
    await updateRow(spreadsheetId, auth, `Cards!A${row}:H${row}`, cardToRow(fields));
    await ctx.runMutation(internal.referenceData.patchCard, fields);
  },
});

export const deleteCard = action({
  args: { cardId: v.number(), name: v.string() },
  handler: async (ctx, { cardId, name }) => {
    await requireActionAuth(ctx);
    const { spreadsheetId, auth } = getSheetsConfig();
    const row = await findCardRow(spreadsheetId, auth, name);
    if (!row) throw new Error(`Card "${name}" not found in sheet`);
    await deleteRow(spreadsheetId, auth, "Cards", row);
    await ctx.runMutation(internal.referenceData.deleteCard, { cardId });
  },
});

export const createFusion = action({
  args: referenceFusionFields,
  handler: async (ctx, args) => {
    await requireActionAuth(ctx);
    const { spreadsheetId, auth } = getSheetsConfig();
    const existing = await findFusionRow(spreadsheetId, auth, args.materialA, args.materialB);
    if (existing) throw new Error(`Fusion ${args.materialA} + ${args.materialB} already exists`);
    await appendRow(spreadsheetId, auth, "Fusions!A:E", fusionToRow(args));
    await ctx.runMutation(internal.referenceData.insertFusion, args);
  },
});

export const updateFusion = action({
  args: {
    ...referenceFusionFields,
    originalMaterialA: v.string(),
    originalMaterialB: v.string(),
  },
  handler: async (ctx, { originalMaterialA, originalMaterialB, ...fields }) => {
    await requireActionAuth(ctx);
    const { spreadsheetId, auth } = getSheetsConfig();
    const row = await findFusionRow(spreadsheetId, auth, originalMaterialA, originalMaterialB);
    if (!row) throw new Error(`Fusion ${originalMaterialA} + ${originalMaterialB} not found`);
    await updateRow(spreadsheetId, auth, `Fusions!A${row}:E${row}`, fusionToRow(fields));
    await ctx.runMutation(internal.referenceData.patchFusion, {
      originalMaterialA,
      originalMaterialB,
      ...fields,
    });
  },
});

export const deleteFusion = action({
  args: { materialA: v.string(), materialB: v.string() },
  handler: async (ctx, { materialA, materialB }) => {
    await requireActionAuth(ctx);
    const { spreadsheetId, auth } = getSheetsConfig();
    const row = await findFusionRow(spreadsheetId, auth, materialA, materialB);
    if (!row) throw new Error(`Fusion ${materialA} + ${materialB} not found in sheet`);
    await deleteRow(spreadsheetId, auth, "Fusions", row);
    await ctx.runMutation(internal.referenceData.deleteFusion, { materialA, materialB });
  },
});

// --- Helpers ---

async function requireActionAuth(ctx: { auth: { getUserIdentity: () => Promise<unknown | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
}

function getSheetsConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE ?? "";
  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID_REFERENCE");
  return { spreadsheetId, auth: buildGoogleAuth() };
}

type CardFields = {
  cardId: number;
  name: string;
  attack: number;
  defense: number;
  kind1?: string;
  kind2?: string;
  kind3?: string;
  color?: string;
};

// Column order must match the sheet: A=id, B=name, C=kind1, D=kind2, E=kind3, F=attack, G=defense, H=color
function cardToRow(c: CardFields): string[] {
  return [
    String(c.cardId),
    c.name,
    c.kind1 ?? "",
    c.kind2 ?? "",
    c.kind3 ?? "",
    String(c.attack),
    String(c.defense),
    c.color ?? "",
  ];
}

type FusionFields = {
  materialA: string;
  materialB: string;
  resultName: string;
  resultAttack: number;
  resultDefense: number;
};

function fusionToRow(f: FusionFields): string[] {
  return [f.materialA, f.materialB, f.resultName, String(f.resultAttack), String(f.resultDefense)];
}
