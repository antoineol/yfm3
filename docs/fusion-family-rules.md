# Fusion Family Rules — Investigation & Plan

## Goal

Replace the flat ~9,000-row fusion table (for RP; ~25k for vanilla; different again for Alpha) with a **compressed, human-readable rule set** that predicts fusion results from card attributes — e.g. `Dragon + Thunder (both <1600 ATK) → Thunder Dragon`. Lossy is acceptable if exceptions are explicitly enumerated.

Objective class: **predictive rules** (not just descriptive grouping, not open-world generation). The rule set must reproduce the mod's fusion table within a stated tolerance.

## Constraints

- Each mod (vanilla, RP, Alpha, …) ships its **own** fusion table. Tables are **not** inherited from vanilla — Alpha even redefines the card roster. Rules derived for one mod do **not** transfer.
- Current data lives in `tests/data/{vanilla,rp}/fusions.csv` (schema: `material1_id, material2_id, result_id, result_atk`) and `cards.csv` (id, name, atk, def, type, attribute, level, guardian stars, …).
- Runtime uses a flat `Int16Array` lookup (`src/engine/deck-fusion-finder.ts`, `src/engine/types/buffers.ts`). Whatever we derive must either materialize back to that array or provide an equivalent query layer.

## Findings

### 1. The engine has no rules

Data Crystal's ROM map and our own `bridge/extract/extract-fusions.ts` confirm: the PSX engine is a flat `(material1, material2) → result` lookup with compression tricks, but **no pattern matching**. Any rule set is a post-hoc compression of an enumerated table. There's nothing to "recover" from RAM or binary.

### 2. The vanilla community has already solved this — for vanilla

