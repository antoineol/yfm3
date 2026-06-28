import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  createReadStream,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { parsePsxExeHeader } from "../../bridge/extract/detect-exe.ts";
import { readDiscExe } from "../../bridge/extract/index.ts";
import { detectDiscFormat } from "../../bridge/extract/iso9660.ts";

type Phase =
  | "select_target_disc"
  | "extract_executable"
  | "raw_reemit_executable"
  | "map_boundaries"
  | "byte_replay_seed"
  | "source_generation_probe"
  | "linked_executable_probe"
  | "linked_bootstrap_window"
  | "first_function_boundary_probe"
  | "behavioral_boot_probe"
  | "linked_runtime_init_once"
  | "behavioral_runtime_init_once_probe"
  | "behavioral_runtime_init_once_tty_probe";

type EvidenceClass =
  | "none"
  | "byte_identical_plumbing"
  | "byte_replay_unit"
  | "source_generated_unit"
  | "linked_executable"
  | "behavioral_equivalence";

interface DecompState {
  schemaVersion: 1;
  phase: Phase;
  activeTask: string;
  target: {
    discPath: string | null;
    discSize: number | null;
    discSha256: string | null;
    discFormat: string | null;
    serial: string | null;
    exeSize: number | null;
    exeSha256: string | null;
    exeLoadAddr: number | null;
    exeTextSize: number | null;
    extractedExePath: string | null;
    rawReemitExePath: string | null;
    boundaryMapPath: string | null;
    byteReplayUnitPath: string | null;
    sourceGeneratedUnitPath: string | null;
    linkedUnitPath: string | null;
    linkedBootstrapUnitPath: string | null;
    firstFunctionName: string | null;
    behavioralProbePath: string | null;
    linkedRuntimeInitUnitPath: string | null;
    runtimeInitBehavioralProbePath: string | null;
    runtimeInitTtyProbePath: string | null;
    manualTestExpectedLogText: string | null;
    manualTestDiscPath: string | null;
    manualTestCuePath: string | null;
    unitManifestPath: string | null;
    manifestRebuildExePath: string | null;
    linkedRebuildExePath: string | null;
  };
  evidence: {
    class: EvidenceClass;
    sourceGeneratedExecutableBytes: number;
    byteReplayExecutableBytes: number;
    manualTestingAddsEvidence: boolean;
    nextCheckpoint: string;
  };
  lastVerifiedCommand: string | null;
  blockers: string[];
  updatedAt: string | null;
}

const STATE_PATH = "decomp/STATE.json";
const LOG_PATH = "decomp/LOG.md";

const TASK_BY_PHASE: Record<Phase, string> = {
  select_target_disc: "select-target-disc",
  extract_executable: "extract-executable",
  raw_reemit_executable: "raw-reemit-executable",
  map_boundaries: "map-boundaries",
  byte_replay_seed: "byte-replay-seed",
  source_generation_probe: "source-generation-probe",
  linked_executable_probe: "linked-executable-probe",
  linked_bootstrap_window: "linked-bootstrap-window",
  first_function_boundary_probe: "first-function-boundary-probe",
  behavioral_boot_probe: "behavioral-boot-probe",
  linked_runtime_init_once: "linked-runtime-init-once",
  behavioral_runtime_init_once_probe: "behavioral-runtime-init-once-probe",
  behavioral_runtime_init_once_tty_probe: "behavioral-runtime-init-once-tty-probe",
};

const NEXT_BY_PHASE: Partial<Record<Phase, Phase>> = {
  select_target_disc: "extract_executable",
  extract_executable: "raw_reemit_executable",
  raw_reemit_executable: "map_boundaries",
  map_boundaries: "byte_replay_seed",
  byte_replay_seed: "source_generation_probe",
  source_generation_probe: "linked_executable_probe",
  linked_executable_probe: "linked_bootstrap_window",
  linked_bootstrap_window: "first_function_boundary_probe",
  first_function_boundary_probe: "behavioral_boot_probe",
  behavioral_boot_probe: "linked_runtime_init_once",
  linked_runtime_init_once: "behavioral_runtime_init_once_probe",
  behavioral_runtime_init_once_probe: "behavioral_runtime_init_once_tty_probe",
};

