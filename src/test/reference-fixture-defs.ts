/**
 * Fixture definitions for the reference scorer.
 *
 * These contain ONLY inputs (card IDs + descriptions) — no expected values.
 * Run `bun run gen:ref` to compute scores and write reference-fixtures.gen.ts.
 */

export interface HandFixtureDef {
  hand: number[];
  description: string;
}

export interface DeckFixtureDef {
  deck: number[];
  description: string;
}

// ---------------------------------------------------------------------------
// Hand-level fixture definitions (~16 scenarios)
// ---------------------------------------------------------------------------

export const handFixtureDefs: HandFixtureDef[] = [
  {
    hand: [273, 403, 279, 453, 277],
    description:
      "No-fusion hand: MazeraDeVille(3300), Zoa(3100), KingOfYamimakai(3000), Exodius(3000), DestinyHeroDogma(2900)",
  },
  {
    hand: [56, 443, 403, 279, 453],
    description:
      "Single fusion: HarpieLady(1100)+ArchfiendOfGilfer(2200)=MazeraDeVille(3300), fillers Zoa/KingOfYamimakai/Exodius",
  },
  {
    hand: [56, 66, 58, 403, 279],
    description:
      "2-chain: HarpieLady+UnknownWarrior→ArchfiendOfGilfer→+FaithBird→MazeraDeVille(3300)",
  },
  {
    hand: [26, 66, 56, 58, 403],
    description:
      "3-chain max depth: SkullServant+UnknownWarrior→InfernalGainer→+HarpieLady→ArchfiendOfGilfer→+FaithBird→MazeraDeVille(3300)",
  },
  {
    hand: [26, 66, 56, 58, 6],
    description:
      "3-chain with weak filler: depth limit verified (max 3 fusions), PetitDragon(600) as 5th card",
  },
  {
    hand: [66, 56, 46, 6, 73],
    description:
      "Re-fuse by kind: ArchfiendOfGilfer(Fiend) re-fuses with Leogun(Beast) to Barox(2380)",
  },
  {
    hand: [56, 443, 174, 6, 73],
    description:
      "Multiple chains: HarpieLady+ArchfiendOfGilfer→MazeraDeVille(3300) wins over HarpieLady+Dissolverock→MysticalSand(2100)",
  },
  {
    hand: [401, 439, 6, 73, 176],
    description:
      "Strict improvement: DarkMagician(2500)+GravekeepersCommandant(2100) don't fuse (no result > 2500)",
  },
  {
    hand: [453, 279, 443, 56, 403],
    description: "Commutativity: same cards as single-fusion fixture in reversed order",
  },
  {
    hand: [73, 73, 73, 73, 73],
    description: "All identical: 5x Kuriboh(300), no self-fusion",
  },
  {
    hand: [12, 13, 26, 6, 73],
    description:
      "Diamond graph: TimeWizard/MagiciansValkyria/SkullServant overlap, best path→DMGirl(2500)",
  },
  {
    hand: [26, 66, 56, 46, 58],
    description:
      "Chain with branching: multiple paths after first fusion, best reaches MazeraDeVille(3300)",
  },
  {
    hand: [56, 66, 58, 403, 6],
    description: "Chain beats high-ATK: chain→MazeraDeVille(3300) > Zoa(3100) standalone",
  },
  {
    hand: [56, 66, 398, 6, 73],
    description: "High-ATK standalone wins: DarkBlade(2800) > chain→ArchfiendOfGilfer(2200)",
  },
  {
    hand: [12, 13, 6, 73, 176],
    description:
      "Name-name priority: TimeWizard+MagiciansValkyria→DMGirl(2500) via name-name recipe",
  },
  {
    hand: [56, 66, 58, 13, 46],
    description: "Real FM scenario: Harpie Lady chain with multiple fusion materials",
  },
];

// ---------------------------------------------------------------------------
// Deck-level fixture definitions (3 scenarios)
// ---------------------------------------------------------------------------

export const deckFixtureDefs: DeckFixtureDef[] = [
  {
    deck: [
      273, 403, 279, 453, 277, 415, 398, 287, 281, 431, 401, 272, 229, 382, 285, 269, 445, 443, 271,
      458, 439, 481, 274, 437, 446, 440, 84, 14, 61, 139, 125, 37, 99, 98, 49, 75, 60, 118, 138, 46,
    ],
    description: "Greedy initial deck: top 40 cards by ATK, baseline expected ATK",
  },
  {
    deck: [
      38, 19, 17, 20, 18, 43, 80, 73, 176, 26, 156, 32, 181, 164, 167, 185, 77, 141, 76, 91, 12,
      470, 119, 27, 183, 31, 105, 65, 67, 180, 160, 147, 6, 9, 143, 148, 33, 170, 79, 22,
    ],
    description: "Weak deck: lowest 40 ATK cards, low expected ATK with some fusions",
  },
  {
    deck: [
      56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 12, 13, 26,
      27, 28, 46, 50, 51, 52, 53, 54, 55, 6, 176, 80, 1, 5, 9, 11, 22,
    ],
    description:
      "Fusion-rich deck: WingedBeast/Fiend/Beast/Spellcaster chains, higher than raw ATK",
  },
];
