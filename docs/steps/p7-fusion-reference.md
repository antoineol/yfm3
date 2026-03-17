# P7: Shared Reference Data Management

**Priority:** P7 - Shared card and fusion data curation.

**Depends on:** P0c (shared data-loading infrastructure), P4 (collection UX is already usable without this).

**Why:** The project still relies on static CSV files bundled with the app. That works for known data, but it does not support the real workflow we now care about: discovering missing cards and fusions during gameplay, updating the reference immediately, and seeing the same shared dataset from both dev and prod.

## Decision

Use Google Sheets as the canonical source of truth for shared reference data, and use a server-side runtime store for YFM3. Repo CSV snapshots remain backup and test fixtures, not the deployed runtime source.

### Why this choice

- YFM2 already proves this workflow exists in practice for cards through `GOOGLE_SHEETS_SPREADSHEET_ID`, a service-account client, and a sheet-to-CSV sync step.
- Reusing the existing workbook avoids splitting the reference dataset across multiple tools.
- Google Sheets is shared across dev and prod by design because it is outside environment-scoped Convex deployments.
- It is easy to edit from a phone or desktop while playing, which matches the discovery workflow.
- It has built-in revision history, which lowers the risk of losing data.
- A server-side runtime store avoids the Vercel problem where committed CSV data is frozen until the next deploy.
- A checked-in snapshot in `data/` still gives us backup, test determinism, code-review visibility, and a recovery path.

### Why YFM3 should not read Google Sheets directly in the browser

- YFM3 is a Vite client app, not a server-rendered app, so service-account credentials cannot live in the frontend.
- Public client-side fetching would be more brittle and would tie app startup to a third-party network dependency.
- The frontend should read shared reference data from a backend-owned API or Convex query, not from Google directly.

### Why not make Convex the canonical store

- The current Convex setup is environment-specific and is intentionally used for per-user data.
- Sharing one mutable reference dataset across dev and prod would either fight that separation or require awkward multi-deployment wiring.
- Convex can still cache or mirror reference data later if we need it, but it should not be the source of truth for this step.

### Why not keep repo CSV as the only source

- Git-backed CSV is durable, but editing it during gameplay is too friction-heavy.
- Every discovery would require a local edit plus commit or manual file sync.
- On Vercel, committed CSV files are build artifacts, so updates are not live until redeploy.
- It does not solve the "shared between dev and prod right now" requirement on its own.

## Target Architecture

Split data into two classes:

- Shared reference data: cards, fusion recipes, and provenance notes. This is global and environment-agnostic.
- User state: collection, deck, hand, preferences. This stays in Convex and remains user- and environment-scoped.

Operational split:

1. Curate cards and fusions in shared Google Sheets workbooks or tabs.
2. Run a backend import action that reads Sheets and stores normalized reference data in a shared runtime store.
3. Let YFM3 read that shared runtime store through backend queries.
4. Optionally export snapshots into repo CSV files for backup and tests.

Recommended runtime store:

- Convex global tables for `referenceCards` and `referenceFusions`

This keeps Google Sheets as canonical, keeps secrets off the client, and gives both dev and prod one live shared dataset without redeploying Vercel on every change.

## Scope

### A. Canonical Shared Sheets

Use Google Sheets as the canonical edit surface.

Recommended structure:

- one spreadsheet with `Cards`, `Fusions`, and `Meta` tabs if the access model is the same for all data
- two spreadsheets if cards and fusions need different sharing or write permissions

Important constraint from the Google Sheets API:

- scopes apply to the spreadsheet file, not to an individual tab
- if you need finer edit control inside one spreadsheet, use protected ranges instead of relying on API scopes alone

Recommended columns for `Cards`:

- `cardId`
- `name`
- `attack`
- `defense`
- `kind1`
- `kind2`
- `source`
- `status`
- `notes`

Recommended columns for `Fusions`:

- `materialA`
- `materialB`
- `resultName`
- `resultAttack`
- `resultDefense`
- `source`
- `status`
- `notes`

`status` should distinguish at least:

- `confirmed`
- `unverified`
- `needs_review`

That lets us capture discoveries quickly without pretending they are final.

### B. Shared Runtime Store

Add backend-owned tables for normalized shared reference data.

Recommended shape:

- `referenceCards`
- `referenceFusions`
- `referenceMeta` or an import-log table

These tables are global, not per-user.

### C. Syncable Local Snapshot

Add generated snapshot files in the repo, for example:

- `data/reference/cards.csv`
- `data/reference/fusions.csv`

These files are not the canonical edit surface. They exist to provide:

- offline fallback
- deterministic tests
- simple recovery if the sheet is edited incorrectly
- visible diffs in pull requests

### D. Validation and Import Pipeline

Add a small ingestion layer that:

- reads Google Sheets ranges or exported rows
- validates and normalizes them
- writes the normalized results to the shared runtime store
- validates required columns and row shapes
- rejects duplicate card IDs and malformed fusion rows
- normalizes card names and fusion material ordering
- can also emit CSV snapshots when requested

Validation must fail loudly. Silent coercion would make discovered data harder to trust.

### E. Permissions Model

Recommended default:

- your Google account: `Owner` or `Editor`
- app service account: `Viewer` if the app only reads
- separate writer service account or elevated permission only if a future feature must write back to Sheets

Do not expose Google credentials to the browser. Store them only in backend environment variables.

### F. Operational Workflow for Discovery

The intended workflow is:

1. During gameplay, add or fix a row in the shared workbook.
2. Mark uncertain discoveries as `unverified` instead of blocking capture.
3. Run the backend import or scheduled sync to refresh the shared runtime store.
4. Refresh the app to load the imported data.
5. Export or commit snapshot diffs when the changes should also be preserved in git history.

