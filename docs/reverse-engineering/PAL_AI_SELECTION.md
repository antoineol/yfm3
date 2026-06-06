# PAL AI Selection Notes

PAL French reverse-engineering artifacts were found outside the repo under `/tmp`.
Do not rely only on `gamedata/disasm`, which currently contains local ignored SLUS
artifacts.

Known local PAL artifacts:

- `/tmp/yfm-pal-decomp/SLES_039.48`: raw extracted PAL executable. Do not commit.
- `/tmp/SLES_039.48.current.asm`: PAL assembly listing.
- `/tmp/yfm-pal-decomp/pal-pool-probe.txt`: Ghidra memory/pool probe output.
- `/tmp/yfm-pal-decomp/pal-selection.txt`: focused Ghidra selection-function output.

The focused Ghidra script is tracked at `scripts/ghidra/DecompileSelection.java`.
Run it against an existing PAL Ghidra project with:

```sh
JAVA_HOME=/tmp/jdk21 PATH=/tmp/jdk21/bin:$PATH \
  /tmp/yfm-ghidra/ghidra_12.0.4_PUBLIC/support/analyzeHeadless \
  /tmp/yfm-pal-ghidra proj \
  -process SLES_039.48 \
  -scriptPath scripts/ghidra \
  -postScript DecompileSelection.java /tmp/yfm-pal-decomp/pal-selection.txt \
  -noanalysis
```

Current finding:

- `80024a38` computes field bonus from PAL terrain `DAT_8009c6f9`.
- `80024a9c` stores that bonus in the live card slot at offset `+0x14`.
- `80016fe4` returns effective stats:
  - low 16 bits: ATK = `+0x0e` + `+0x12` + `+0x14`
  - high 16 bits: DEF = `+0x10` + `+0x12` + `+0x14`
- The combat viability helper around `8001ef34` calls `80016fe4`, so that path
  includes field bonus.

Open question:

- The specific routine that chooses which visible/pool card to play has not been
  proven to rank candidates by effective ATK or DEF. PAL assembly around
  `80026cf4`, `80026da0`, `80027590`, and `80027a44` builds type/slot candidate
  lists and uses random/fallback branches, but the exact "best card" comparator
  remains unidentified.
