# Coding Principles: Rationale and Enforcement

Detailed reference for each principle. Each entry has: the hard rule, the agent-specific rationale, mechanical enforcement, concrete examples, and edge cases.

**Two failure modes, not one.** These principles primarily guard against under-decomposition: god functions, mixed concerns, tangled state. But over-decomposition is equally damaging. Unnecessary abstraction layers add cognitive overhead on every read. Premature extraction creates indirection the reader must trace through for no clarity gain. Wrapper functions, adapter layers, and structural scaffolding that don't solve a real problem are noise — they spread logic across more files and more hops without making any single piece easier to understand. The goal is the simplest code structure where each unit has one clear responsibility — not the most decomposed one.

---

## 1. Single Responsibility

### Rule

Every function, file, and component must have exactly one responsibility. This is tested by three mechanical checks:

1. **Naming test:** You must be able to name it with ONE verb + ONE noun. If you cannot, it does too much.
2. **The "and" test:** If describing what the unit does requires the word "and", it must be split.
3. **Compute vs orchestrate / render vs manage:** A function either computes a result (pure, deterministic, no side effects) or orchestrates other functions (calls things, manages control flow, performs I/O). A component either renders UI from props or manages state and effects. Never both.

### Why (for agents)

The AI agent has strong local judgment (within a function) but weak large-scale judgment (across modules). When a function mixes computation with orchestration, the agent must hold two mental models simultaneously: the data transformation logic AND the control flow. This doubles the cognitive load and is the single largest source of agent errors: incorrect modifications, missed side effects, and broken invariants.

When responsibilities are separated, the agent modifies one concern at a time and can verify correctness of each concern independently.

### Enforcement

- **Naming audit:** For every exported function and component, verify the name matches the pattern `verbNoun` or `VerbNoun`. Flags: names containing "And", names requiring two clauses to describe.
- **Effect audit:** For every function, check: does it both return a value AND perform a side effect (mutate state, call an API, write to storage, dispatch an event)? If yes, split.
- **Component audit:** For every React component, check: does it contain both useState/useEffect AND more than trivial JSX? If yes, extract a container + presentational pair.

### Examples

```typescript
// BAD: computes AND orchestrates
function processAndSaveResults(data: RawData[]): SavedResult[] {
  const scored = data.map(d => computeScore(d));      // computing
  const filtered = scored.filter(s => s.value > 0);    // computing
  await db.save(filtered);                              // orchestrating (I/O)
  logger.info(`Saved ${filtered.length} results`);      // orchestrating (side effect)
  return filtered;                                       // returning computed result
}

// GOOD: separated
function filterPassingScores(data: RawData[]): ScoredResult[] {
  const scored = data.map(d => computeScore(d));
  return scored.filter(s => s.value > 0);
}

async function saveResults(results: ScoredResult[]): Promise<void> {
  await db.save(results);
  logger.info(`Saved ${results.length} results`);
}
```

```tsx
// BAD: renders AND manages state
function PlayerHand() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    fetchHand().then(setCards);
  }, []);

  return (
    <div className="hand">
      {cards.map((card, i) => (
        <CardTile
          key={card.id}
          card={card}
          isSelected={i === selected}
          onSelect={() => setSelected(i)}
        />
      ))}
    </div>
  );
}

// GOOD: separated
function usePlayerHand() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    fetchHand().then(setCards);
  }, []);

  return { cards, selected, selectCard: setSelected };
}

function PlayerHand({ cards, selected, onSelect }: PlayerHandProps) {
  return (
    <div className="hand">
      {cards.map((card, i) => (
        <CardTile
          key={card.id}
          card={card}
          isSelected={i === selected}
          onSelect={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
```

### Edge Cases

- **Tiny components** with one useState and a few lines of JSX do not need container/presentational splitting. The split is required when the state management OR the rendering is non-trivial (more than 3 lines each).
- **Event handler callbacks** inside components are not "orchestration" in the SRP sense. A component that calls `onSubmit(formData)` in a click handler is still presentational. The line is: does the component own the state transition logic, or does it just relay user intent?
- **Custom hooks** are the bridge. A hook CAN combine state + effects because that is its purpose. But a single hook must still have one concern. `useWebSocket` is one concern. `useWebSocketAndGameState` is two.

---

## 2. Size Limits

### Rule

| Unit | Threshold |
|---|---|
| Function body | 40 lines |
| File (excluding imports and type definitions) | 150 lines |
| JSX return block | 50 lines |
| Function arguments | 3 |
| Component props | 5 |
| Conditional/loop nesting depth | 2 levels |
| Call-chain layers (action to side effect) | 3 |

### Why (for agents)

The agent reads code linearly. A 40-line function fits in one "cognitive pass" -- the agent can read it start to finish and hold the entire thing in working memory. A 200-line function forces the agent to "remember" early lines while processing later ones, and this is exactly where agents introduce bugs: they forget a constraint from line 30 when editing line 180.

The 150-line file limit ensures the agent can read an entire file in one shot. The 3-argument limit forces narrow interfaces that are self-documenting at call sites. The nesting limit prevents the combinatorial explosion of mental state tracking that agents handle poorly.

### Enforcement

- **Line count:** Count non-blank, non-comment, non-import, non-type-definition lines per function and per file.
- **Argument count:** Count parameters in function signatures. Options objects count as 1.
- **Nesting depth:** Count maximum `if`/`for`/`while`/`switch` nesting depth in any function.
- **Call depth:** Trace from any event handler to the terminal side effect. Count the hops.