This is deliberately simple. It optimizes for capture speed first, then validation and curation.

## Implementation Plan

### Step 1: Audit and Reuse the Existing YFM2 Workflow

Document what already exists in YFM2 and what can be ported as-is.

Known starting point:

- `src/app/database/_services/googleSheetsClient.ts`
- `src/app/database/_services/fetchCardsDatabase.ts`
- `src/app/database/_services/addToGoogleSheets.ts`
- `GOOGLE_SHEETS_SPREADSHEET_ID` plus service-account credentials

Gap still to solve:

- YFM2 appears to sync cards only; fusions still look static.

### Step 2: Freeze the Reference Schema

Document the workbook columns, value rules, and status vocabulary.

**New file:** `docs/reference-data-schema.md`

Include:

- required columns for cards and fusions
- allowed `status` values
- naming rules for card references
- how fusion-only result cards are represented

### Step 3: Add Shared Reference Config

Introduce a config layer for:

- the shared spreadsheet ID
- server-side credentials location
- runtime store table names
- snapshot output paths
- a feature flag to force snapshot-only loading during tests if needed

**New file:** `src/shared/reference-data-config.ts`

### Step 4: Add Shared Runtime Tables

Create backend tables for normalized shared cards and fusions.

These must be global and environment-stable for the deployed app, not user-scoped.

### Step 5: Build Sync Tooling by Porting YFM2 Card Sync and Extending It to Fusions

Create a server-side sync command or Convex action that:

- fetches `Cards` from the existing workbook
- fetches `Fusions` from the same workbook
- validates both tabs
- upserts the shared runtime tables
- optionally writes repo snapshot CSV files

Prefer extracting the reusable parts from YFM2 instead of re-implementing the whole Google Sheets client from scratch.

**New file:** `scripts/sync-reference-data.ts`

### Step 6: Build Reference Loaders

Create loader functions that read normalized shared runtime data and build `CardDb` and `fusionTable`.

**New files:**

- `src/engine/reference/load-reference-csv.ts`
- `src/engine/reference/parse-reference-cards.ts`
- `src/engine/reference/parse-reference-fusions.ts`

### Step 7: Integrate with FusionTableContext

Replace the current hardcoded dependency on `data/rp-cards.csv` and `data/rp-fusions1.csv` with the shared runtime source, while keeping CSV snapshots as fallback for tests or recovery.

The context should keep runtime behavior simple:

- read shared imported reference data through backend queries
- fail loudly on invalid synced data
- expose enough load-state information for future admin/debug UI

**Modify:** `src/ui/lib/fusion-table-context.tsx`

### Step 8: Add Tests

Cover:

- card sync parity with the current YFM2 sheet format
- fusion sync validation
- schema validation failures
- fusion-table parity from imported runtime data
- handling of fusion-only result cards

## Current State

- Cards and fusions are loaded from static bundled CSV files.
- Fusion-only cards are synthesized in `FusionTableContext`.
- The runtime fusion table is intentionally monster-only today; unresolved non-monster materials are ignored based on the card data, while unresolved monster names still surface as data issues.
- There is no shared mutable reference store across dev and prod.
- There is no lightweight workflow for capturing newly discovered data during gameplay.
- YFM2 already has a partial Google Sheets integration for cards, but not an obvious equivalent for fusions.

## Exit Criteria

This step is complete when:

- cards and fusions can be curated in one shared workbook
- the existing YFM2 card workflow has been reused instead of duplicated
- dev and prod share one canonical reference source through Sheets plus a backend import path
- YFM3 runtime no longer depends on redeploying Vercel to see reference-data changes
- YFM3 reads shared imported runtime data instead of bundled CSV artifacts
- repo snapshots can be refreshed with one command
- invalid reference rows are caught by tests and validation

## Next Step After This

Once the shared dataset exists, the next logical feature is a lightweight admin or review surface for recent discoveries and validation status, not a public fusion browser. That UI should be built on top of this data pipeline instead of inventing another storage path. Only after that should we consider widening the runtime model beyond the current monster-only fusion scope.

## Files Changed or Created

| Action | File |
|--------|------|
| Create | `docs/reference-data-schema.md` |
| Create | `src/shared/reference-data-config.ts` |
| Create or port | `src/server/reference/google-sheets-client.ts` |
| Modify | `convex/schema.ts` |
| Create | `convex/referenceData.ts` |
| Create | `src/engine/reference/load-reference-csv.ts` |
| Create | `src/engine/reference/parse-reference-cards.ts` |
| Create | `src/engine/reference/parse-reference-fusions.ts` |
| Modify | `src/ui/lib/fusion-table-context.tsx` |
| Create | `scripts/sync-reference-data.ts` |
| Create | `src/engine/reference/load-reference-csv.test.ts` |


## Implementation Status (Updated)

- ✅ Added reference schema documentation in `docs/reference-data-schema.md`.
- ✅ Added shared config in `src/shared/reference-data-config.ts`.
- ✅ Added Google Sheets service-account reader in `src/server/reference/google-sheets-client.ts`.
- ✅ Added shared runtime tables and import/query functions via `convex/schema.ts` and `convex/referenceData.ts`.
- ✅ Added reference parsing/loading pipeline in `src/engine/reference/*`.
- ✅ Integrated `FusionTableContext` with runtime reference query + snapshot fallback.
- ✅ Added snapshot sync script in `scripts/sync-reference-data.ts`.
- ✅ Added loader tests in `src/engine/reference/load-reference-csv.test.ts`.

### Current Step

- Runtime reference reads are wired through `convex/referenceData.getReferenceData` with CSV fallback still available.

### Next Step

- Hook the sync/import command to call `replaceReferenceData` so sheet updates can populate Convex tables in one command.