const command = process.argv[2] ?? "status";

try {
  await main(command, process.argv.slice(3));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`decomp-state: ${message}`);
  process.exit(1);
}

async function main(cmd: string, args: string[]): Promise<void> {
  const state = readState();
  validateState(state);

  if (cmd === "status") {
    printStatus(state);
    return;
  }
  if (cmd === "select-target") {
    await selectTarget(state, args);
    return;
  }
  if (cmd === "next") {
    runNext(state);
    return;
  }
  if (cmd === "record-behavioral-boot-ok") {
    recordBehavioralBootOk(state);
    return;
  }
  if (cmd === "record-runtime-init-boot-ok") {
    recordRuntimeInitBootOk(state);
    return;
  }
  if (cmd === "record-runtime-init-tty-ok") {
    recordRuntimeInitTtyOk(state);
    return;
  }

  throw new Error(
    "Unknown command. Use: bun decomp:state status | select-target <disc> | next | record-behavioral-boot-ok | record-runtime-init-boot-ok | record-runtime-init-tty-ok",
  );
}

function printStatus(state: DecompState): void {
  console.log(`phase: ${state.phase}`);
  console.log(`activeTask: ${state.activeTask}`);
  console.log(`target: ${state.target.discPath ?? "(not selected)"}`);
  console.log(`evidenceClass: ${state.evidence.class}`);
  console.log(`sourceGeneratedExecutableBytes: ${state.evidence.sourceGeneratedExecutableBytes}`);
  console.log(`byteReplayExecutableBytes: ${state.evidence.byteReplayExecutableBytes}`);
  console.log(`manualTestingAddsEvidence: ${state.evidence.manualTestingAddsEvidence}`);
  console.log(`nextCheckpoint: ${state.evidence.nextCheckpoint}`);
  console.log(`lastVerifiedCommand: ${state.lastVerifiedCommand ?? "(none)"}`);
  if (state.blockers.length > 0) console.log(`blockers: ${state.blockers.join("; ")}`);
  console.log("");
  console.log(nextInstruction(state));
}

async function selectTarget(state: DecompState, args: string[]): Promise<void> {
  requirePhase(state, "select_target_disc");
  const discArg = args[0];
  if (!discArg) throw new Error("Usage: bun decomp:state select-target <disc.bin|disc.iso>");

  const discPath = resolve(discArg);
  if (!existsSync(discPath)) throw new Error(`Disc image not found: ${discPath}`);
  const stat = statSync(discPath);
  if (!stat.isFile()) throw new Error(`Disc path is not a file: ${discPath}`);

  const { slus, serial } = readDiscExe(discPath);
  const header = parsePsxExeHeader(slus);
  const exeSha256 = hashBuffer(slus);
  const discSha256 = await hashFile(discPath);

  state.target = {
    discPath,
    discSize: stat.size,
    discSha256,
    discFormat: detectDiscFormatName(discPath),
    serial,
    exeSize: slus.length,
    exeSha256,
    exeLoadAddr: header.loadAddr,
    exeTextSize: header.textSize,
    extractedExePath: null,
    rawReemitExePath: null,
    boundaryMapPath: null,
    byteReplayUnitPath: null,
    sourceGeneratedUnitPath: null,
    linkedUnitPath: null,
    linkedBootstrapUnitPath: null,
    firstFunctionName: null,
    behavioralProbePath: null,
    linkedRuntimeInitUnitPath: null,
    runtimeInitBehavioralProbePath: null,
    runtimeInitTtyProbePath: null,
    manualTestExpectedLogText: null,
    manualTestDiscPath: null,
    manualTestCuePath: null,
    unitManifestPath: null,
    manifestRebuildExePath: null,
    linkedRebuildExePath: null,
  };
  state.evidence = initialEvidence();
  transition(state, "extract_executable", `bun decomp:state select-target ${discPath}`);
  writeState(state);
  appendLog(
    `Selected target ${basename(discPath)} serial=${serial} exeSha256=${exeSha256} discSha256=${discSha256}.`,
  );
  printStatus(state);
}

