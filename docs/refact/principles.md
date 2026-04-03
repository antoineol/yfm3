# Coding Principles for Agent-Efficient TypeScript + React

Every principle below exists to prevent a specific failure mode. Understand the WHY and use judgment. If following a rule mechanically would produce worse code, override it — but explain your reasoning. A clear 45-line function beats two confused 25-line fragments. Never restructure code just to satisfy a metric.

---

## 1. Single Responsibility

- A function/file/component must be describable as ONE verb + ONE noun. "processAndValidate" = two functions.
- If describing what a unit does requires "and", split it.
- A function either COMPUTES a result (pure, no side effects) or ORCHESTRATES calls (manages flow). Never both.
- A React component either RENDERS UI from props or MANAGES state/effects. Never both.
- One reason to change: if two unrelated feature requests could each require changing this unit, it has two responsibilities.

## 2. Size Limits

These thresholds signal "stop and check if this unit has too many responsibilities." They are not mechanical cut points — splitting a clear function just to hit a number makes code worse.

- **Functions:** ~40 lines. Over 40 = check SRP. Over 60 = almost certainly needs splitting.
- **Files:** ~150 lines (excluding imports and type defs). Over 150 = check SRP. Over 250 = split.
- **JSX return:** ~50 lines. Extract child components when the JSX obscures the component's purpose.
- **Function arguments:** 3. More = the function probably knows too much. Use an options object if genuinely needed.
- **Component props:** 5. More = the component probably has mixed concerns.
- **Nesting depth:** 2 levels of conditional/loop nesting. Use early returns and extraction.
- **Call depth:** 3 layers max between a user action and its side effect. component -> hook -> pure function.

## 3. Function Design

- Pure functions always. Side effects at edges only.
- Return early to flatten nesting.
- No standalone boolean parameters. Use separate functions or an options object.
- A function name tells you what it returns OR what side effect it performs. Never both.
- If a function has a return value AND a side effect, split it.

## 4. React Components and Hooks

- **Self-contained by default:** A component owns its state, computes its derived values, and exposes a minimal prop surface. Self-containment is the design goal — the rules below are mechanisms to achieve it. When a component is genuinely self-contained, colocation, render isolation, and referential stability follow naturally.
- Components are leaf (renders UI from props) or container (composes children + manages state). Not both. Exception: tiny components with a couple of `useState` calls and no effects don't need splitting — the threshold is when state management or rendering becomes non-trivial.
- One custom hook = one concern. A hook managing both a WebSocket AND state parsing is two hooks. **God hook signal:** >3 state variables or >2 effects = almost certainly multiple concerns. Split by concern, compose in the container. Self-contained components decompose *internally* — the component boundary is self-contained, the hooks inside it are focused.
- One effect per useEffect call. Each effect has one setup and one cleanup.
- No prop drilling beyond 1 level. Use composition (children/render props) or context.
- Event handlers: inline or named functions in the component body. Never in separate files.
- **State colocation:** State lives at the lowest component that needs it. Don't hoist to a provider what a local useState handles. Lift only when siblings share the same state.
- **Derived state:** Compute it. Never store computed values in useState + sync with useEffect. Compute directly in render — memoization is handled automatically.
- **Pure renders, not manual memoization:** This project uses React Compiler — memoization is automatic. Do not add useMemo, useCallback, or React.memo. Instead, write pure render functions — no mutations of variables created outside the render scope, no side effects during render. Impure renders break automatic optimization silently.
- **Re-render isolation:** Keep components that receive frequently-changing props small. Extract expensive subtrees that don't depend on the changing value into sibling components — small focused components are easier to reason about and give the optimizer more to work with.
- **Context granularity:** Split contexts by update frequency. A context mixing rarely-changing config with frequently-changing state forces every consumer to re-render on every tick. Automatic memoization cannot optimize away context re-renders.

## 5. Naming

- Files named after the ONE thing they export. `fusion-scorer.ts` exports `fusionScorer` or `FusionScorer`.
- Never name files `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`.
- Greppable names: full words, no abbreviations. `computeInitialScores` not `compInitScores`.
- Casing: `kebab-case.ts` files, `PascalCase.tsx` components, `use-thing.ts` hooks, `camelCase` functions/variables, `PascalCase` types, `UPPER_SNAKE_CASE` constants.
- Boolean variables/props are questions: `isVisible`, `hasError`, `canSubmit`.

## 6. Types as Documentation

- Types are the primary source of truth. An agent reads types before implementation.
- Discriminated unions for state machines. Never boolean flags + nulls for state.
- No `any`. No type assertions except at system boundaries (API responses, library workarounds).
- Narrow parameter types to what is actually used. Never pass a whole object when one field suffices.
- Branded types for IDs that must not be confused.

## 7. Imports and Dependencies

- Direct imports to source files. No barrel exports (`index.ts` re-exports).
- No dependency injection in frontend apps. Use `vi.mock` for testing.
- No wrapper functions that just forward arguments to another function.
- If a helper is used once, inline it. Extract only after 3+ uses.

## 8. Testing

- Tests co-located with source: `thing.ts` + `thing.test.ts` side by side.
- Test names describe behavior: `it("returns 0 when hand has no fusions")` not `it("test case 3")`.
- Each test self-contained. No shared mutable state between tests.
- A unit test tests ONE exported function.
- Integration tests separated by naming: `.integration.test.ts`.

## 9. Error Handling

- Result types (`{ ok: true; data: T } | { ok: false; error: E }`) for expected failures.
- Throw for invariant violations (bugs).
- No silent catches. No `console.error` as error handling.
- Workers/async: send structured error messages, never silent crashes.

## 10. Reading Order

- Files read top-to-bottom: exports first, then private helpers.
- If A calls B, write A before B.
- Types/interfaces at the top of the file.
- Constants before the functions that use them.

## 11. Deletion Over Deprecation

- Dead code gets deleted. Git has history.
- No `_unused` prefixes, no `// removed` comments, no re-exports of deleted types.
- If it is not imported, it does not exist.

---

## Step back

After making changes, pause and re-read what you wrote. Ask: if another agent opened this file tomorrow with no context, would the structure help or hinder them? That's the test — not whether rules were followed, but whether the code is genuinely easier to work with.