### Examples

```typescript
// BAD: 60+ lines, deeply nested
function evaluateHand(hand: Card[], fusionTable: FusionTable): number {
  let bestScore = 0;
  for (const card of hand) {
    if (card.type === "monster") {
      for (const other of hand) {
        if (other.id !== card.id) {
          const fusion = fusionTable.get(card.id, other.id);
          if (fusion) {
            if (fusion.attack > bestScore) {
              bestScore = fusion.attack;
              // ... 30 more lines of nested logic
            }
          }
        }
      }
    }
  }
  return bestScore;
}

// GOOD: decomposed, flat
function evaluateHand(hand: Card[], fusionTable: FusionTable): number {
  const monsters = hand.filter(c => c.type === "monster");
  const pairs = allPairs(monsters);
  const fusions = pairs.flatMap(([a, b]) => findFusion(a, b, fusionTable));
  return Math.max(0, ...fusions.map(f => f.attack));
}
```

```typescript
// BAD: 6 arguments
function createCard(id: number, name: string, attack: number, defense: number, type: string, element: string) { ... }

// GOOD: options object
function createCard(options: CreateCardOptions): Card { ... }
```

### Edge Cases

- **Switch statements** with many cases can exceed 40 lines while being perfectly clear. If each case is 1-2 lines, up to 60 lines is acceptable for a switch. But if cases have logic, extract each case into a function.
- **Test files** are exempt from the 150-line file limit. Tests can be longer because each `it` block is independently readable. However, test files over 300 lines should still be split along logical boundaries.
- **Type definition files** (files that are purely types/interfaces with no runtime code) are exempt from the 150-line limit.
- The 3-argument limit does NOT apply to constructors of data classes / type factory functions where each argument maps 1:1 to a field.

---

## 3. Function Design

### Rule

- Pure functions always. Side effects live at the edges of the call graph, never in the middle.
- Return early to eliminate nesting. The happy path runs at the base indentation level.
- No standalone boolean parameters. `format(data, true)` is unreadable. Use `format(data, { pretty: true })` or `formatPretty(data)`.
- A function's name declares what it returns OR what side effect it performs. `getScore` returns a score. `saveResult` performs a save. `getAndSaveScore` is two functions.

### Why (for agents)

Pure functions are the easiest code for an agent to reason about: same input, same output, no hidden state. When the agent modifies a pure function, it only needs to verify the input-output contract. When it modifies a function with side effects, it must also reason about when those effects happen, what state they touch, and what other code depends on that state.

Boolean parameters are particularly dangerous for agents because at the call site, the agent sees `true` or `false` with no indication of what it controls. This forces the agent to look up the function signature every time it encounters a call.

### Enforcement

- **Purity audit:** For each function, check: does it read or write anything outside its parameters and return value? Flags: global state access, DOM manipulation, network calls, `Math.random()`, `Date.now()`.
- **Early return audit:** For each function, check the maximum nesting depth. If greater than 2, refactor with early returns.
- **Boolean param audit:** Search for function signatures with bare `boolean` parameters.

### Examples

```typescript
// BAD: boolean parameter
function renderCard(card: Card, isCompact: boolean, showFusions: boolean) { ... }
// At call site: renderCard(card, true, false) -- what do true and false mean?

// GOOD: options object
function renderCard(card: Card, options: { compact?: boolean; showFusions?: boolean }) { ... }
// At call site: renderCard(card, { compact: true })

// ALSO GOOD: separate functions (when the variants are truly different)
function renderCardCompact(card: Card) { ... }
function renderCardFull(card: Card) { ... }
```

```typescript
// BAD: nested conditionals
function getDiscount(user: User, item: Item): number {
  if (user.isPremium) {
    if (item.category === "sale") {
      if (item.stock > 10) {
        return 0.3;
      } else {
        return 0.2;
      }
    } else {
      return 0.1;
    }
  } else {
    if (item.category === "sale") {
      return 0.1;
    } else {
      return 0;
    }
  }
}

// GOOD: early returns, flat
function getDiscount(user: User, item: Item): number {
  if (!user.isPremium && item.category !== "sale") return 0;
  if (!user.isPremium) return 0.1;
  if (item.category !== "sale") return 0.1;
  if (item.stock <= 10) return 0.2;
  return 0.3;
}
```

### Edge Cases

- `Date.now()` and `Math.random()` make functions impure. For testability, accept these as parameters or use injection via a clock/rng argument.
- React event handlers are inherently side-effectful (they call setState). This is fine. The rule applies to the functions they call: the event handler orchestrates, the functions it calls compute.

---

## 4. React Components and Hooks

### Rule

- **Self-contained by default:** Components own their state, compute their derived values, expose a minimal prop surface. Self-containment is the design goal; the rules below are mechanisms.
- Components are **leaf** (renders UI from props, no useState/useEffect) or **container** (composes children, manages state/effects, minimal JSX). Not both.
- One custom hook = one concern. **God hook signal:** >3 state variables or >2 effects. Self-contained components decompose internally — the boundary is self-contained, the hooks inside are focused.
- One useEffect = one effect. Each has one setup and one cleanup.
- No prop drilling beyond 1 level. Use composition (children, render props) or context.
- Event handlers are inline or named in the component body. Never in separate files.
- **State colocation:** State lives at the lowest component that needs it.
- **Derived state:** Compute it. Never `useState` + `useEffect` to sync derived values. Compute directly in render — memoization is automatic.
- **Pure renders, not manual memoization:** Memoization is automatic. Do not add useMemo, useCallback, or React.memo. Write pure render functions instead.
- **Re-render isolation:** Extract expensive subtrees that don't depend on changing state into sibling components. Structural benefit regardless of optimizer.
- **Context granularity:** Split contexts by update frequency. Automatic memoization cannot optimize away context re-renders.

