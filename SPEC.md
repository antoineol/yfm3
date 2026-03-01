# YFM2 — Functional Specification

## 1. Purpose

YFM2 is a deck optimizer for "Yu-Gi-Oh! Forbidden Memories" game, "Remastered Perfected" mod. Given a player's card collection, it generates an optimal 40-card monster deck that maximizes the **expected value of the highest attack** achievable from a random 5-card opening hand, considering both direct card plays and fusion chains.

---

## 2. Domain Glossary


| Term             | Definition                                                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Card**         | A monster with an ID, name, attack, defense, one or more kinds (Dragon, Warrior, etc.), and an optional color.                                                                                                          |
| **Kind**         | One of 22 monster types: Dragon, Fairy, Beast, Fiend, Warrior, Zombie, WingedBeast, Machine, Rock, Plant, Dinosaur, Spellcaster, Pyro, Reptile, Aqua, Insect, Thunder, Fish, Female, MothInsect, SharkFish, SeaSerpent. |
| **Color**        | One of: blue, yellow, orange, red. A card has at most one color. Colors can qualify fusion ingredients (see section 3.2).                                                                                               |
| **Collection**   | The set of cards a player owns, each with a quantity (e.g., 3 copies of Blue-Eyes).                                                                                                                                     |
| **Deck**         | A list of exactly 40 card IDs drawn from the collection, respecting ownership quantities.                                                                                                                               |
| **Hand**         | 5 cards drawn uniformly at random (without replacement) from the deck.                                                                                                                                                  |
| **Fusion**       | Combining two cards in hand to produce a new card with higher attack. Fusions are matched by card names, kinds, or color-qualified kinds.                                                                               |
| **Fusion chain** | A sequence of fusions: A+B->X, then X+C->Y, etc. Chains consume up to 5 cards from the hand (3 sequential fusions).                                                                                                     |
| **Score**        | The expected value of the maximum attack achievable from a random 5-card hand.                                                                                                                                          |


---

## 3. Game Data

### 3.1 Card Database

Each card has:

- **ID** (unique integer)
- **Name** (unique string)
- **Kinds** (one or more kind values)
- **Color** (optional)
- **Attack** (non-negative integer)
- **Defense** (non-negative integer)

### 3.2 Fusion Database

Each fusion recipe maps a **pair of ingredients** to a **result card** (with name, attack, defense). The same result card
can be produced by multiple different ingredient pairs.

An ingredient in a fusion recipe is one of:

- A **specific card** (matched by name), e.g. `Red-Eyes Black Dragon`
- A **kind** (matches any card of that kind), e.g. `Dragon`
- A **color-qualified kind** (matches cards of that kind AND that color), e.g. `[Blue] Fairy`

A color-qualified ingredient like `[Blue] Fairy` only matches cards that are both Fairy-kind **and** blue-color. An
unqualified kind ingredient like `Fairy` matches any Fairy regardless of color.

Ingredient order does not matter — (A, B) and (B, A) are the same recipe.

---

## 4. Fusion Resolution Rules

Given two cards in hand, the system checks whether they can fuse. Multiple recipes may match; the **first match in
priority order wins**:

1. **Both by name** — Does a recipe exist for these two exact card names?
2. **One by name, one by kind** — Does a recipe exist matching one card's name and any of the other card's kinds
  (with or without color qualifier)?
3. **Both by kind** — Does a recipe exist matching any kind (with or without color qualifier) of one card with any kind
  of the other?

When a recipe ingredient is color-qualified (e.g. `[Blue] Fairy`), a card only matches if it has **both** the required
kind and the required color. An unqualified kind ingredient matches regardless of color.

**Rule: Strict improvement.** A fusion only happens if the result's attack is strictly greater than both materials'
attack.

**Rule: Commutativity.** `fuse(A, B)` always equals `fuse(B, A)`.

**Rule: Fusion result kind restriction.** When a card is itself the result of a fusion (i.e., an intermediate result in a
chain), its **kinds are never used** for matching. It can still participate in further fusions, but only via:

- Its exact **name** paired with another card's exact **name** (rule 1), or
- Its exact **name** paired with any of the other card's **kinds** (rule 2)

The fusion result's own kinds are ignored entirely. This prevents spurious chains where a fusion result would match
kind-based recipes that were meant for base cards.

---

## 5. Deck Scoring

### 5.1 Goal

Compute the expected value of the maximum attack achievable from a 5-card hand drawn uniformly at random from a 40-card
deck.

### 5.2 Ideal Formula

This is the target formula. Any implementation should approximate it as closely as possible, especially for multi-material
fusions where naive approaches diverge significantly.

```
Score = SUM over all achievable attack values A:
    A * P(A is the maximum achievable attack in the hand)

Where:
    P(A is max) = P(can achieve A) * PRODUCT over all A' > A: (1 - P(can achieve A'))
```

All probabilities follow from the **hypergeometric distribution** (drawing 5 cards without replacement from 40).

### 5.3 Attack Paths

An **attack path** is a way to achieve a specific attack value from a hand. There are four types:


| Type                  | Cards consumed from hand                    | Description                                  |
| --------------------- | ------------------------------------------- | -------------------------------------------- |
| **Direct**            | 1 card                                      | Play a single card for its attack value      |
| **2-material fusion** | 2 distinct cards (or 2 copies of same card) | Fuse A + B -> result                         |
| **3-material chain**  | 3 cards                                     | Fuse A + B -> X, then X + C -> result        |
| **4-material chain**  | 4 cards                                     | Fuse A + B -> X, X + C -> Y, Y + D -> result |


All attack paths are discovered by enumerating combinations of cards **present in the deck**, following the fusion
resolution rules (section 4).

---

## 6. Deck Optimization

### 6.1 Goal

Given a player's collection and (optionally) their current deck, produce a 40-card deck that maximizes the score defined
in section 5.

### 6.2 Input

- **Initial deck** (optional): The player's current deck. May be empty or wrong size.
- **Collection**: Cards owned with quantities.
- **Game database**: All cards and fusion recipes.

### 6.3 Output

- **Optimized deck**: A valid 40-card deck.
- **Final score**: Score of the optimized deck.
- **Initial score**: Score of the input deck (baseline for comparison).
- **Improvement**: Final score minus initial score.

### 6.4 Hard Constraints (invariants on output)

These must **always** hold, regardless of algorithm:

1. **Size**: Exactly 40 cards.
2. **Collection bounds**: For every card, copies in deck ≤ copies owned.
3. **Valid cards**: Every card ID in the deck exists in the game database.
4. **Non-regression**: The output score must be ≥ the input deck's score.

### 6.5 Soft Goals

- The optimizer should find a **near-optimal** deck, not necessarily the global optimum (the search space is too large for
exhaustive search).
- It should support **cancellation**: if interrupted, return the best valid deck found so far.
- It should handle **edge cases** gracefully: empty initial deck, wrong-sized initial deck, collection with only one card
type, collection with exactly 40 cards total.

---

## 7. End-to-End Behavioral Expectations

Testable properties that any correct implementation must satisfy, regardless of algorithm choice. Expected score values
must be adapted to match the implementation's scoring strategy, but the qualitative properties always hold.

### 7.1 Scoring Properties


| ID  | Property                    | Description                                                                                                                                               |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Zero deck                   | An empty deck scores 0.                                                                                                                                   |
| S2  | Single card type            | A deck of 40 copies of a card with attack A scores exactly A (you always draw it).                                                                        |
| S3  | Score bounds                | Score is in `[0, max_attack_in_deck]`. More precisely, `score ≥ min_attack_in_deck` for a full 40-card deck (you always draw something).                  |
| S4  | Monotonicity                | Replacing a card with a strictly higher-attack card (no fusion interactions) should not decrease the score.                                               |
| S5  | Fusion bonus                | A deck with fusion-capable cards should score higher than the same deck with those cards replaced by non-fusing cards of equal attack.                    |
| S6  | Determinism                 | Same deck + same game database = same score. No randomness in scoring.                                                                                    |
| S7  | Probability sanity          | All probabilities are in [0, 1]. For any non-empty deck of size ≥ 5, the sum of `P(A is max)` over all attack values A equals 1.0.                        |
| S8  | More copies = higher chance | Adding more copies of a card to the deck increases the probability of drawing it.                                                                         |
| S9  | High-card replacement       | If the deck's highest achievable attack is A, replacing any card with a card of attack ≥ A that has no fusion interactions should not decrease the score. |


### 7.2 Optimization Properties


| ID  | Property            | Description                                                                                                            |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| O1  | Valid output        | Output deck has exactly 40 cards, all within collection bounds, all valid IDs.                                         |
| O2  | Non-regression      | `finalScore ≥ initialScore`. The optimizer must never make things worse.                                               |
| O3  | Improves weak decks | Given a trivially bad deck and a collection with stronger cards, the optimizer must improve the score.                 |
| O4  | Respects collection | Never uses cards the player doesn't own or exceeds owned quantities.                                                   |
| O5  | Cancellation        | If interrupted, returns the best valid deck found so far.                                                              |
| O6  | Edge cases          | Works when: collection = exactly 40 cards, only one card type available, empty initial deck, wrong-sized initial deck. |


### 7.3 Fusion Resolution Properties


| ID  | Property                  | Description                                                                                      |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| F1  | Name match priority       | A name-name recipe takes precedence over a kind-kind recipe.                                     |
| F2  | Strict improvement        | A fusion only occurs if result attack > both materials' attack.                                  |
| F3  | Commutativity             | fuse(A, B) == fuse(B, A).                                                                        |
| F4  | Chain depth limit         | Fusion chains go at most 3 deep (consume at most 4 cards from hand).                             |
| F5  | Fusion result restriction | Fusion results can re-fuse by name (with name or kind of the other card), but never by own kind. |


---

## 8. Out of Scope

- Spell, Equip, and Trap cards (excluded kinds: Magic, Equip, Trap)
- Defense-based scoring
- Multiplayer or opponent modeling
- Card draw order beyond the initial 5-card hand
- Deck ordering effects (only composition matters for scoring)

