# Game Data Extraction

Extract card stats, fusions, equips, duelist data, and card images from a Yu-Gi-Oh! Forbidden Memories PS1 disc image (.bin file).

## Prerequisites

- [Bun](https://bun.sh/) runtime
- A PS1 disc image in MODE2/2352 format (`.bin` file). The `.cue` file is not required.

## Usage

```bash
bun run scripts/extract-game-data.ts <path-to.bin> [output-dir]
```

Default output directory: `./public/data` (versioned, served by the app at `/data/`)

Card thumbnail images are always written to `./gamedata/card-images/` (not versioned).

Example:

```bash
bun run scripts/extract-game-data.ts "gamedata/Yu-Gi-Oh! FM REMASTERED PERFECTED.bin"
```

## Output Files

### cards.csv

All 722 cards with stats, descriptions, starchip costs, and passwords.

| Column | Description |
|--------|-------------|
| id | Card ID (1-722) |
| name | Card name (TBL-decoded) |
| atk | Attack value |
| def | Defense value |
| guardian_star_1 | Primary guardian star (Mars, Jupiter, Saturn, etc.) |
| guardian_star_2 | Secondary guardian star |
| type | Card type (Dragon, Spellcaster, Magic, Trap, Equip, etc.) |
| color | UI color (yellow, blue, green, purple, orange, red, or empty) |
| level | Card level (0 for spells/traps, 1-12 for monsters) |
| attribute | Card attribute (Light, Dark, Water, Fire, Earth, Wind, or empty) |
| starchip_cost | Starchip cost to purchase |
| password | In-game password (empty if none) |
| description | Card description text |

### fusions.csv

All 9168 fusion combinations.

| Column | Description |
|--------|-------------|
| material1_id | First material card ID |
| material2_id | Second material card ID |
| result_id | Resulting card ID |
| result_atk | Attack of the resulting card |

### equips.csv

Which equip cards can be applied to which monsters. One row per equip-monster pair (long format).

| Column | Description |
|--------|-------------|
| equip_id | Equip card ID |
| monster_id | Monster card ID that can receive this equip |

### duelists.csv

Duelist deck compositions and card drop rates. Only rows where at least one rate > 0 are included. All rates are **probability weights out of 2048**: `rate / 2048` = probability.

| Column | Description |
|--------|-------------|
| duelist_id | Duelist ID (1-39) |
| duelist_name | Duelist name |
| card_id | Card ID |
| deck | **Deck pool weight.** How likely the AI includes this card when building its 40-card deck. Higher = more likely to appear. |
| sa_pow | **SA-POW drop weight.** Probability of dropping this card when you win with an S/A rank via Power victory. |
| bcd | **BCD drop weight.** Probability of dropping this card when you win with a B/C/D rank. |
| sa_tec | **SA-TEC drop weight.** Probability of dropping this card when you win with an S/A rank via Tec (technique) victory. |

**How drops work:** After each duel, the game picks a drop category based on your rank (S/A vs B/C/D) and victory type (POW vs TEC). It then uses the PRNG to select a card from the corresponding probability table. Each table has 2048 total weight, and the game accumulates weights across all 722 cards until it passes the random threshold.

### card-images/

722 PNG thumbnails (40x32 pixels), named `001.png` through `722.png`. These are the small card portraits from the game, stored as 8-bit indexed color with a 64-entry RGB555 palette per card.

## Data Sources

The script reads two files from the disc image via ISO 9660 filesystem parsing:

- **SLUS_014.11** -- The PS1 game executable. Contains card stats, names, descriptions, levels, attributes, and duelist names.
- **DATA/WA_MRG.MRG** -- The main game data archive. Contains fusions, equips, starchip costs/passwords, duelist decks/drops, and card images.

### SLUS Offsets

| Offset | Data | Format |
|--------|------|--------|
| `0x1C4A44` | Card stats | 722 x uint32LE packed: bits 0-8 ATK/10, 9-17 DEF/10, 18-21 GS2, 22-25 GS1, 26-30 type |
| `0x1C5B33` | Card level + attribute | 722 x uint8: low nibble = level, high nibble = attribute |
| `0x1C6002` | Card name pointer table | 722 x uint16LE offsets into text pool |
| `0x1C0800` | Text pool base | TBL-encoded strings (0xFF terminated) |
| `0x1B0A02` | Card description pointer table | 722 x uint16LE offsets |
| `0x1B0800` | Description text pool base | TBL-encoded strings |
| `0x1C6652` | Duelist name pointer table | 39 x uint16LE offsets into text pool |
| `0x1C92CE` | Card type name table | 24 consecutive TBL strings |
| `0x1C9380` | Guardian star name table | Fixed-width 8 bytes per entry |

### WA_MRG Offsets

| Offset | Data | Format |
|--------|------|--------|
| `0x000000` | Card images | 722 x 2048-byte sectors (1280B pixels + 128B palette + 640B padding) |
| `0xB85000` | Equip table | Variable-length entries: [equipId:u16] [count:u16] [monsterId:u16]... until equipId=0 |
| `0xB87800` | Fusion table | 64KB block with pointer table + packed 5-byte fusion pairs |
| `0xE9B000` | Duelist data | 39 x 6144B blocks (deck + 3 drop tables, each 722 x uint16LE) |
| `0xFB9808` | Starchip costs/passwords | 722 x 8B (4B LE cost + 4B BE password) |

## Text Encoding

The game uses a custom single-byte encoding (Konami TBL format), frequency-ordered: `0x00`=space, `0x01`=e, `0x02`=t, etc. `0xFE`=newline, `0xFF`=string terminator. Card names may have a `{F8 0A XX}` prefix encoding the UI color.

## Community Tools

These offsets were confirmed by cross-referencing with:

- **[fmlib-cpp](https://github.com/forbidden-memories-coding/fmlib-cpp)** -- C++ library for reading/writing FM game data (MIT license)
- **[fmscrambler](https://github.com/forbidden-memories-coding/fmscrambler)** -- C# randomizer tool (archived, succeeded by FMRandomizer)
- **[Data Crystal ROM map](https://datacrystal.tcrf.net/wiki/Yu-Gi-Oh!_Forbidden_Memories/ROM_map)** -- Community-documented runtime addresses
- **[TEA Online](https://www.basededatostea.xyz/)** -- Card database for FM and 98+ mods (no bulk export)

## Notes

- The "Remastered Perfected" mod replaced 177 cards (IDs 496-650, 701-722) with new stats but only stored number-string placeholder names for them.
- Guardian star mappings differ between vanilla game and this mod. The script reads the mod's actual name table from the binary.
- Card types Beast-Warrior (4) and Sea Serpent (13) exist in the type table but have zero cards in this mod.