### Why (for agents)

**Self-containment is the unifying principle.** State colocation, render purity, re-render isolation, and context granularity are all downstream of one architectural choice: does this component own its concerns or depend on external wiring? A component that owns its state doesn't need it hoisted. A component with few props has fewer cross-component dependencies. A component that doesn't read parent state is naturally isolated from parent re-renders. The specific rules below are failure-mode detectors — they catch the cases where self-containment was breached without the developer noticing. The one trap to avoid: self-contained at the component boundary does NOT mean cramming all logic into one god hook. The component is the self-contained unit; its internal hooks still decompose by concern.

The leaf/container split is SRP applied to React. When an agent needs to change styling, it touches only leaf components. When it needs to change data flow, it touches only containers. Without this split, every visual change risks breaking state logic.

The "one effect per useEffect" rule is critical: when effects are combined, the agent cannot reason about their individual lifecycles. It cannot tell which cleanup corresponds to which setup, or which dependency triggers which re-execution.

Derived state stored in useState + useEffect is the most common React bug source, and agents reliably fail to maintain the synchronization correctly. Computing derived values directly eliminates this entire category of bugs.

**God hooks** are the React equivalent of a god class. A hook with 5 state variables and 3 effects is managing multiple concerns behind a single interface. The agent cannot modify one concern without risk of breaking the others, because the concerns share scope. The >3 state / >2 effect threshold is a practical detection heuristic — below it, the complexity is usually manageable; above it, concerns are almost always tangled. The fix is always the same: identify the distinct concerns, extract each into its own hook, compose them in the container.

**State colocation** matters because hoisted state causes unnecessary re-renders and couples distant components. When state lives in a top-level provider but only one leaf reads it, every component in between re-renders on every state change. The agent's instinct is often to "play it safe" by lifting state high — this creates the performance and coupling problems the other rules try to solve. State should migrate upward only when a sibling genuinely needs it.

**Pure renders replace manual memoization.** This project uses React Compiler, which automatically memoizes values, callbacks, and JSX elements. Manual useMemo, useCallback, and React.memo are unnecessary noise. What automatic memoization *requires* is pure render functions: no mutating variables from outer scopes, no side effects during render, no reading from refs during render. When a render cannot be proven pure, the optimizer bails out silently and the component loses all automatic optimization. The agent's job is "keep renders pure" — purity is a structural property the agent can verify; optimal memoization granularity is a runtime concern the optimizer handles.

**Re-render isolation** remains valuable as architecture regardless of automatic optimization. A component only re-renders when its parent re-renders or its own state/context changes. By extracting an expensive subtree into a sibling, the subtree only re-renders when its own props change. Automatic memoization makes each individual re-render cheaper (by skipping memoized subexpressions), but it cannot eliminate the re-render itself — the component still runs. Small, focused components give the optimizer less work to analyze and more opportunities to skip entire subtrees.

**Context granularity** is the one area automatic memoization cannot help. When a context value changes, every consumer re-renders — there is no mechanism to opt out. A single context providing `{ theme, locale, currentUser, liveGameState }` forces every consumer to re-render when the game state ticks — even components that only read the theme. Splitting into `ThemeContext` + `GameStateContext` lets React skip theme consumers during game ticks. This is a structural decision the agent must make; no amount of automatic optimization can fix a fat context.

### Enforcement

- **Leaf/container audit:** For each component, check: does it have both `useState`/`useEffect` AND more than 10 lines of JSX return? If yes, split.
- **Hook concern audit:** For each custom hook, describe its concern in ONE verb + ONE noun. If you need "and", split. Count state variables and effects as a mechanical check.
- **Effect audit:** For each useEffect, verify it has exactly one purpose.
- **Derived state audit:** Search for patterns where `useEffect` sets state based on other state or props. Replace with direct computation in render.
- **State colocation audit:** For each context provider or lifted state, verify that at least two children of the parent actually consume that state. If only one does, push the state down.
- **Render purity audit:** Search for mutations of outer-scope variables during render, side effects during render (API calls, subscriptions, DOM manipulation), and ref reads during render. These break automatic memoization.
- **Manual memoization audit:** Search for useMemo, useCallback, and React.memo. These are unnecessary — memoization is automatic. Remove them; they add noise and can conflict with the optimizer.
- **Context scope audit:** For each context, list all values provided. If their update frequencies differ significantly, split the context.

### Examples

```tsx
// BAD: derived state via useEffect
function FilteredList({ items, filter }: Props) {
  const [filtered, setFiltered] = useState(items);

  useEffect(() => {
    setFiltered(items.filter(i => i.name.includes(filter)));
  }, [items, filter]);

  return <List items={filtered} />;
}

// GOOD: derived state computed directly in render (compiler memoizes automatically)
function FilteredList({ items, filter }: Props) {
  const filtered = items.filter(i => i.name.includes(filter));
  return <List items={filtered} />;
}
```

```tsx
// BAD: two effects in one useEffect
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = handleMessage;

  const interval = setInterval(sendPing, 30000);

  return () => {
    ws.close();
    clearInterval(interval);
  };
}, [url]);

// GOOD: one effect per useEffect
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = handleMessage;
  return () => ws.close();
}, [url]);

useEffect(() => {
  const interval = setInterval(sendPing, 30000);
  return () => clearInterval(interval);
}, []);
```