[Marcelo Silvarolla's YFM-Database-and-Fusion-Guide](https://github.com/MarceloSilvarolla/YFM-Database-and-Fusion-Guide) compresses all ~50k vanilla fusion pairs (counting both directions) into roughly **~290 machine-verified rules**. Key properties:

- **Rule form**: `[Type_A] + [Type_B] = Result_X (ATK/DEF) = Result_Y (ATK/DEF)` — higher-ATK result takes precedence when both material ATKs are strictly below it.
- **Secondary types** (~40) layered over the ~20 primary monster types: `[AngelWinged]`, `[Koumorian]`, `[Female]`, `[MercuryMagicUser]`, … Some derive from attribute/guardian-star/ATK-range, some are explicit small card sets. These are what make compression work — primary-type rules alone are insufficient.
- **Conflict resolution**: explicit priority list + enumerated override pairs. Lossless.
- **Verification**: `createPredictedFusions.sql` generates predictions from rules and compares row-by-row against the ground-truth table. Not a hand-wavy guide — a machine-checked compression.

### 3. The catch: Silvarolla's rules are vanilla-specific

RP and Alpha ship independent tables. The **methodology** (primary + secondary types, ATK thresholds, conflict overrides, verification-by-regeneration) transfers; the **rules themselves** do not.

### 4. Mod authors likely used a generator

Hand-authoring 9,000 fusions is unrealistic. RP (and likely Alpha) were almost certainly generated from a designer-authored rule spec. **If we can find or request that spec, the problem is solved upstream** — we would not be reverse-engineering, just consuming. This should be checked before investing in inference.

## Options

### A. Fetch mod-authored rule specs from the mod community

Reach out to / search for the RP and Alpha mod authors' design documents. Olho do Milênio's RP page is sparse but the designers exist and may share.

- **Pros**: If they exist, we are done. Lossless by construction.
- **Cons**: May not exist in a usable form. Non-English community. Blocked on external response time.

### B. Port Silvarolla's methodology to RP (manual or semi-automated)

Re-derive primary + secondary types + ATK-threshold rules against RP's table, using Silvarolla's framework as the template. Verify by regenerating the table and diffing.

- **Pros**: Proven framework. Results are interpretable and verifiable.
- **Cons**: High effort (weeks for one mod; multiplied per mod). Secondary-type discovery is the hard part — it's a semantic/design judgment, not a pure pattern-mine.

### C. Automated rule mining on primary types only

For each `(type_A, type_B)` pair in the RP table, aggregate result cards. If one result → clean rule. If two results → look for an ATK threshold. If many → mark as "needs refinement".

- **Pros**: Fully automated. Produces a coverage metric in hours. Good starting scaffold for option B.
- **Cons**: Won't discover secondary types. Coverage will plateau well below 100%.

### D. Pure pattern-mining (decision trees / association rules / subgroup discovery)

Treat each fusion as a training example, features = (type, attribute, level, ATK, DEF, guardian stars) of both materials; target = result card ID. Train a decision tree or mine association rules.

- **Pros**: Objective. Handles arbitrary feature interactions.
- **Cons**: Black-box-ish rules. Won't produce human-readable "secondary type" labels — it'll produce `ATK ∈ [1400, 1700] ∧ attribute=DARK ∧ …`. Interpretability suffers. Over-fits with 9k examples and 700 output classes.

### E. Hybrid: automated mining seeds manual curation

Run option C to get a **coverage map** — which `(type_A, type_B)` pairs are clean, which need thresholds, which are messy. Then apply option B only to the messy cells, guided by the map.

- **Pros**: Maximum leverage. Automation does the easy 60–80%, humans handle the semantically-loaded remainder. Coverage is known at every step.
- **Cons**: Still requires human judgment for secondary types on the messy cells.

## Recommendation

**Sequence A → E**, with a hard stop after A if the specs exist.

1. **Ask first** (option A). One email / Discord message to the RP and Alpha mod teams asking whether they have a designer spec. Zero risk of wasted work.
2. **In parallel, run the coverage probe** (option C, 1–2 days): write a script that groups the RP fusion table by `(primary_type_A, primary_type_B)`, reports number of distinct results per cell, and attempts a single-ATK-threshold split per cell. The output is a coverage heat map and a "this cell is clean" / "this cell needs secondary types" classification.
3. **Decide based on the coverage number**:
   - \>90% clean cells + clean threshold splits → ship option C's output as-is, enumerate the rest as exceptions.
   - 50–90% → commit to option E: manual secondary-type curation on the messy cells only, Silvarolla-style.
   - <50% → reassess. Likely means the mod's design is exception-heavy; fall back to descriptive grouping (objective 1) for the UI and call predictive rules infeasible.
4. **Validate** end-to-end by regenerating the fusion table from the rules and diffing against `tests/data/{mod}/fusions.csv` — following Silvarolla's pattern. Zero diff or an explicit exception list is the acceptance criterion.

## Why this sequencing

- The coverage probe is cheap and its result is load-bearing for every downstream decision. Without it, we're arguing about which method to apply without knowing the shape of the problem.
- Running the probe on **vanilla** first and comparing against Silvarolla's known-good rules is a free sanity check on the pipeline before we apply it to RP.
- Secondary-type discovery is the expensive, judgment-heavy step. Option E defers it until we know which cells actually need it.

## First concrete step

Write `scripts/fusion-rule-coverage.ts`:

- Input: `tests/data/{mod}/fusions.csv` + `tests/data/{mod}/cards.csv`.
- For each `(type_A, type_B)` pair: list distinct result card IDs, material ATK ranges per result, ATK/DEF of each result.
- Emit a report: per-cell cardinality, candidate ATK threshold (if 2 results, check if material ATKs separate cleanly), and a global coverage number assuming "most common result wins".
- Run on vanilla first (ground truth: Silvarolla's guide), then RP.

Expected output: a single table telling us what fraction of the table is already explained by primary-type rules alone. That number determines the next move.

## Open questions

- Where does the rule set live at runtime? (Generated on demand, cached, pre-compiled to the flat array.)
- UI shape: one-rule-per-card view, or browse-by-type-pair matrix?
- How do we present exceptions — inline with the rule, or in a separate "overrides" panel?
- Should we version rule sets per mod, or derive at build time from the CSVs?

## References

- [Silvarolla's YFM-Database-and-Fusion-Guide](https://github.com/MarceloSilvarolla/YFM-Database-and-Fusion-Guide) — `FUSION_GUIDE.txt`, `fusions.txt`, `Test definitively all fusions/`
- [Silvarolla on GameFAQs](https://gamefaqs.gamespot.com/ps/561010-yu-gi-oh-forbidden-memories/faqs/78677)
- [DBirtolo / Kingtut1 original Fusion FAQ](https://gamefaqs.gamespot.com/ps/561010-yu-gi-oh-forbidden-memories/faqs/16613)
- [Data Crystal ROM map](https://datacrystal.tcrf.net/wiki/Yu-Gi-Oh!_Forbidden_Memories/ROM_map) — confirms flat lookup in engine
- [Solumin/YGO-FM-FusionCalc](https://github.com/Solumin/YGO-FM-FusionCalc) — alternative reference calculator
- [Olho do Milênio Remastered Perfected](https://olhodomilenio.com/en/mod/yugioh-remastered-perfected) — mod page (sparse; may be worth contacting)