function runNext(state: DecompState): void {
  if (state.phase === "select_target_disc") {
    throw new Error(
      "Target disc required. Run: bun decomp:state select-target <disc.bin|disc.iso>",
    );
  }
  if (state.phase === "extract_executable") {
    extractExecutable(state);
    return;
  }
  if (state.phase === "raw_reemit_executable") {
    rawReemitExecutable(state);
    return;
  }
  if (state.phase === "map_boundaries") {
    verifyBoundaryMap(state);
    return;
  }
  if (state.phase === "byte_replay_seed") {
    verifyByteReplaySeed(state);
    return;
  }
  if (state.phase === "source_generation_probe") {
    verifySourceGenerationProbe(state);
    return;
  }
  if (state.phase === "linked_executable_probe") {
    verifyLinkedExecutableProbe(state);
    return;
  }
  if (state.phase === "linked_bootstrap_window") {
    verifyLinkedBootstrapWindow(state);
    return;
  }
  if (state.phase === "first_function_boundary_probe") {
    verifyFirstFunctionBoundaryProbe(state);
    return;
  }
  if (state.phase === "behavioral_boot_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      printStatus(state);
      return;
    }
    verifyLinkedRuntimeInitOnce(state);
    return;
  }
  if (state.phase === "linked_runtime_init_once") {
    verifyLinkedRuntimeInitOnce(state);
    return;
  }
  if (state.phase === "behavioral_runtime_init_once_probe") {
    buildRuntimeInitBehavioralProbe(state);
    return;
  }
  if (state.phase === "behavioral_runtime_init_once_tty_probe") {
    buildRuntimeInitTtyProbe(state);
    return;
  }
}

function extractExecutable(state: DecompState): void {
  requirePhase(state, "extract_executable");
  const discPath = requireValue(state.target.discPath, "target.discPath");
  const expectedSerial = requireValue(state.target.serial, "target.serial");
  const expectedExeSha256 = requireValue(state.target.exeSha256, "target.exeSha256");

  const { slus, serial } = readDiscExe(discPath);
  if (serial !== expectedSerial) {
    throw new Error(`Serial changed while extracting: expected ${expectedSerial}, got ${serial}`);
  }
  assertEqual(hashBuffer(slus), expectedExeSha256, "extracted executable SHA-256");

  const outPath = `decomp/artifacts/original/${serial}.exe`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, slus);
  assertEqual(hashBuffer(readFileSync(outPath)), expectedExeSha256, "written executable SHA-256");

  state.target.extractedExePath = outPath;
  transition(state, "raw_reemit_executable", "bun decomp:state next");
  writeState(state);
  appendLog(`Extracted executable to ${outPath}; sha256=${expectedExeSha256}.`);
  printStatus(state);
}

function rawReemitExecutable(state: DecompState): void {
  requirePhase(state, "raw_reemit_executable");
  const inPath = requireValue(state.target.extractedExePath, "target.extractedExePath");
  const expectedExeSha256 = requireValue(state.target.exeSha256, "target.exeSha256");
  const serial = requireValue(state.target.serial, "target.serial");

  const source = readFileSync(inPath);
  assertEqual(hashBuffer(source), expectedExeSha256, "extracted executable SHA-256");

  const outPath = `decomp/build/raw/${serial}.exe`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, source);
  assertEqual(hashBuffer(readFileSync(outPath)), expectedExeSha256, "raw re-emit SHA-256");

  state.target.rawReemitExePath = outPath;
  state.evidence = {
    ...state.evidence,
    class: "byte_identical_plumbing",
    manualTestingAddsEvidence: false,
  };
  transition(state, "map_boundaries", "bun decomp:state next");
  writeState(state);
  appendLog(`Raw re-emitted executable to ${outPath}; sha256=${expectedExeSha256}.`);
  printStatus(state);
}

function verifyBoundaryMap(state: DecompState): void {
  requirePhase(state, "map_boundaries");
  const serial = requireValue(state.target.serial, "target.serial");
  const mapPath = `decomp/maps/${serial}.json`;
  if (!existsSync(mapPath)) throw new Error(`Boundary map not found: ${mapPath}`);

  runVerifier("bun", ["decomp:verify-map", STATE_PATH, mapPath], "Boundary map verifier");
  state.target.boundaryMapPath = mapPath;
  transition(state, "byte_replay_seed", "bun decomp:state next");
  writeState(state);
  appendLog(`Verified boundary map ${mapPath}.`);
  printStatus(state);
}