```tsx
// BAD: god hook — manages connection, parsing, and UI state
function useGameDashboard(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [rawMessages, setRawMessages] = useState<string[]>([]);
  const [parsedState, setParsedState] = useState<GameState | null>(null);
  const [selectedTab, setSelectedTab] = useState<Tab>("overview");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => { /* WebSocket connection */ }, [url]);
  useEffect(() => { /* parse rawMessages into parsedState */ }, [rawMessages]);
  useEffect(() => { /* auto-collapse on disconnect */ }, [isConnected]);

  return { isConnected, parsedState, selectedTab, setSelectedTab, isExpanded, setIsExpanded };
}

// GOOD: split by concern, composed in container
function useConnection(url: string) { /* WebSocket only */ }
function useGameState(rawMessages: string[]) { /* parsing only */ }
// UI state (selectedTab, isExpanded) stays as plain useState in the container
```

```tsx
// BAD: impure render — mutates outer-scope variable, breaks compiler optimization
let renderCount = 0;
function Parent({ cards }: Props) {
  renderCount++;  // side effect during render — compiler bails out
  const sorted = cards.sort();  // mutates the props array!

  return <CardGrid cards={sorted} />;
}

// GOOD: pure render — compiler can fully optimize
function Parent({ cards }: Props) {
  const sorted = [...cards].sort();  // new array, no mutation

  return <CardGrid cards={sorted} />;
}
```

```tsx
// BAD: state hoisted too high — entire tree re-renders on hover
function App() {
  const [hoveredCard, setHoveredCard] = useState<CardId | null>(null);

  return (
    <Layout>
      <Sidebar />           {/* re-renders on every hover change */}
      <Header />             {/* re-renders on every hover change */}
      <CardGrid onHover={setHoveredCard} />
      <CardPreview cardId={hoveredCard} />
    </Layout>
  );
}

// GOOD: state colocated — only the components that need it re-render
function CardArea() {
  const [hoveredCard, setHoveredCard] = useState<CardId | null>(null);

  return (
    <>
      <CardGrid onHover={setHoveredCard} />
      <CardPreview cardId={hoveredCard} />
    </>
  );
}

function App() {
  return (
    <Layout>
      <Sidebar />
      <Header />
      <CardArea />  {/* hover state is contained here */}
    </Layout>
  );
}
```

### Edge Cases

- **Form components** with a few `useState` calls for controlled inputs and minimal JSX are exempt from the leaf/container split. The complexity threshold is: more than 3 state variables OR more than 1 effect.
- **Contexts** that provide both state and dispatch are fine as one unit (this is the standard reducer pattern).
- **Third-party hook wrappers** that combine multiple library hooks into one domain hook are acceptable when the library's API is the concern (e.g., `useQuery` + `useMutation` for one resource).
- **Optimizer bail-outs** are silent — the component still works, just without automatic memoization. If performance degrades unexpectedly, check for impure renders. Common causes: mutating props/state, reading refs during render, calling non-idempotent functions during render.
- **Third-party components** that rely on referential equality for their own internal optimizations (e.g., virtualized lists with `itemData`) may still benefit from manual memoization at the integration boundary. This is rare — verify before adding.
- **Effect dependencies** still need stable references for correctness (not just performance). If an effect dep is a new object every render, the effect re-fires every render. Automatic memoization handles this, but impure code that breaks the optimizer will surface as infinite effect loops — the same symptom as missing useMemo, but the root cause is impurity.

---

## 5. Naming

### Rule

- Files are named after the ONE thing they export. `fusion-scorer.ts` exports `fusionScorer` or `FusionScorer`.
- Never `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`. These are junk drawers that grow unbounded.
- Greppable names: full words, no abbreviations. `computeInitialScores` not `compInitScores`.
- Casing conventions: `kebab-case.ts` for files, `PascalCase.tsx` for component files, `use-thing.ts` for hook files, `camelCase` for functions/variables, `PascalCase` for types/interfaces, `UPPER_SNAKE_CASE` for module-level constants.
- Boolean variables and props are phrased as questions: `isVisible`, `hasError`, `canSubmit`.

### Why (for agents)

The agent's first action on any task is search. It greps for a function name, a type name, or a concept. If names are abbreviated, inconsistently cased, or stuffed into junk-drawer files, the agent wastes cycles on false positives and missed results. Every minute spent finding code is a minute not spent understanding or changing it.

The one-export-per-file rule means the agent can predict file contents from the filename. `fusion-scorer.ts` contains the fusion scorer. No surprises.

### Enforcement

- **Junk drawer audit:** Search for files named `utils`, `helpers`, `common`, `misc`, `shared`. Rename or split every one.
- **Abbreviation audit:** Search for identifier names shorter than 5 characters (excluding standard ones like `i`, `db`, `id`, `fn`). Verify each is a universally understood abbreviation.
- **Casing audit:** Verify all filenames match `kebab-case.ts` or `PascalCase.tsx` (components). Verify all types are `PascalCase`, all functions `camelCase`, all constants `UPPER_SNAKE_CASE`.
- **Boolean naming audit:** Search for boolean-typed variables/props. Verify names start with `is`, `has`, `can`, `should`, `will`, or `did`.

### Examples

