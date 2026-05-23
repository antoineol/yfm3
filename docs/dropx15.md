# droptool / dropx15 — specs (brouillon)

Statut : **actif pour le bridge**. Le bridge n'installe plus les trampolines
locaux expérimentaux. Il suit la recette communautaire Ghost/FMR :

- si l'image contient déjà l'expansion Ghost, il ajuste les 3 limites de boucle
  `6/6/5 -> 16/16/15`;
- si l'image est encore propre mais correspond aux hooks Ghost, il injecte
  l'expansion `Drop More Cards` dans `SLUS` + `DATA/WA_MRG.MRG`.

## Objectif

Outil standalone CLI qui patche une image disc PSX de _Yu-Gi-Oh! Forbidden
Memories_ pour qu'à la fin d'un duel le joueur reçoive plus de cartes.

La sémantique exacte du patch est celle du mod communautaire « Drop More
Cards » de Ghost / FMR x15 : il injecte une expansion MIPS de fin de duel et
fixe trois limites de boucle à **16/16/15**, ce qui donne 15 cartes gagnées.

## Recette de patch — **IDENTIFIÉE** (pour SLUS_014.11 / US vanilla)

Source communautaire vérifiée le 2026-05-23 :
<https://hippochan.nl/multi-card-drop/> distribue l'outil
`YGOFMDROPMORECARDSBYGHOST.exe` et documente que la recette officielle prend
à la fois `SLUS_014.11` et `DATA/WA_MRG.MRG`, limite la valeur à 15, et ne
vise que NTSC-U/C.

Décompilation IL de l'EXE Ghost :

- injecte le blob MIPS à `SLUS:0x19b440`;
- injecte le même blob dans 7 copies `WA_MRG:0xb4bf00 + i*0x75800`, `i=1..7`;
- installe les hooks `SLUS:0x12034`, `0x1246c`, `0x12710`, `0x285fc`;
- écrit les limites de boucle `16`, `16`, `15` dans chaque copie WA_MRG.

Le bridge écrit seulement les mots de hook nécessaires (`j`/`nop`, plus le
delay-slot neutralisé du hook renderer) et laisse les instructions de
continuation intactes. C'est équivalent sur vanilla et évite d'écraser une
instruction locale de Gold à `SLUS:0x1247c`.

Trois instructions MIPS `addiu $s7, $zero, imm` dans l'EXE SLUS_014.11 (US
NTSC, vanilla), à immediates proches. Le mod canonique x15 (Ghost tool)
bumpe chaque immediate de **+10**.

**Offsets EXE (file offsets dans SLUS_014.11) :**

| #   | Offset EXE | Vanilla | x15 mod | Contexte ancre (vanilla, 16 bytes LE)                              |
| --- | ---------- | ------- | ------- | ------------------------------------------------------------------ |
| 1   | `0x19b478` | `06`    | `10`    | `2000 a0a3 2000 b693 0000 0000 0100 d626 06 00 1724 1d00 d712 ...` |
| 2   | `0x19b574` | `06`    | `10`    | `2000 40a2 2000 5692 0000 0000 0100 d626 06 00 1724 0c00 d712 ...` |
| 3   | `0x19b5ec` | `05`    | `0F`    | `0800 44ac 2000 5690 0000 0000 0100 d626 05 00 1724 0200 d712 ...` |

Chaque triplet forme une boucle `for (i=1; i<imm; i++) { ... }` dans le code
de fin de duel. Les immediates vanilla 6/6/5 deviennent 16/16/15
(delta = +10).

