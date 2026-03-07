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
    description: "High-ATK Fiends: MazeraDeVille, Zoa, KingOfYamimakai, Exodius, DestinyHeroDogma",
  },
  {
    hand: [56, 443, 403, 279, 453],
    description: "HarpieLady + ArchfiendOfGilfer pair, fillers Zoa/KingOfYamimakai/Exodius",
  },
  {
    hand: [56, 66, 58, 403, 279],
    description: "2-chain: HarpieLady+UnknownWarrior→ArchfiendOfGilfer→+FaithBird chain",
  },
  {
    hand: [26, 66, 56, 58, 403],
    description: "3-chain: SkullServant+UnknownWarrior→...→ArchfiendOfGilfer→+FaithBird",
  },
  {
    hand: [26, 66, 56, 58, 6],
    description: "3-chain with weak filler: PetitDragon(600) as 5th card",
  },
  {
    hand: [66, 56, 46, 6, 73],
    description: "Re-fuse by kind: fusion result re-fuses with Leogun(Beast)",
  },
  {
    hand: [56, 443, 174, 6, 73],
    description: "Multiple chains: HarpieLady+ArchfiendOfGilfer vs HarpieLady+Dissolverock",
  },
  {
    hand: [401, 439, 6, 73, 176],
    description: "Strict improvement: DarkMagician+GravekeepersCommandant don't fuse",
  },
  {
    hand: [453, 279, 443, 56, 403],
    description: "Commutativity: same cards as fixture 2 in different order",
  },
  {
    hand: [73, 73, 73, 73, 73],
    description: "All identical: 5x Kuriboh, no self-fusion",
  },
  {
    hand: [12, 13, 26, 6, 73],
    description: "Diamond graph: TimeWizard/MagiciansValkyria/SkullServant overlapping pairs",
  },
  {
    hand: [26, 66, 56, 46, 58],
    description: "Chain with branching: multiple paths after first fusion",
  },
  {
    hand: [56, 66, 58, 403, 6],
    description: "Chain vs high-ATK standalone: Zoa vs fusion chain",
  },
  {
    hand: [56, 66, 398, 6, 73],
    description: "High-ATK standalone: DarkBlade vs weaker fusion chain",
  },
  {
    hand: [12, 13, 6, 73, 176],
    description: "Name-name fusion: TimeWizard+MagiciansValkyria→DMGirl",
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