```
# BAD filenames
utils.ts              -- what utils? Could contain anything.
cardHelpers.ts        -- camelCase filename, junk drawer name
compScoreCalc.ts      -- abbreviated, unclear

# GOOD filenames
compute-hand-score.ts -- clear verb-noun, kebab-case
fusion-chain-finder.ts -- specific, greppable
use-player-hand.ts    -- hook convention, specific concern
```

```typescript
// BAD: boolean props
<Modal open={true} animate={true} overlay={false} />

// GOOD: boolean props as questions
<Modal isOpen={true} shouldAnimate={true} hasOverlay={false} />
```

### Edge Cases

- **Single-letter variables** in tight scopes (loop indices `i`, `j`, `k`; lambda parameters `x => x + 1`) are acceptable.
- **Domain abbreviations** that are universal in the project's domain are acceptable if defined in a project glossary: `ATK` for attack in a card game, `EV` for expected value.
- **`types.ts`** as a filename is acceptable when the file contains only type definitions for a specific module and is co-located with that module (e.g., `scoring/types.ts` contains only scoring-related types).

---

## 6. Types as Documentation

### Rule

- The type system is the primary source of truth. An agent reads types before reading implementation.
- Discriminated unions for state machines. Never boolean flags + null fields for state.
- No `any`. No type assertions (`as`) except at system boundaries (API response parsing, library type workarounds). Each assertion must have a comment explaining why.
- Narrow parameter types to what is actually used. A function that needs a card's attack value accepts `{ attack: number }`, not `Card`.
- Branded types for IDs that must not be confused.

### Why (for agents)

The type checker is the agent's most reliable verification tool. Every constraint encoded in the type system is a constraint the agent cannot violate without a compiler error. Every constraint NOT in the type system is a constraint the agent can silently break.

Discriminated unions are particularly powerful: when the agent matches on `status: "running"`, the compiler narrows the type automatically. The agent cannot accidentally access `result` on a running state. Boolean flags provide no such protection.

Narrow parameter types serve double duty: they document what the function actually needs, and they prevent the agent from accidentally depending on fields that happen to be available but are not part of the contract.

### Enforcement

- **Any audit:** Search for `any` in all `.ts` and `.tsx` files. Every instance must be justified by a comment at a system boundary.
- **Assertion audit:** Search for `as ` type assertions. Every instance must have a comment.
- **State modeling audit:** Search for interfaces with multiple boolean fields (`isLoading`, `isError`, `isDone`). Convert to discriminated unions.
- **Parameter width audit:** For functions that accept an object type, check: does the function use all fields of that type? If not, narrow the parameter.

### Examples

```typescript
// BAD: boolean state
interface FetchState {
  isLoading: boolean;
  data: Data | null;
  error: Error | null;
  // What does isLoading=false, data=null, error=null mean? Uninitialized? Silent failure?
}

// GOOD: discriminated union
type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Data }
  | { status: "error"; error: Error };
```

```typescript
// BAD: wide parameter
function computeAttackBonus(card: Card): number {
  return card.attack * 0.1;  // only uses .attack, but accepts entire Card
}

// GOOD: narrow parameter
function computeAttackBonus(attack: number): number {
  return attack * 0.1;
}
// Or for multiple fields:
function computeAttackBonus(card: Pick<Card, "attack" | "element">): number { ... }
```

```typescript
// BAD: confusable IDs
function addCardToDeck(cardId: number, deckId: number) { ... }
addCardToDeck(deckId, cardId);  // compiles fine, runtime disaster

// GOOD: branded types
type CardId = number & { readonly __brand: "CardId" };
type DeckId = number & { readonly __brand: "DeckId" };
function addCardToDeck(cardId: CardId, deckId: DeckId) { ... }
addCardToDeck(deckId, cardId);  // compile error
```

### Edge Cases

- **Library types** sometimes force `any` or `as`. This is acceptable at the boundary, with a comment. Example: `const result = response.json() as unknown as ApiResponse; // API contract validated by schema`.
- **Generic utilities** (e.g., a typed `groupBy`) legitimately accept wide generic types. The rule is about domain functions, not generic utilities.
- **Performance-critical code** may use `as` to avoid runtime checks that the type system cannot express. Document the invariant being asserted.

---

## 7. Directness

### Rule

- Every layer of indirection — a wrapper, a re-export, an abstraction — must earn its existence. If removing a layer would make the code equally clear, remove it.
- Direct imports to source files. No barrel exports (`index.ts` re-exports).
- No dependency injection in frontend applications. Use `vi.mock` for test isolation.
- No wrapper functions that just forward arguments to another function.
- If a helper function is used in only one place, inline it. Extract only after 3 or more uses.

### Why (for agents)

Every layer of indirection has a compounding cost. The reader must pause, jump to another location, rebuild context, then return. This cost is paid on every read — not once when the abstraction is introduced, but every time anyone touches the code path. Three layers deep and the reader is navigating the abstraction rather than understanding the logic.

The practical signals: barrel files create false positives when grepping. Wrapper functions that forward arguments force a trace-through to the real implementation. Single-use helpers scatter logic across two locations when one would be clearer. DI frameworks in frontend apps add a resolution layer between "what is called" and "what runs." Each of these is a hop that adds no clarity.

### Enforcement

- **Barrel audit:** Search for `index.ts` files that contain `export ... from` statements. Delete them and update imports to point directly.
- **Wrapper audit:** Search for functions whose body is a single `return otherFunction(...)` call with the same arguments. Inline or delete.
- **Single-use helper audit:** For each non-exported function, count its call sites. If 1, consider inlining. If 2, keep but watch. If 3+, it justifies existence.