**Vérification empirique** : diff byte-à-byte du `.bin` vanilla et du `.bin`
patchée par l'outil Ghost (fichiers `yu-gi-oh!_-_forbidden_memories -
Copy.bin.uibak` et `.bin` dans `15 card mod/`) → seuls 3 bytes de data game
diffèrent (+ ECC/EDC régénérés + date PVD rewrite, tout cela du bruit non
fonctionnel).

**Remarque** : dans le raw BIN (MODE2/2352) l'outil Ghost modifie **7 copies
redondantes** des 3 bytes (toutes espacées de 235 secteurs = 552 720 bytes).
Cause exacte non élucidée (possible duplication de secteurs EXE dans le
layout ISO). Pour notre outil, deux options équivalentes :

- **(a) Patcher le fichier SLUS_014.11 au niveau ISO** : on extrait le file
  SLUS_014.11 via l'ISO9660 directory, on patche l'EXE, on le réinjecte.
  L'ISO9660 re-write écrasera toutes les copies logiques du fichier.
- **(b) Scanner toute l'image, patcher toutes les occurrences** du pattern
  ancre dans la raw BIN. C'est ce que fait Ghost tool.

Recommandation : (b). Plus simple, plus robuste (pas besoin de parser
ISO9660 à l'écriture), et empiriquement équivalent.

## Portabilité confirmée / à investiguer

| Image                                         | Serial EXE        | Patterns vanilla présents ?                              | Support v1 ?                 |
| --------------------------------------------- | ----------------- | -------------------------------------------------------- | ---------------------------- |
| `15 card mod/…uibak` (US vanilla BIN)         | `SLUS_014.11`     | Oui, 8× (1 dans WA_MRG+7 EXE)                            | ✅                           |
| `Yu-Gi-Oh! Mod 15.bin`                        | `SLUS_014.11`     | Legacy trampoline local installé                         | ❌ restaurer/repatcher Ghost |
| `Yu-Gi-Oh! Forbidden Memories Gold.bin`       | `SLUS_000.04`     | Hooks Ghost compatibles, continuation locale à préserver | ✅ via Ghost expansion       |
| `FMR Remastered Perfected[15].bin`            | `SLUS_014.11`     | Oui, 1× (vestige) + 7× déjà patchées                     | ✅ (déjà patchée)            |
| `FMR Vanilla Remastered 1.3.bin`              | `SLUS_014.11`     | Identique au cas ci-dessus                               | ✅                           |
| `Alpha Mod (Drop x15).iso`                    | `SLUS_014.11`     | Déjà patchée (7 occurrences x15)                         | ✅ (déjà patchée)            |
| `Yu-Gi-Oh! Forbidden Memories (Ultimate).iso` | **`SLUS_027.11`** | Non — layout recompilé                                   | ❌ non supporté              |
| `Vanilla/…(France).bin` (PAL FR)              | `SLES_039.48`     | Non — PAL hors scope Ghost                               | ❌ non supporté              |

**Conséquence importante** : l'image **Ultimate est un mod à binaire
recompilé/différent** (serial customisé `SLUS_027.11`). Nos patterns exacts
ne matchent pas. Le PAL français a aussi un binaire différent.

Pour la v1 bridge, le support robuste concerne d'abord les images qui
contiennent les ancres Ghost/FMR ci-dessus. Le bridge scanne l'image brute, pas
seulement l'EXE ISO9660 extrait, car les copies chargées par le jeu peuvent
différer de la copie logique.

Les exécutables qui gardent seulement le site d'award vanilla
(`0x80021f10`) et le code hôte libre (`0x80021f24`) ne sont plus patchés par le
trampoline local historique qui recomputait un pool tardivement. Cette variante
a produit des récompenses impossibles ou désynchronisées sur Gold; elle est
donc traitée comme état legacy à restaurer, pas comme patch activable.

Les variantes locales `local-award-trampoline`, `freeze-selector` et
`buffered-picker-x15` sont considérées non sûres. Les deux premières ont
produit des pools désynchronisés; la troisième a produit des récompenses
impossibles et un crash sur Gold. Le bridge les refuse au lieu de les
« upgrader ».

## Cibles

Priorité 1 (à reconsidérer) :
`Yu-Gi-Oh! Forbidden Memories (Ultimate).iso` → **bloque** : binaire
différent, patterns non trouvés. À discuter avec l'utilisateur.

Priorité repli (fonctionne avec la recette actuelle) :
`15 card mod/yu-gi-oh!_-_forbidden_memories - Copy.bin.uibak`
(US vanilla NTSC BIN) — sert aussi de fixture de test.

Cible FMR :
`FMR Vanilla Remastered 1.3.bin` (SLUS_014.11 base, recette applicable).

## Scope

- Patche en place une image disc PSX (`.iso` MODE1/2048 ou `.bin` MODE2/2352).
- Produit une nouvelle image au même format, dans un fichier voisin (suffixe
  avant l'extension, ex. `.dropx15`).
- CLI uniquement. Pas d'UI web.
- v1 = SLUS_014.11-base (US vanilla + FMR). Ultimate / PAL = v2.

## Architecture

- Dossier `droptool/` standalone, pattern miroir de `bridge/`.
- TypeScript, exécuté par Bun.
- Entrée : `bun run droptool patch <input>`.
- Config en `droptool/config.ts` (pas de flags CLI).
- Importe directement les helpers du bridge (ISO9660, détection format) via
  chemin relatif `../bridge/extract/…` pour le MVP.

## Configuration (`droptool/config.ts`)

- `DROP_BONUS = 10` — delta ajouté aux trois immediates MIPS. Canonical
  (x15 mod Ghost) = 10. Plage safe à confirmer (1–10 sûr, 11+ potentiellement
  risqué sur UI/structures internes — le community tool limite à 10 max).

Note : pas d'exposition directe d'un « DROP_COUNT = 15 » parce que la
relation config ↔ nombre de cartes n'est pas 1:1 (3 immediates différents,
dépendance au rank du duel). `DROP_BONUS` est la vraie grandeur manipulée.

## Algorithme de patch

1. Détecter format de l'input (CD001 @ sector 16 → MODE1/2048 vs MODE2/2352).
   Réutiliser la détection du bridge.
2. Recopier l'input vers l'output (same format, same sectors).
3. Dans l'output, chercher les 3 patterns ancre (8 bytes chacun). Pour chaque
   pattern trouvé (attendre 7 occurrences dans une BIN MODE2, 1 occurrence
   dans un EXE standalone MODE1) :
   - Lire le byte immediate (position 0 du triplet, offset 0 relatif au
     match).
   - Vérifier qu'il correspond à la valeur vanilla attendue (sinon alerte :
     déjà patché ou variante inconnue).
   - Écrire `vanilla + DROP_BONUS` à cette position.
4. **Pas de recalcul ECC/EDC** en MODE2 (voir section dédiée).
5. Rapport final : offsets patchés, nombre total de modifications.

Détection « déjà patchée » : si les patterns _patched_ (imm = vanilla + 10)
matchent tous, ne rien faire, signaler à l'utilisateur.

Détection « pattern absent » : si les patterns vanilla sont absents ET les
patched aussi, abort avec message clair (image non supportée — probable
binaire recompilé type Ultimate).

## Format d'image : lecture et écriture

Détection auto via CD001. L'écriture se fait :

- MODE1/2048 : écrire les bytes patchés directement à l'offset trouvé.
- MODE2/2352 : écrire les bytes patchés directement à l'offset trouvé dans
  la data area. Les patterns ancre étant courts (8 bytes) et les matches
  étant à l'intérieur de sectors data (pas aux frontières), pas besoin de
  logique spéciale.

## ECC/EDC (MODE2/2352)

Chaque secteur MODE2/2352 se termine par 4 bytes EDC (CRC-32 sur data) et
276 bytes ECC (parité Reed-Solomon).

Trade-off :

- **Skip (ne pas recalculer)** : DuckStation, PCSX-Redux, Mednafen tolèrent
  les EDC/ECC invalides. Ghost tool ne recalcule probablement pas non plus
  — la plupart des diffs observés dans son patch sont déjà des
  recalculations (noise), ce qui suggère qu'il utilise une lib ISO qui
  recalcule automatiquement. Pour nous, skip = implémentation triviale.
- **Recalculer** : correct stricto sensu, nécessaire pour PS1 réelle et
  émulateurs les plus stricts.

**Recommandation v1 : skip.** Notre cible = DuckStation (aligné avec le
reste du projet). Ajouter recalcul si besoin ressenti.

## Tests

- Unitaire : fixture buffer contenant les 3 triplets ancres, vérifier
  pattern match + substitution.
- Intégration : patcher `15 card mod/…uibak` et cmp avec `.bin` — les 3
  bytes de code doivent correspondre (on ignore le bruit ECC/EDC/PVD).
- Smoke test manuel : DuckStation, gagner un duel, vérifier que la
  collection augmente de ~N cartes distinctes.

## Risques / questions ouvertes

1. **Support Ultimate** : priorité 1 du user, mais binaire différent. À
   discuter — soit on fait un diff séparé (si user a pre/post patch
   Ultimate), soit on remonte la priorité sur FMR qui marche déjà.
2. **Support PAL FR** : idem, binaire différent (SLES_039.48). v2.
3. **Sémantique exacte de DROP_BONUS** : pour l'instant verrouillée à 10
   (comportement Ghost). Si le user veut varier, doc empirique à construire.
4. **Les 7 copies redondantes dans le BIN** : origine pas élucidée mais le
   scan-and-patch-all les gère sans problème.
5. **Reverse-engineer les 3 loops pour preuve ultime** : on a confirmé
   empiriquement (diff tool pre/post). On n'a pas à 100% prouvé _pourquoi_
   ces 3 immediates contrôlent le nombre de drops. Si besoin de plus de
   garanties, investigation MIPS supplémentaire.