function verifyByteReplaySeed(state: DecompState): void {
  requirePhase(state, "byte_replay_seed");
  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/units/${serial}/entrypoint-init-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.json`;
  const rebuiltExePath = `decomp/build/manifest/${serial}.exe`;

  if (!existsSync(unitPath)) throw new Error(`Byte-replay seed unit not found: ${unitPath}`);
  if (!existsSync(manifestPath)) throw new Error(`Unit manifest not found: ${manifestPath}`);

  runVerifier("bun", ["decomp:verify-unit", STATE_PATH, unitPath], "Byte-replay unit verifier");
  runVerifier("bun", ["decomp:rebuild-exe", STATE_PATH, manifestPath], "Manifest rebuild");

  state.target.byteReplayUnitPath = unitPath;
  state.target.sourceGeneratedUnitPath = null;
  state.target.unitManifestPath = manifestPath;
  state.target.manifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "byte_replay_unit",
    sourceGeneratedExecutableBytes: 0,
    byteReplayExecutableBytes: 8,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "source_generation_probe",
  };
  transition(state, "source_generation_probe", "bun decomp:state next");
  writeState(state);
  appendLog(`Verified byte-replay seed ${unitPath}; next checkpoint is source generation.`);
  printStatus(state);
}

function verifySourceGenerationProbe(state: DecompState): void {
  requirePhase(state, "source_generation_probe");
  if (state.evidence.class === "source_generated_unit") {
    state.evidence.nextCheckpoint = "linked_executable_probe";
    transition(state, "linked_executable_probe", "bun decomp:state next");
    writeState(state);
    appendLog("Advanced to linked executable probe after source-generation verification.");
    printStatus(state);
    return;
  }

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/units/${serial}/entrypoint-init-source-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.json`;
  const rebuiltExePath = `decomp/build/manifest/${serial}.exe`;

  if (!existsSync(unitPath)) throw new Error(`Source-generated unit not found: ${unitPath}`);
  if (!existsSync(manifestPath)) throw new Error(`Unit manifest not found: ${manifestPath}`);

  runVerifier(
    "bun",
    ["decomp:verify-unit", STATE_PATH, unitPath],
    "Source-generated unit verifier",
  );
  runVerifier("bun", ["decomp:rebuild-exe", STATE_PATH, manifestPath], "Manifest rebuild");

  state.target.sourceGeneratedUnitPath = unitPath;
  state.target.unitManifestPath = manifestPath;
  state.target.manifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "source_generated_unit",
    sourceGeneratedExecutableBytes: 8,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_executable_probe",
  };
  transition(state, "linked_executable_probe", "bun decomp:state next");
  writeState(state);
  appendLog(`Verified source-generated unit ${unitPath}; next checkpoint is linked executable.`);
  printStatus(state);
}