### Examples

```typescript
// BAD: wrapper that adds nothing
function fetchCards(): Promise<Card[]> {
  return apiClient.get<Card[]>("/cards");
}

// GOOD: just use apiClient.get directly at call sites
// Unless fetchCards adds real logic (caching, transformation, retry)
```

### Edge Cases

- **Re-exporting types** from a third-party library with narrower typing is an adapter, not a barrel — it adds value.
- **DI is acceptable** in backend services where constructor injection enables genuine test isolation without module mocking. The rule is specifically about frontend React applications.

---

## 8. Testing

### Rule

- Tests co-located with source: `thing.ts` and `thing.test.ts` in the same directory.
- Test names are behavior statements: `it("returns 0 when hand has no fusions")`.
- Each test is self-contained. No shared mutable state between tests. Shared factories and builders are fine.
- A unit test tests ONE exported function. Not a whole module.
- Integration tests use `.integration.test.ts` naming and can be skipped for fast feedback.

### Why (for agents)

Tests are the agent's executable specification. Before modifying a function, the agent reads its tests to understand intended behavior. This only works if:
1. Tests are findable (co-located, predictable naming).
2. Tests are readable (behavior descriptions, not test IDs).
3. Tests are trustworthy (self-contained, no hidden coupling).
4. Tests are fast (the agent runs them after every change).

When tests share mutable state, a failure in test N might be caused by test N-1, and the agent cannot diagnose this. Self-contained tests mean: if a test fails, the bug is in the code under test or in that specific test, nowhere else.

### Enforcement

- **Co-location audit:** For every `.ts` file with exported functions, verify a `.test.ts` file exists in the same directory.
- **Test name audit:** Verify every `it()` or `test()` string starts with a verb and describes observable behavior.
- **Isolation audit:** Search for `let` declarations at `describe` scope that are mutated in `beforeEach`. These are shared mutable state -- convert to per-test setup.
- **Naming audit:** Verify no test file uses `.integration.test.ts` conventions for unit tests or vice versa.

### Examples

```typescript
// BAD: shared mutable state, opaque name
describe("scorer", () => {
  let scorer: Scorer;
  let testData: Card[];

  beforeEach(() => {
    scorer = new Scorer();
    testData = generateCards(10);  // what cards? what properties matter?
  });

  it("test case 1", () => {
    expect(scorer.score(testData)).toBe(42);
  });

  it("test case 2", () => {
    testData.push(strongCard);  // mutates shared state!
    expect(scorer.score(testData)).toBe(99);
  });
});

// GOOD: self-contained, descriptive
describe("computeHandScore", () => {
  it("returns 0 when hand has no monsters", () => {
    const hand = [spellCard(), spellCard(), trapCard()];
    expect(computeHandScore(hand, FUSION_TABLE)).toBe(0);
  });

  it("returns the highest single monster attack when no fusions possible", () => {
    const hand = [monsterCard({ attack: 1200 }), monsterCard({ attack: 800 })];
    expect(computeHandScore(hand, EMPTY_FUSION_TABLE)).toBe(1200);
  });
});
```

### Edge Cases

- **Snapshot tests** are acceptable for component rendering but must not be the only test. Pair with behavioral assertions.
- **Test helpers / factories** (`buildCard({ attack: 1200 })`) are shared code that is acceptable because they are pure, deterministic, and produce fresh instances per call.
- **Expensive setup** (loading large data files, starting servers) can be shared via `beforeAll` at the outermost describe scope. But the data must be treated as read-only within tests.

---

## 9. Error Handling

### Rule

- Expected failures (invalid input, network errors, user errors): return a result type.
- Unexpected failures (invariant violations, programming errors): throw an error.
- No silent catches. No `catch (e) { console.error(e); }` as error handling.
- Workers and async processes: send structured error messages through their communication channel, never crash silently.

### Why (for agents)

When the agent encounters a `try/catch`, it needs to understand: is this catching expected failures (part of the contract) or unexpected failures (bugs)? When both are caught the same way, the agent cannot distinguish between "handle this gracefully" and "this should never happen."

Result types make expected failures part of the function signature. The agent (and the type checker) can verify that all failure cases are handled. Thrown errors for invariant violations make bugs loud and immediate.

Silent catches are invisible to the agent. It cannot grep for error handling because there is no observable consequence. The bug surfaces somewhere else, far from the actual cause.

### Enforcement

- **Silent catch audit:** Search for `catch` blocks that only contain `console.error` or `console.log`. These must either re-throw, return a result type, or set observable error state.
- **Result type audit:** Functions that can fail in expected ways must have a return type that encodes failure. Search for functions that return `T | null` where `null` means "error" -- convert to `{ ok: true; data: T } | { ok: false; error: E }`.

### Examples

```typescript
// BAD: null means both "not found" and "error occurred"
function findCard(id: number): Card | null {
  try {
    return database.get(id);
  } catch {
    console.error("Failed to find card");
    return null;
  }
}

// GOOD: result type distinguishes cases
type FindResult =
  | { ok: true; card: Card }
  | { ok: false; error: "not_found" | "db_error"; message: string };

function findCard(id: number): FindResult {
  const card = database.get(id);
  if (!card) return { ok: false, error: "not_found", message: `Card ${id} not found` };
  return { ok: true, card };
}

// Invariant violation: throw, do not return
function getCardOrThrow(id: number): Card {
  const card = database.get(id);
  if (!card) throw new Error(`Invariant: card ${id} must exist (was validated upstream)`);
  return card;
}
```

