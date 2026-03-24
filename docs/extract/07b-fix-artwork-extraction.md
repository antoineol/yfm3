# Plan: Fix Artwork Extraction for PAL Discs

## Status: DONE

## Problem

When extracting card artwork from the PAL vanilla disc (SLES_039.48, France), the resulting images are visibly wrong. Evidence:

- All 722 artwork files differ from the committed RP artwork in file size (e.g., `001.webp` went from 3002 to 5058 bytes).
- The RP mod shares the same card artwork as vanilla (same cards, same art), so the extracted images should be visually similar with only minor compression differences — not dramatically different sizes.
- The size differences suggest corrupted pixel data, wrong palette, or wrong offsets — not just different webp compression.

The extraction uses a hardcoded offset `FULL_IMG_START = 0x169000` for all disc versions. Per `disc-structure.md`, artwork is at the same offset in both US and PAL WA_MRG. However, this has not been independently verified — the PAL disc may have a different artwork layout or the offset may be wrong.

## Investigation Steps

1. **Visual comparison.** Extract artwork from both the RP and vanilla PAL discs. Open a few cards side-by-side (e.g., card 1, 50, 200, 722) and compare visually. Document what's wrong: shifted pixels, wrong colors, garbage data, offset images?

2. **Verify artwork offset.** Confirm that `0x169000` is correct for the PAL disc:
   - Check if the PAL WA_MRG has the same thumbnail section (722 × 0x800) before the artwork section.
   - Look for the artwork's expected binary signature: the first card should start with 9792 bytes of 8bpp pixel data followed by a 256-color RGB555 CLUT at +0x2640.
   - Compare the first few bytes at 0x169000 between RP and vanilla WA_MRG.

3. **Check for PAL offset shift.** The PAL disc inserts ~1.2 MB of multi-language text in WA_MRG, shifting equip/fusion tables by ~0x263800. If the text is inserted *before* the artwork (not after as documented), the artwork offset would be shifted too. Verify by scanning for the thumbnail/artwork boundary.

4. **Compare with known correct artwork.** Find reference card artwork online (fan wikis, YouTube playthroughs, ROM hacking tools like FMLibrary). Compare pixel-by-pixel or visually against extracted images to confirm correctness for the RP disc (which serves as our known-good baseline).

5. **Check webp encoding.** Ensure the `sharp` library is encoding correctly — compare raw RGBA buffer sizes and verify the 102×96 dimensions are correct.

## Possible Root Causes

1. **Wrong artwork offset for PAL.** The text insertion may shift artwork, not just equip/fusion tables.
2. **Wrong CLUT offset.** The palette may be at a different position in the card block for PAL.
3. **Different block size.** PAL card blocks may not be 0x3800 bytes.
4. **Transparency handling.** The `rgb555toRGBA` function may handle the STP (semi-transparency) bit differently across versions.
5. **Thumbnail/artwork confusion.** The code might be reading thumbnail data (40×32, 64 colors) instead of full artwork (102×96, 256 colors).

## Validation

- Extracted RP artwork should be visually identical to known-good references.
- Extracted vanilla artwork should be visually identical to RP artwork (same game, same card art).
- `bun verify:rp` and `bun verify:vanilla` must still pass 4/4 (artwork extraction is separate from CSV extraction).

## Files

- `scripts/extract-game-data.ts` — `FULL_IMG_START`, `extractFullCardImage()`, `writeWebp()`
- `docs/memory/disc-structure.md` — WA_MRG layout documentation
