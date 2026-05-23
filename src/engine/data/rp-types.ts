/** Ordered by the packed card-stat type encoding in the PS1 executable. */
export const monsterCardTypes = [
  "Dragon",
  "Spellcaster",
  "Zombie",
  "Warrior",
  "BeastWarrior",
  "Beast",
  "WingedBeast",
  "Fiend",
  "Fairy",
  "Insect",
  "Dinosaur",
  "Reptile",
  "Fish",
  "SeaSerpent",
  "Machine",
  "Thunder",
  "Aqua",
  "Pyro",
  "Rock",
  "Plant",
] as const;

export const nonMonsterCardTypes = ["Magic", "Trap", "Ritual", "Equip"] as const;

export const cardTypes = [...monsterCardTypes, ...nonMonsterCardTypes] as const;

export type MonsterCardType = (typeof monsterCardTypes)[number];
export type NonMonsterCardType = (typeof nonMonsterCardTypes)[number];
export type CardType = (typeof cardTypes)[number];

export const cardTypeDisplayNames: Readonly<Partial<Record<CardType, string>>> = {
  BeastWarrior: "Beast-Warrior",
  WingedBeast: "Winged Beast",
  SeaSerpent: "Sea Serpent",
};

export const cardTypeAliases: Readonly<Record<string, CardType>> = {
  "Beast-Warrior": "BeastWarrior",
  "Winged Beast": "WingedBeast",
  "Sea Serpent": "SeaSerpent",
};

export const fusionOnlyKinds = ["Female", "MothInsect", "SharkFish"] as const;

export type FusionOnlyKind = (typeof fusionOnlyKinds)[number];
export type CardKindCardType = Exclude<MonsterCardType, "BeastWarrior">;

const cardKindCardTypes = monsterCardTypes.filter(
  (type) => type !== "BeastWarrior",
) as readonly CardKindCardType[];

export const cardKinds: readonly (CardKindCardType | FusionOnlyKind)[] = [
  ...cardKindCardTypes,
  ...fusionOnlyKinds,
];

export const colors = ["blue", "yellow", "orange", "red", "purple", "green", "pink"] as const;

export const guardianStars = [
  "None",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Pluto",
  "Neptune",
  "Mercury",
  "Sun",
  "Moon",
  "Venus",
] as const;
