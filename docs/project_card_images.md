---
name: card-image-extraction
description: Reverse-engineered card image formats in WA_MRG.MRG - thumbnails decoded, full-res palette still TBD
type: project
---

Card images are stored in WA_MRG.MRG (DATA/WA_MRG.MRG on the PS1 disc).

## Thumbnail format (DECODED - working)
- Location: first 722 sectors (blocks 0-721) of WA_MRG.MRG
- One card per 2048-byte sector (card ID 1 = block 0)
- 40×32 pixels, 8-bit indexed (indices 0-63)
- 64-color RGB555 palette at byte offset 1280 within each sector (128 bytes)
- 640 bytes of 0xFF padding at end of each sector
- Extraction code is in `scripts/extract-game-data.ts`

## Full-resolution format (PARTIALLY DECODED - palette TBD)
- Location: starts at byte offset 0x169800 in WA_MRG.MRG (right after thumbnails)
- Width: 102 pixels (confirmed by row correlation analysis, r=0.708)
- Height: ~97-100 pixel rows per card
- 8-bit indexed, uses indices 0-255 (254 unique values)
- Data stride: 102 bytes per row
- Cards separated by ~18-19 rows of zeros
- After each card's pixel rows: ~20 rows of metadata (palette + thumbnail data)
- The embedded palette at end of each card block has entries 4-67 matching the thumbnail palette entries 0-63 (4-entry offset)
- BUT: full 256-color palette alignment not yet cracked - rendering produces noisy colors
- Total full-res data region: ~9.6 MB for 722 cards

**Why:** The thumbnails are usable for the deck optimizer UI. Full-res would be nicer but requires more reverse engineering.
**How to apply:** When resuming this work, focus on understanding the 256-color palette structure for the full-res images. Try examining the SLUS executable for CLUT loading code, or compare multiple cards' palette areas to find the pattern.