### Edge Cases

- **React error boundaries** are legitimate catch-all mechanisms at the UI layer. They catch rendering errors that cannot be handled locally.
- **Top-level process handlers** (`process.on("unhandledRejection")`) are legitimate catch-alls for logging/monitoring before exit.
- **Fire-and-forget analytics** can legitimately swallow errors (analytics failure must never break the app). But wrap this pattern in a named function like `safeTrack` that makes the intent explicit.

---

## 10. Reading Order

### Rule

- Files read top-to-bottom: exported functions first, then private helper functions.
- If function A calls function B, write A before B.
- Types and interfaces at the top of the file.
- Constants before the functions that use them.

### Why (for agents)

The agent reads files linearly, from top to bottom. If the main exported function is at line 200 and the private helpers it calls are at line 10, the agent reads 200 lines of context it does not yet understand before reaching the entry point. This is backwards. The agent should encounter the high-level flow first (the export), then drill into details (the helpers) as needed.

This is how humans write articles (headline, then details) and how APIs are documented (public interface, then internals). Code should follow the same pattern.

### Enforcement

- **Export position audit:** For each file, verify that exported symbols appear before non-exported symbols in the source order.
- **Call order audit:** For each file, verify that if function A calls function B, A appears before B in the file (A has a lower line number).
- **Type position audit:** Verify type/interface definitions appear before the functions that use them.

### Examples

```typescript
// BAD: helpers before the export
function validateInput(x: number): boolean { ... }
function clampValue(x: number, min: number, max: number): number { ... }

export function computeScore(cards: Card[]): number {
  // uses validateInput and clampValue
}

// GOOD: export first, then helpers
export function computeScore(cards: Card[]): number {
  // uses validateInput and clampValue
}

function validateInput(x: number): boolean { ... }
function clampValue(x: number, min: number, max: number): number { ... }
```

### Edge Cases

- **Mutually recursive functions** cannot satisfy "A before B if A calls B" since both call each other. Place them adjacent and add a comment: `// mutually recursive with functionB below`.
- **Class methods** do not need to follow this rule strictly. Public methods before private methods is sufficient.

---

## 11. Deletion Over Deprecation

### Rule

- Dead code gets deleted. Not commented out, not prefixed with `_unused`, not wrapped in `if (false)`.
- Git has history. If you need old code, check the log.
- No `// removed` or `// deprecated` comments referencing deleted code.
- No re-exports of deleted types for backwards compatibility (this is an application, not a library).
- If a symbol is not imported by any other file, it does not justify its existence unless it is an entry point.

### Why (for agents)

Dead code is a trap. The agent cannot tell the difference between "this function is unused" and "this function is used by a code path I haven't found yet." The agent will read it, try to understand it, and potentially modify it -- all wasted effort.

Commented-out code is worse: the agent may interpret it as intentional documentation of an alternative approach, and try to incorporate it into its changes.

Unused imports, unused variables, and unreachable code branches all waste agent context and create confusion about the codebase's actual shape.

### Enforcement

- **Dead code audit:** Run the TypeScript compiler with `noUnusedLocals` and `noUnusedParameters`. Fix all warnings.
- **Comment audit:** Search for large commented-out code blocks (3+ consecutive lines starting with `//`). Delete them.
- **Export audit:** For each exported symbol, verify it has at least one importer. Unexported entry points (workers, scripts) are exempt.

### Examples

```typescript
// BAD: commented-out code as "documentation"
function computeScore(hand: Card[]): number {
  // Old implementation:
  // const score = hand.reduce((sum, c) => sum + c.attack, 0);
  // return score * MULTIPLIER;

  // New implementation:
  return evaluateHand(hand);
}

// GOOD: just the current implementation
function computeScore(hand: Card[]): number {
  return evaluateHand(hand);
}
// Git blame shows the old implementation if anyone needs it.
```

### Edge Cases

- **TODO comments** with a clear action item are not dead code. `// TODO: handle the case where fusion table is empty` is a legitimate note. But `// TODO: remove this` means remove it now.
- **Feature flags** that temporarily disable code are acceptable short-term. But code behind a permanently-off flag is dead code.
- **Test fixtures** and mock data that are not currently referenced by any test should be deleted, not kept "in case we need them."

---

## 12. Project Structure

### Rule

- **Group by feature, not by type.** A feature directory owns its components, hooks, atoms, types, and tests. `features/deck/` contains the deck panel, its hooks, its atoms, its tests — not `hooks/use-deck.ts` + `components/DeckPanel.tsx` + `atoms/deck-atoms.ts` scattered across the tree.
- **Colocation is self-containment at the directory level.** The same principle that makes a component own its state makes a feature own its files. If a file is only relevant to one feature, it lives inside that feature.
- **Placement follows ownership, not consumer count.** Used by one feature → inside that feature. Used by many but clearly owned by one → in the owning feature, others import the public surface (a hook, a context consumer, a type). Used by 3+ features with no clear owner → `shared/`.
- **`shared/` is earned.** It holds a small, curated set of cross-cutting contracts — not a staging area for code you haven't categorized yet. If you cannot name the 3+ unrelated features that need it, it doesn't belong there.
- **Cross-feature imports target the public surface.** Features may import hooks, contexts, and types from other features. Never internal components or implementation details.
- **Flat until painful.** No subdirectories within a feature until it exceeds ~15 files. Premature nesting obscures content and creates navigation overhead for no structural benefit.
- **No barrel files.** (From §7.) Direct imports to the source file. The import path is the dependency graph.

