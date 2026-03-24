# Disc & Binary Structure

## Disc Files

All versions: `/<EXE>`, `/DATA/WA_MRG.MRG`, `/DATA/SU.MRG`, `/DATA/MODEL.MRG`, etc.
Exe auto-detected by regex `/^S[CL][A-Z]{2}_\d/`. PAL serials: SLES_039.47 (EN), .48 (FR), .49 (DE), .50 (IT), .51 (ES).

## Exe: Same Stats Offsets, Different Text

Card stats at 0x1C4A44 and level/attr at 0x1C5B33 in ALL versions. PAL exes have text pools + TBL zeroed; text lives in WA_MRG instead.

## WA_MRG: Flat Archive, No File Table

Data at hardcoded offsets. PAL inserts ~1.2 MB of text between artwork (0x169000) and equip/fusion tables, shifting all subsequent offsets. Two known layouts validated structurally at runtime.

## PAL Text in WA_MRG (~0xCC0000–0xDE0000)

5 language sections (EN first), each containing:
- ~542 UI strings → ~841 mixed UI+descriptions → ~812 names

**Description header marker** (structural anchor): `31 F8 03 8C F8 1B 80`. Appears exactly once per language. After it: skip 1 header + 1 blank → next 722 strings = card descriptions.

**Name block** (800+ consecutive short strings after descriptions): indices 0–721 = card names, 723–746 = type names, 747–756 = guardian stars, 758–796 = duelist names.

## TBL Encoding

Single-byte, frequency-ordered. `0xFF` = terminator, `0xFE` = newline, `0xF8 XX YY` = control code.

- **NTSC-U**: `space e t a o i n s r h l . d u m c g y w f ...` (~85 entries, stored at exe 0x1A18F4)
- **PAL**: `space e a i n r o t s l u d c . m h g p f b ...` (64 mapped from English; accented chars at unmapped positions remain unknown)

## SU.MRG

Does NOT contain card text. Only UI sprites and credits.