function verifyLinkedExecutableProbe(state: DecompState): void {
  requirePhase(state, "linked_executable_probe");
  if (state.evidence.class === "linked_executable") {
    state.evidence.nextCheckpoint = "linked_bootstrap_window";
    transition(state, "linked_bootstrap_window", "bun decomp:state next");
    writeState(state);
    appendLog("Advanced to linked bootstrap window after linked executable probe.");
    printStatus(state);
    return;
  }

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/entrypoint-init-linked-v0.json`;
  const rebuiltExePath = `decomp/build/linked/${serial}.exe`;

  if (!existsSync(unitPath)) throw new Error(`Linked unit not found: ${unitPath}`);
  runVerifier("bun", ["decomp:verify-linked-unit", STATE_PATH, unitPath], "Linked unit verifier");

  state.target.linkedUnitPath = unitPath;
  state.target.linkedRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 8,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_bootstrap_window",
  };
  transition(state, "linked_bootstrap_window", "bun decomp:state next");
  writeState(state);
  appendLog(`Verified linked executable unit ${unitPath}; next checkpoint is bootstrap window.`);
  printStatus(state);
}

function verifyLinkedBootstrapWindow(state: DecompState): void {
  requirePhase(state, "linked_bootstrap_window");
  if (
    state.evidence.class === "linked_executable" &&
    state.evidence.sourceGeneratedExecutableBytes >= 160
  ) {
    state.evidence.nextCheckpoint = "first_function_boundary_probe";
    transition(state, "first_function_boundary_probe", "bun decomp:state next");
    writeState(state);
    appendLog("Advanced to first function boundary probe after linked bootstrap verification.");
    printStatus(state);
    return;
  }

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/entrypoint-bootstrap-linked-v0.json`;
  const rebuiltExePath = `decomp/build/linked/${serial}.exe`;

  if (!existsSync(unitPath)) throw new Error(`Linked bootstrap unit not found: ${unitPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked bootstrap verifier",
  );

  state.target.linkedBootstrapUnitPath = unitPath;
  state.target.linkedRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 160,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "first_function_boundary_probe",
  };
  transition(state, "first_function_boundary_probe", "bun decomp:state next");
  writeState(state);
  appendLog(`Verified linked bootstrap window ${unitPath}; next checkpoint is function boundary.`);
  printStatus(state);
}

function verifyFirstFunctionBoundaryProbe(state: DecompState): void {
  requirePhase(state, "first_function_boundary_probe");
  if (state.target.firstFunctionName === "runtime_init_once") {
    buildBehavioralBootProbe(state);
    return;
  }

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier("bun", ["decomp:verify-map", STATE_PATH, mapPath], "Function boundary verifier");

  state.target.firstFunctionName = "runtime_init_once";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 160,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "first_c_unit_toolchain_or_strategy",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified first function boundary runtime_init_once in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function buildBehavioralBootProbe(state: DecompState): void {
  requirePhase(state, "first_function_boundary_probe");
  const serial = requireValue(state.target.serial, "target.serial");
  const probePath = `decomp/manual-tests/${serial}/bootstrap-nop-variant-v0.json`;
  const discPath =
    "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).bin";
  const cuePath =
    "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).cue";

  if (!existsSync(probePath)) throw new Error(`Behavioral manual probe not found: ${probePath}`);
  runVerifier(
    "bun",
    ["decomp:build-manual-disc", STATE_PATH, probePath],
    "Behavioral manual disc builder",
  );

  state.target.behavioralProbePath = probePath;
  state.target.manualTestDiscPath = discPath;
  state.target.manualTestCuePath = cuePath;
  state.evidence = {
    class: "behavioral_equivalence",
    sourceGeneratedExecutableBytes: 160,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: true,
    nextCheckpoint: "manual_boot_load_behavioral_disc",
  };
  transition(state, "behavioral_boot_probe", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Built behavioral boot probe ${probePath}; manual boot/load test required at ${cuePath}.`,
  );
  printStatus(state);
}

function recordBehavioralBootOk(state: DecompState): void {
  requirePhase(state, "behavioral_boot_probe");
  state.evidence = {
    ...state.evidence,
    class: "behavioral_equivalence",
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_runtime_init_once",
  };
  state.lastVerifiedCommand = "bun decomp:state record-behavioral-boot-ok";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog("Manual behavioral boot/load probe passed.");
  printStatus(state);
}

