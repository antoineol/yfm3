# P8: Read Fusions From Google Sheets

**Priority:** P8 - Replace the static fusion CSV source with a Google Sheets-backed import.

**Depends on:** P7 (shared reference architecture and permissions model).

**Why:** The current fusion dataset is still read from `data/rp-fusions1.csv`. That prevents quick shared updates and makes newly discovered fusions slow to propagate. This step moves the fusion source of truth to Google Sheets, using a backend import path suitable for Vercel deployment.

## Target Source

Current spreadsheet URL provided by the user:

`https://docs.google.com/spreadsheets/d/1PeMYRAHY8BE0bxC2XTFSY8nBwBunfZ3b/edit`

Derived spreadsheet ID:

`1PeMYRAHY8BE0bxC2XTFSY8nBwBunfZ3b`

I could not verify the workbook contents from the current environment, so this plan assumes the spreadsheet either already contains a `Fusions` tab or can be extended to add one.

## Decision

Do not have the browser call Google Sheets directly.

Instead:

1. A backend-owned importer reads the `Fusions` tab from Google Sheets.
2. The importer validates and normalizes rows.
3. The importer stores normalized fusion data in shared runtime storage.
4. The frontend reads imported fusion data from the app backend.

This makes the effective fusion source Google Sheets while staying compatible with Vercel and keeping credentials private.

## Recommended Permission Setup

### Default Recommendation

- Your Google account: `Owner` or `Editor`
- App service account: `Viewer`
- Backend API scope: read-only Sheets scope

This is the simplest setup that satisfies both goals:

- you can edit through the Sheets UI
- the app can read through the API

### If Cards and Fusions Use the Same Spreadsheet

Use one spreadsheet with separate tabs only if the app has the same access level for both.

Because Sheets API scopes apply to the spreadsheet file, not to an individual tab, tab-level separation does not give you stronger API permissions by itself.

If you need different edit protections inside one spreadsheet:

- keep the app read-only
- use protected ranges or protected sheets for sensitive tabs or columns

### If Cards and Fusions Need Different Write Rules

Prefer two spreadsheets:

- one for cards
- one for fusions

This is simpler than trying to enforce different write policies inside a single spreadsheet file.

## Recommended Backend Auth Model

Use a Google service account on the backend.

Store these only in backend environment variables:

- `GOOGLE_SHEETS_SPREADSHEET_ID_FUSIONS`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

Recommended access pattern:

- share the spreadsheet with the service-account email as `Viewer`
- call `spreadsheets.values.get` from the backend
- use `https://www.googleapis.com/auth/spreadsheets.readonly`

Only upgrade the service account to `Editor` if a later feature truly needs the app to write back to the sheet.

## Suggested Sheet Shape

Tab name:

- `Fusions`

Columns:

- `materialA`
- `materialB`
- `resultName`
- `resultAttack`
- `resultDefense`
- `source`
- `status`
- `notes`

Optional additions if useful:

- `resultCardId`
- `materialAId`
- `materialBId`
- `lastVerifiedAt`

## Runtime Flow

1. Backend import action reads the `Fusions!A:Z` range or a narrower validated range.
2. Rows are validated against the expected schema.
3. Normalized records are stored in shared runtime tables.
4. `FusionTableContext` rebuilds the fusion table from imported runtime data.
5. CSV remains as a fallback fixture during migration only.

## Implementation Plan

### Step 1: Verify Workbook and Tab Contract

Confirm:

- the spreadsheet is the intended canonical source
- the `Fusions` tab name
- the exact header row

If the tab does not exist yet, create it and freeze the schema in docs.

### Step 2: Add Backend Config

Add environment variables for:

- fusion spreadsheet ID
- service-account credentials
- optional sheet range override

### Step 3: Port a Minimal Google Sheets Reader

Reuse the YFM2 Google Sheets client pattern, but keep this integration read-only.

The reader only needs:

- `spreadsheets.values.get`
- optional sheet-list inspection for startup diagnostics

### Step 4: Add Fusion Import Action

Create a backend action or script that:

- reads the `Fusions` tab
- validates the headers
- rejects malformed or duplicate rows
- stores normalized data in shared runtime tables

### Step 5: Integrate the Imported Data

Update the fusion-table loading path so the app builds from imported fusion rows instead of `rp-fusions1.csv`.

During rollout:

- keep CSV fallback behind a feature flag or migration switch
- remove the old static fusion CSV dependency once parity is proven

### Step 6: Add Tests

Cover:

- valid `Fusions` sheet import
- missing-header failure
- malformed-row failure
- duplicate-pair handling
- parity with the current CSV-derived fusion table for known fixtures

## Exit Criteria

This step is complete when:

- the app no longer depends on `rp-fusions1.csv` as the primary source
- fusion updates in the Google Sheet can be imported without redeploying Vercel
- the app reads imported shared fusion data successfully in dev and prod
- the spreadsheet remains editable by you through the Sheets UI
- the app accesses the spreadsheet through a backend-only credential path

## Files Changed or Created

| Action | File |
|--------|------|
| Create | `docs/steps/p8-google-sheets-fusions.md` |
| Modify | `convex/schema.ts` |
| Create | `convex/referenceData.ts` |
| Create or port | `src/server/reference/google-sheets-client.ts` |
| Create | `src/server/reference/import-fusions-from-sheets.ts` |
| Modify | `src/ui/lib/fusion-table-context.tsx` |
| Create | `src/server/reference/import-fusions-from-sheets.test.ts` |