### Why (for agents)

The agent's first task on any work item is orientation: which files do I need to read and possibly modify? Feature-grouped code answers this immediately — `features/deck/` contains everything about decks. Type-grouped code (`hooks/`, `components/`, `atoms/`) scatters a single concern across 3+ directories, forcing the agent to reconstruct relationships through import tracing. This orientation cost is paid on every task and compounds quickly.

Colocation also bounds blast radius. When the agent modifies a hook in `features/deck/`, the likely impacted files are in the same directory. When it modifies `hooks/use-deck.ts`, the impacted components could be anywhere in the tree.

`shared/` as an earned status prevents the gravitational pull toward "put it in shared because I'm not sure where it goes." This is exactly how `lib/` and `utils/` directories grow into grab-bags — they have no admission criteria, so everything drifts in. The ownership question ("which feature owns this?") is the admission check. When the answer is clear, the file belongs in that feature regardless of how many others consume it. When no feature owns it and it is genuinely cross-cutting, `shared/` is the right home.

The flat-until-painful rule prevents premature nesting from hiding the actual size and complexity of a feature. A flat directory with 12 files tells the agent "this is a moderately complex feature" at a glance. The same 12 files nested into `components/`, `hooks/`, `state/` looks like a sophisticated module when it's not.

### Enforcement

- **Feature completeness audit:** For each feature directory, check that its hooks, state, and tests are co-located. A hook in `shared/` that is only consumed by one feature should move into that feature.
- **`shared/` audit:** For each file in `shared/`, verify it is imported by 3+ feature directories with no single clear owner. Files that fail this check should move to the consuming or owning feature.
- **Cross-feature depth audit:** When a feature imports from another feature, verify the import targets a top-level file — a hook, context, or type. Imports reaching into nested paths (`../other-feature/components/InternalThing.tsx`) signal a boundary violation.
- **Flat structure audit:** Feature directories with subdirectories should have 15+ total files. Below that, flatten.

### Examples

```
# BAD: type-grouped structure (concerns scattered across directories)
src/ui/
├── hooks/
│   ├── use-deck.ts           ← deck concern
│   ├── use-hand.ts           ← hand concern
│   ├── use-bridge.ts         ← bridge concern
├── components/
│   ├── DeckPanel.tsx          ← deck concern
│   ├── HandDisplay.tsx        ← hand concern
│   ├── BridgeSetupGuide.tsx   ← bridge concern
├── atoms/
│   ├── deck-atoms.ts          ← deck concern
│   ├── optimize-atoms.ts      ← optimize concern

# GOOD: feature-grouped (colocated concerns)
src/ui/
├── shared/                    ← cross-cutting contracts only
│   ├── format.ts
│   ├── card-db-context.tsx
├── components/                ← domain-free UI primitives
│   ├── Button.tsx
│   ├── Dialog.tsx
├── features/
│   ├── deck/
│   │   ├── DeckPanel.tsx
│   │   ├── deck-atoms.ts
│   │   ├── use-deck.ts
│   │   ├── use-deck-entries.ts
│   │   ├── use-deck-score.ts
│   ├── bridge/
│   │   ├── bridge-context.tsx
│   │   ├── bridge-message-processor.ts
│   │   ├── use-emulator-bridge.ts
│   │   ├── BridgeSetupGuide.tsx
```

```
# BAD: shared/ as dumping ground
shared/
├── format.ts                  ← used by 5 features, no owner — fine here
├── bridge-context.tsx         ← owned by bridge — move to features/bridge/
├── use-deck-score.ts          ← only used by deck — move to features/deck/
├── atoms.ts                   ← 30 atoms for 8 features — split and colocate

# GOOD: shared/ is minimal and justified
shared/
├── format.ts                  ← used by 5 features, no single owner
├── card-db-context.tsx        ← used by 6 features, no single owner
├── local-store.ts             ← generic storage, no domain allegiance
```

### Edge Cases

- **Contexts owned by a feature but consumed by many** (e.g., `BridgeContext` created in `features/bridge/` but consumed by `hand`, `collection`, etc.) stay in the owning feature. The consumer imports the hook (`useBridge`), not the context internals. This is a cross-feature import of a public surface — exactly like importing a library's exported API.
- **Atoms written by one feature, read by another** (e.g., `isOptimizingAtom` written by `optimize/`, read by `result/`): the atom lives in the feature that writes it. Readers import the atom directly. The write-owner is the canonical owner.
- **`components/`** (shared UI primitives like Button, Dialog, Input) is not `shared/`. Components are domain-free building blocks. `shared/` contains domain-aware cross-cutting code. They serve different purposes and coexist.
- **`core/`** (bootstrap infra — Convex client, identity) is consumed only by the app root. It is not a feature and not shared infrastructure — it is wiring. Keep it separate and small.
- **When a feature outgrows flat structure:** If a feature grows past ~20 files, first check if it actually contains two distinct concerns that should be separate features. If it is genuinely one cohesive concern, introduce subdirectories for the internal components while keeping hooks and domain logic at the feature root. Don't split a cohesive feature just to hit a file count target.
- **Migration is incremental.** When touching a file in a legacy location for feature work, move it to its owning feature in a separate commit before the behavior change. Don't reorganize directories you aren't working in — that's churn with no immediate payoff.