function verifyLinkedRuntimeInitOnce(state: DecompState): void {
  if (state.phase === "behavioral_boot_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      printStatus(state);
      return;
    }
    transition(state, "linked_runtime_init_once", "bun decomp:state next");
  }
  requirePhase(state, "linked_runtime_init_once");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/runtime-init-once-linked-v0.json`;
  const rebuiltExePath = `decomp/build/linked/${serial}.exe`;

  if (!existsSync(unitPath)) throw new Error(`Linked runtime-init unit not found: ${unitPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked runtime-init verifier",
  );

  state.target.linkedRuntimeInitUnitPath = unitPath;
  state.target.linkedRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 272,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "behavioral_runtime_init_once_probe",
  };
  transition(state, "behavioral_runtime_init_once_probe", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked runtime_init_once unit ${unitPath}; next checkpoint is behavioral runtime-init probe.`,
  );
  printStatus(state);
}

function buildRuntimeInitBehavioralProbe(state: DecompState): void {
  requirePhase(state, "behavioral_runtime_init_once_probe");
  if (
    !state.evidence.manualTestingAddsEvidence &&
    state.target.runtimeInitBehavioralProbePath !== null
  ) {
    buildRuntimeInitTtyProbe(state);
    return;
  }
  if (state.evidence.manualTestingAddsEvidence) {
    printStatus(state);
    return;
  }

  const serial = requireValue(state.target.serial, "target.serial");
  const probePath = `decomp/manual-tests/${serial}/runtime-init-once-nop-variant-v0.json`;
  const discPath =
    "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).bin";
  const cuePath =
    "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).cue";

  if (!existsSync(probePath))
    throw new Error(`Runtime-init behavioral probe not found: ${probePath}`);
  runVerifier(
    "bun",
    ["decomp:build-manual-disc", STATE_PATH, probePath],
    "Runtime-init behavioral manual disc builder",
  );

  state.target.runtimeInitBehavioralProbePath = probePath;
  state.target.manualTestDiscPath = discPath;
  state.target.manualTestCuePath = cuePath;
  state.evidence = {
    class: "behavioral_equivalence",
    sourceGeneratedExecutableBytes: 272,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: true,
    nextCheckpoint: "manual_boot_load_runtime_init_once_disc",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Built runtime_init_once behavioral probe ${probePath}; manual boot/load test required at ${cuePath}.`,
  );
  printStatus(state);
}

function recordRuntimeInitBootOk(state: DecompState): void {
  requirePhase(state, "behavioral_runtime_init_once_probe");
  state.evidence = {
    ...state.evidence,
    class: "behavioral_equivalence",
    manualTestingAddsEvidence: false,
    nextCheckpoint: "behavioral_runtime_init_once_tty_probe",
  };
  state.lastVerifiedCommand = "bun decomp:state record-runtime-init-boot-ok";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog("Manual runtime_init_once behavioral boot/load probe passed.");
  printStatus(state);
}

