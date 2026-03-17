# P9: Reference Data CRUD UI with Google Sheets Write-Back

**Priority:** P9 — CRUD management for cards and fusions reference data.

**Depends on:** P7 (shared reference data pipeline).

## Scope

Add a `#data` tab with full CRUD (create, edit, delete) for cards and fusions. Each mutation dual-writes to both Convex and Google Sheets (row-level operations).

## Design Decisions

- **Dual write order:** Sheets first, then Convex mutation. If Sheets succeeds but Convex fails, "Sync from Google Sheets" recovers. If Sheets fails, nothing changes.
- **Row lookup:** Cards keyed by name (column B) since some cards lack a cardId. Fusions keyed by materialA + materialB.
- **Row deletion:** Uses `spreadsheets.batchUpdate` with `deleteDimension` to physically remove rows.
- **Auth scopes:** Upgraded from `spreadsheets.readonly` to `spreadsheets` (read+write). Service account needs Editor access on the sheet.
- **Access:** Any authenticated user can edit (no admin role).
- **UI:** New `#data` tab with ToggleGroup (Cards / Fusions), table views, Dialog forms for create/edit.

## Files Changed or Created

| Action | File |
|--------|------|
| Modify | `convex/schema.ts` — add `by_cardId` and `by_materials` indexes |
| Create | `convex/googleAuth.ts` — shared `buildGoogleAuth` |
| Modify | `convex/syncReferenceData.ts` — import shared auth |
| Create | `convex/sheetsWriter.ts` — row-level Sheets CRUD helpers |
| Create | `convex/referenceDataCrud.ts` — CRUD actions |
| Modify | `convex/referenceData.ts` — single-row internal mutations |
| Create | `src/ui/features/data/card-form-schema.ts` |
| Create | `src/ui/features/data/fusion-form-schema.ts` |
| Create | `src/ui/features/data/DataPanel.tsx` |
| Create | `src/ui/features/data/CardsTable.tsx` |
| Create | `src/ui/features/data/FusionsTable.tsx` |
| Create | `src/ui/features/data/CardFormDialog.tsx` |
| Create | `src/ui/features/data/FusionFormDialog.tsx` |
| Modify | `src/ui/App.tsx` — add `#data` tab |
| Modify | `src/ui/features/auth/Header.tsx` — add Data tab link |
| Create | `tests/convex/sheetsWriter.test.ts` |
| Create | `tests/ui/card-form-schema.test.ts` |
| Create | `tests/ui/fusion-form-schema.test.ts` |

## Exit Criteria

- `#data` tab shows cards and fusions tables with create/edit/delete.
- Each CRUD operation writes to both Convex and Google Sheets.
- Existing "Sync from Google Sheets" still works for recovery.
- All tests pass, typecheck and lint clean.