function buildRuntimeInitTtyProbe(state: DecompState): void {
  if (state.phase === "behavioral_runtime_init_once_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      printStatus(state);
      return;
    }
    transition(state, "behavioral_runtime_init_once_tty_probe", "bun decomp:state next");
  }
  requirePhase(state, "behavioral_runtime_init_once_tty_probe");
  if (state.evidence.manualTestingAddsEvidence) {
    printStatus(state);
    return;
  }
  if (state.target.runtimeInitTtyProbePath !== null) {
    printStatus(state);
    return;
  }

  const serial = requireValue(state.target.serial, "target.serial");
  const probePath = `decomp/manual-tests/${serial}/runtime-init-once-tty-log-v0.json`;
  const discPath =
    "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).bin";
  const cuePath =
    "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).cue";
  const expectedLogText = "MDEC_out_sync";

  if (!existsSync(probePath)) throw new Error(`Runtime-init TTY probe not found: ${probePath}`);
  runVerifier(
    "bun",
    ["decomp:build-manual-disc", STATE_PATH, probePath],
    "Runtime-init TTY manual disc builder",
  );

  state.target.runtimeInitTtyProbePath = probePath;
  state.target.manualTestDiscPath = discPath;
  state.target.manualTestCuePath = cuePath;
  state.target.manualTestExpectedLogText = expectedLogText;
  state.evidence = {
    class: "behavioral_equivalence",
    sourceGeneratedExecutableBytes: 272,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: true,
    nextCheckpoint: "manual_boot_load_runtime_init_once_tty_disc",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Built runtime_init_once TTY probe ${probePath}; manual boot/load/log test required at ${cuePath}.`,
  );
  printStatus(state);
}

function recordRuntimeInitTtyOk(state: DecompState): void {
  requirePhase(state, "behavioral_runtime_init_once_tty_probe");
  state.evidence = {
    ...state.evidence,
    class: "behavioral_equivalence",
    manualTestingAddsEvidence: false,
    nextCheckpoint: "first_c_unit_toolchain_or_strategy",
  };
  state.lastVerifiedCommand = "bun decomp:state record-runtime-init-tty-ok";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog("Manual runtime_init_once TTY boot/load/log probe passed.");
  printStatus(state);
}

function transition(state: DecompState, nextPhase: Phase, commandText: string): void {
  const allowed = NEXT_BY_PHASE[state.phase];
  if (allowed !== nextPhase) {
    throw new Error(`Illegal transition: ${state.phase} -> ${nextPhase}`);
  }
  state.phase = nextPhase;
  state.activeTask = TASK_BY_PHASE[nextPhase];
  state.lastVerifiedCommand = commandText;
  state.blockers = [];
  state.updatedAt = new Date().toISOString();
}

function initialEvidence(): DecompState["evidence"] {
  return {
    class: "none",
    sourceGeneratedExecutableBytes: 0,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "extract_executable",
  };
}

function readState(): DecompState {
  return JSON.parse(readFileSync(STATE_PATH, "utf8")) as DecompState;
}

function writeState(state: DecompState): void {
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

function appendLog(line: string): void {
  const stamp = new Date().toISOString();
  writeFileSync(LOG_PATH, `${readFileSync(LOG_PATH, "utf8")}\n- ${stamp}: ${line}\n`);
}

function validateState(state: DecompState): void {
  if (state.schemaVersion !== 1) throw new Error("Unsupported decomp state schema version");
  if (TASK_BY_PHASE[state.phase] !== state.activeTask) {
    throw new Error(
      `State drift: phase ${state.phase} requires activeTask ${TASK_BY_PHASE[state.phase]}, got ${state.activeTask}`,
    );
  }
}

function nextInstruction(state: DecompState): string {
  if (state.phase === "select_target_disc") {
    return "Next: bun decomp:state select-target <absolute-or-relative-path-to-disc.bin-or.iso>";
  }
  if (state.phase === "source_generation_probe") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_executable_probe") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_bootstrap_window") {
    if (
      state.evidence.class === "linked_executable" &&
      state.evidence.sourceGeneratedExecutableBytes >= 160
    ) {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "first_function_boundary_probe") {
    if (state.target.firstFunctionName === "runtime_init_once") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "behavioral_boot_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      return `Manual test: required: boot ${state.target.manualTestCuePath ?? state.target.manualTestDiscPath ?? "(manual test disc path missing)"} in DuckStation, start the game, and load a save. If it passes, record with: bun decomp:state record-behavioral-boot-ok`;
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_runtime_init_once") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "behavioral_runtime_init_once_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      return `Manual test: required: boot ${state.target.manualTestCuePath ?? state.target.manualTestDiscPath ?? "(manual test disc path missing)"} in DuckStation, start the game, and load a save. If it passes, record with: bun decomp:state record-runtime-init-boot-ok`;
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "behavioral_runtime_init_once_tty_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      return `Manual test: required: boot ${state.target.manualTestCuePath ?? state.target.manualTestDiscPath ?? "(manual test disc path missing)"} in DuckStation, start the game, and load a save. Then an agent must verify DuckStation logs contain "${state.target.manualTestExpectedLogText ?? "MDEC_out_sync"}" before recording: bun decomp:state record-runtime-init-tty-ok`;
    }
    return "Next: runtime_init_once TTY gate verified; define the first C-unit toolchain/strategy checkpoint.";
  }
  return "Next: bun decomp:state next";
}

function requirePhase(state: DecompState, phase: Phase): void {
  if (state.phase !== phase) {
    throw new Error(`Expected phase ${phase}, got ${state.phase}. Run "bun decomp:state status".`);
  }
}

function requireValue<T>(value: T | null, label: string): T {
  if (value === null) throw new Error(`Missing ${label} in ${STATE_PATH}`);
  return value;
}

function runVerifier(commandName: string, args: string[], label: string): void {
  const result = spawnSync(commandName, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}`);
}

function detectDiscFormatName(discPath: string): string {
  const head = Buffer.alloc(64 * 1024);
  const fd = openSync(discPath, "r");
  try {
    readSync(fd, head, 0, head.length, 0);
    const fmt = detectDiscFormat(head);
    return fmt.sectorSize === 2352 ? "MODE2/2352" : "MODE1/2048";
  } finally {
    closeSync(fd);
  }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function hashBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

async function hashFile(path: string): Promise<string> {
  const hash = createHash("sha256");
  await new Promise<void>((resolvePromise, reject) => {
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolvePromise);
  });
  return hash.digest("hex");
}
