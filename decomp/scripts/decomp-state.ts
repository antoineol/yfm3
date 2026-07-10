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
  | "behavioral_runtime_init_once_tty_probe"
  | "linked_runtime_init_always"
  | "linked_asm_rebuild_manifest"
  | "map_main_boot_function_boundary"
  | "linked_main_boot_function"
  | "map_post_main_boot_function_boundary"
  | "linked_post_main_boot_helpers"
  | "map_boot_status_renderer_boundary"
  | "linked_boot_status_renderer"
  | "behavioral_boot_status_renderer_probe"
  | "map_boot_frame_dispatch_boundary"
  | "linked_boot_frame_dispatch"
  | "map_boot_status_state_init_boundary"
  | "linked_boot_status_state_init"
  | "map_boot_input_helpers_boundary"
  | "linked_boot_input_helpers"
  | "map_boot_transform_helpers_boundary"
  | "linked_boot_transform_helpers"
  | "map_boot_gfx_init_boundary"
  | "linked_boot_gfx_init"
  | "behavioral_boot_gfx_init_tty_probe"
  | "map_boot_frame_wait_loop_boundary"
  | "linked_boot_gfx_helpers"
  | "map_boot_fade_helpers_boundary"
  | "linked_boot_fade_helpers"
  | "map_boot_gte_helpers_boundary"
  | "linked_boot_gte_helpers"
  | "map_boot_object_render_helpers_boundary"
  | "linked_boot_object_render_helpers"
  | "map_boot_scene_animation_boundary"
  | "linked_boot_scene_animation_helpers"
  | "map_boot_object_runtime_boundary"
  | "linked_boot_object_runtime_helpers"
  | "map_boot_scene_runtime_boundary"
  | "linked_boot_scene_runtime_helpers"
  | "map_boot_scene_wait_boundary"
  | "linked_boot_scene_wait_helpers"
  | "map_boot_scene_late_runtime_boundary"
  | "linked_boot_scene_late_runtime_helpers"
  | "map_boot_scene_interaction_boundary";

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
    linkedRuntimeInitAlwaysUnitPath: string | null;
    linkedAsmManifestPath: string | null;
    linkedAsmManifestRebuildExePath: string | null;
    mainBootFunctionName: string | null;
    linkedMainBootUnitPath: string | null;
    postMainBootFunctionName: string | null;
    linkedPostMainBootHelpersUnitPath: string | null;
    bootStatusRendererFunctionName: string | null;
    linkedBootStatusRendererUnitPath: string | null;
    bootStatusRendererBehavioralProbePath: string | null;
    bootFrameDispatchFunctionName: string | null;
    linkedBootFrameDispatchUnitPath: string | null;
    bootStatusStateInitFunctionName: string | null;
    linkedBootStatusStateInitUnitPath: string | null;
    bootInputHelpersFunctionName: string | null;
    linkedBootInputHelpersUnitPath: string | null;
    bootTransformHelpersFunctionName: string | null;
    linkedBootTransformHelpersUnitPath: string | null;
    bootGfxInitFunctionName: string | null;
    linkedBootGfxInitUnitPath: string | null;
    bootGfxInitTtyProbePath: string | null;
    bootGfxHelpersFunctionName: string | null;
    linkedBootGfxHelpersUnitPath: string | null;
    bootFadeHelpersFunctionName: string | null;
    linkedBootFadeHelpersUnitPath: string | null;
    bootGteHelpersFunctionName: string | null;
    linkedBootGteHelpersUnitPath: string | null;
    bootObjectRenderHelpersFunctionName: string | null;
    linkedBootObjectRenderHelpersUnitPath: string | null;
    bootSceneAnimationHelpersFunctionName: string | null;
    linkedBootSceneAnimationHelpersUnitPath: string | null;
    bootObjectRuntimeHelpersFunctionName: string | null;
    linkedBootObjectRuntimeHelpersUnitPath: string | null;
    bootSceneRuntimeHelpersFunctionName: string | null;
    linkedBootSceneRuntimeHelpersUnitPath: string | null;
    bootSceneWaitHelpersFunctionName: string | null;
    linkedBootSceneWaitHelpersUnitPath: string | null;
    bootSceneLateRuntimeHelpersFunctionName: string | null;
    linkedBootSceneLateRuntimeHelpersUnitPath: string | null;
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
  linked_runtime_init_always: "linked-runtime-init-always",
  linked_asm_rebuild_manifest: "linked-asm-rebuild-manifest",
  map_main_boot_function_boundary: "map-main-boot-function-boundary",
  linked_main_boot_function: "linked-main-boot-function",
  map_post_main_boot_function_boundary: "map-post-main-boot-function-boundary",
  linked_post_main_boot_helpers: "linked-post-main-boot-helpers",
  map_boot_status_renderer_boundary: "map-boot-status-renderer-boundary",
  linked_boot_status_renderer: "linked-boot-status-renderer",
  behavioral_boot_status_renderer_probe: "behavioral-boot-status-renderer-probe",
  map_boot_frame_dispatch_boundary: "map-boot-frame-dispatch-boundary",
  linked_boot_frame_dispatch: "linked-boot-frame-dispatch",
  map_boot_status_state_init_boundary: "map-boot-status-state-init-boundary",
  linked_boot_status_state_init: "linked-boot-status-state-init",
  map_boot_input_helpers_boundary: "map-boot-input-helpers-boundary",
  linked_boot_input_helpers: "linked-boot-input-helpers",
  map_boot_transform_helpers_boundary: "map-boot-transform-helpers-boundary",
  linked_boot_transform_helpers: "linked-boot-transform-helpers",
  map_boot_gfx_init_boundary: "map-boot-gfx-init-boundary",
  linked_boot_gfx_init: "linked-boot-gfx-init",
  behavioral_boot_gfx_init_tty_probe: "behavioral-boot-gfx-init-tty-probe",
  map_boot_frame_wait_loop_boundary: "map-boot-frame-wait-loop-boundary",
  linked_boot_gfx_helpers: "linked-boot-gfx-helpers",
  map_boot_fade_helpers_boundary: "map-boot-fade-helpers-boundary",
  linked_boot_fade_helpers: "linked-boot-fade-helpers",
  map_boot_gte_helpers_boundary: "map-boot-gte-helpers-boundary",
  linked_boot_gte_helpers: "linked-boot-gte-helpers",
  map_boot_object_render_helpers_boundary: "map-boot-object-render-helpers-boundary",
  linked_boot_object_render_helpers: "linked-boot-object-render-helpers",
  map_boot_scene_animation_boundary: "map-boot-scene-animation-boundary",
  linked_boot_scene_animation_helpers: "linked-boot-scene-animation-helpers",
  map_boot_object_runtime_boundary: "map-boot-object-runtime-boundary",
  linked_boot_object_runtime_helpers: "linked-boot-object-runtime-helpers",
  map_boot_scene_runtime_boundary: "map-boot-scene-runtime-boundary",
  linked_boot_scene_runtime_helpers: "linked-boot-scene-runtime-helpers",
  map_boot_scene_wait_boundary: "map-boot-scene-wait-boundary",
  linked_boot_scene_wait_helpers: "linked-boot-scene-wait-helpers",
  map_boot_scene_late_runtime_boundary: "map-boot-scene-late-runtime-boundary",
  linked_boot_scene_late_runtime_helpers: "linked-boot-scene-late-runtime-helpers",
  map_boot_scene_interaction_boundary: "map-boot-scene-interaction-boundary",
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
  behavioral_runtime_init_once_tty_probe: "linked_runtime_init_always",
  linked_runtime_init_always: "linked_asm_rebuild_manifest",
  linked_asm_rebuild_manifest: "map_main_boot_function_boundary",
  map_main_boot_function_boundary: "linked_main_boot_function",
  linked_main_boot_function: "map_post_main_boot_function_boundary",
  map_post_main_boot_function_boundary: "linked_post_main_boot_helpers",
  linked_post_main_boot_helpers: "map_boot_status_renderer_boundary",
  map_boot_status_renderer_boundary: "linked_boot_status_renderer",
  linked_boot_status_renderer: "map_boot_frame_dispatch_boundary",
  behavioral_boot_status_renderer_probe: "map_boot_frame_dispatch_boundary",
  map_boot_frame_dispatch_boundary: "linked_boot_frame_dispatch",
  linked_boot_frame_dispatch: "map_boot_status_state_init_boundary",
  map_boot_status_state_init_boundary: "linked_boot_status_state_init",
  linked_boot_status_state_init: "map_boot_input_helpers_boundary",
  map_boot_input_helpers_boundary: "linked_boot_input_helpers",
  linked_boot_input_helpers: "map_boot_transform_helpers_boundary",
  map_boot_transform_helpers_boundary: "linked_boot_transform_helpers",
  linked_boot_transform_helpers: "map_boot_gfx_init_boundary",
  map_boot_gfx_init_boundary: "linked_boot_gfx_init",
  linked_boot_gfx_init: "behavioral_boot_gfx_init_tty_probe",
  behavioral_boot_gfx_init_tty_probe: "map_boot_frame_wait_loop_boundary",
  map_boot_frame_wait_loop_boundary: "linked_boot_gfx_helpers",
  linked_boot_gfx_helpers: "map_boot_fade_helpers_boundary",
  map_boot_fade_helpers_boundary: "linked_boot_fade_helpers",
  linked_boot_fade_helpers: "map_boot_gte_helpers_boundary",
  map_boot_gte_helpers_boundary: "linked_boot_gte_helpers",
  linked_boot_gte_helpers: "map_boot_object_render_helpers_boundary",
  map_boot_object_render_helpers_boundary: "linked_boot_object_render_helpers",
  linked_boot_object_render_helpers: "map_boot_scene_animation_boundary",
  map_boot_scene_animation_boundary: "linked_boot_scene_animation_helpers",
  linked_boot_scene_animation_helpers: "map_boot_object_runtime_boundary",
  map_boot_object_runtime_boundary: "linked_boot_object_runtime_helpers",
  linked_boot_object_runtime_helpers: "map_boot_scene_runtime_boundary",
  map_boot_scene_runtime_boundary: "linked_boot_scene_runtime_helpers",
  linked_boot_scene_runtime_helpers: "map_boot_scene_wait_boundary",
  map_boot_scene_wait_boundary: "linked_boot_scene_wait_helpers",
  linked_boot_scene_wait_helpers: "map_boot_scene_late_runtime_boundary",
  map_boot_scene_late_runtime_boundary: "linked_boot_scene_late_runtime_helpers",
  linked_boot_scene_late_runtime_helpers: "map_boot_scene_interaction_boundary",
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
  if (cmd === "record-boot-status-renderer-ok") {
    recordBootStatusRendererOk(state);
    return;
  }
  if (cmd === "record-boot-gfx-init-tty-ok") {
    recordBootGfxInitTtyOk(state);
    return;
  }

  throw new Error(
    "Unknown command. Use: bun decomp:state status | select-target <disc> | next | record-behavioral-boot-ok | record-runtime-init-boot-ok | record-runtime-init-tty-ok | record-boot-status-renderer-ok | record-boot-gfx-init-tty-ok",
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
    linkedRuntimeInitAlwaysUnitPath: null,
    linkedAsmManifestPath: null,
    linkedAsmManifestRebuildExePath: null,
    mainBootFunctionName: null,
    linkedMainBootUnitPath: null,
    postMainBootFunctionName: null,
    linkedPostMainBootHelpersUnitPath: null,
    bootStatusRendererFunctionName: null,
    linkedBootStatusRendererUnitPath: null,
    bootStatusRendererBehavioralProbePath: null,
    bootFrameDispatchFunctionName: null,
    linkedBootFrameDispatchUnitPath: null,
    bootStatusStateInitFunctionName: null,
    linkedBootStatusStateInitUnitPath: null,
    bootInputHelpersFunctionName: null,
    linkedBootInputHelpersUnitPath: null,
    bootTransformHelpersFunctionName: null,
    linkedBootTransformHelpersUnitPath: null,
    bootGfxInitFunctionName: null,
    linkedBootGfxInitUnitPath: null,
    bootGfxInitTtyProbePath: null,
    bootGfxHelpersFunctionName: null,
    linkedBootGfxHelpersUnitPath: null,
    bootFadeHelpersFunctionName: null,
    linkedBootFadeHelpersUnitPath: null,
    bootGteHelpersFunctionName: null,
    linkedBootGteHelpersUnitPath: null,
    bootObjectRenderHelpersFunctionName: null,
    linkedBootObjectRenderHelpersUnitPath: null,
    bootSceneAnimationHelpersFunctionName: null,
    linkedBootSceneAnimationHelpersUnitPath: null,
    bootObjectRuntimeHelpersFunctionName: null,
    linkedBootObjectRuntimeHelpersUnitPath: null,
    bootSceneRuntimeHelpersFunctionName: null,
    linkedBootSceneRuntimeHelpersUnitPath: null,
    bootSceneWaitHelpersFunctionName: null,
    linkedBootSceneWaitHelpersUnitPath: null,
    bootSceneLateRuntimeHelpersFunctionName: null,
    linkedBootSceneLateRuntimeHelpersUnitPath: null,
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
    if (state.evidence.manualTestingAddsEvidence) {
      buildRuntimeInitTtyProbe(state);
      return;
    }
    verifyLinkedRuntimeInitAlways(state);
    return;
  }
  if (state.phase === "linked_runtime_init_always") {
    verifyLinkedRuntimeInitAlways(state);
    return;
  }
  if (state.phase === "linked_asm_rebuild_manifest") {
    if (state.target.linkedAsmManifestPath != null) {
      verifyMainBootFunctionBoundary(state);
      return;
    }
    verifyLinkedAsmRebuildManifest(state);
    return;
  }
  if (state.phase === "map_main_boot_function_boundary") {
    if (state.target.mainBootFunctionName === "main_boot") {
      verifyLinkedMainBootFunction(state);
      return;
    }
    verifyMainBootFunctionBoundary(state);
    return;
  }
  if (state.phase === "linked_main_boot_function") {
    if (state.target.linkedMainBootUnitPath != null) {
      verifyPostMainBootFunctionBoundary(state);
      return;
    }
    verifyLinkedMainBootFunction(state);
    return;
  }
  if (state.phase === "map_post_main_boot_function_boundary") {
    if (state.target.postMainBootFunctionName === "boot_wait_draw_gate") {
      verifyLinkedPostMainBootHelpers(state);
      return;
    }
    verifyPostMainBootFunctionBoundary(state);
    return;
  }
  if (state.phase === "linked_post_main_boot_helpers") {
    if (state.target.linkedPostMainBootHelpersUnitPath != null) {
      verifyBootStatusRendererBoundary(state);
      return;
    }
    verifyLinkedPostMainBootHelpers(state);
    return;
  }
  if (state.phase === "map_boot_status_renderer_boundary") {
    if (state.target.bootStatusRendererFunctionName === "boot_status_renderer") {
      verifyLinkedBootStatusRenderer(state);
      return;
    }
    verifyBootStatusRendererBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_status_renderer") {
    if (state.target.linkedBootStatusRendererUnitPath != null) {
      verifyBootFrameDispatchBoundary(state);
      return;
    }
    verifyLinkedBootStatusRenderer(state);
    return;
  }
  if (state.phase === "behavioral_boot_status_renderer_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      printStatus(state);
      return;
    }
    verifyBootFrameDispatchBoundary(state);
    return;
  }
  if (state.phase === "map_boot_frame_dispatch_boundary") {
    if (state.target.bootFrameDispatchFunctionName === "boot_frame_dispatch") {
      verifyLinkedBootFrameDispatch(state);
      return;
    }
    verifyBootFrameDispatchBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_frame_dispatch") {
    if (state.target.linkedBootFrameDispatchUnitPath != null) {
      verifyBootStatusStateInitBoundary(state);
      return;
    }
    verifyLinkedBootFrameDispatch(state);
    return;
  }
  if (state.phase === "map_boot_status_state_init_boundary") {
    if (state.target.bootStatusStateInitFunctionName === "boot_status_state_init") {
      verifyLinkedBootStatusStateInit(state);
      return;
    }
    verifyBootStatusStateInitBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_status_state_init") {
    if (state.target.linkedBootStatusStateInitUnitPath != null) {
      verifyBootInputHelpersBoundary(state);
      return;
    }
    verifyLinkedBootStatusStateInit(state);
    return;
  }
  if (state.phase === "map_boot_input_helpers_boundary") {
    if (state.target.bootInputHelpersFunctionName === "boot_input_position_loop") {
      verifyLinkedBootInputHelpers(state);
      return;
    }
    verifyBootInputHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_input_helpers") {
    if (state.target.linkedBootInputHelpersUnitPath != null) {
      verifyBootTransformHelpersBoundary(state);
      return;
    }
    verifyLinkedBootInputHelpers(state);
    return;
  }
  if (state.phase === "map_boot_transform_helpers_boundary") {
    if (state.target.bootTransformHelpersFunctionName === "boot_apply_object_offset") {
      verifyLinkedBootTransformHelpers(state);
      return;
    }
    verifyBootTransformHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_transform_helpers") {
    verifyLinkedBootTransformHelpers(state);
    return;
  }
  if (state.phase === "map_boot_gfx_init_boundary") {
    if (state.target.bootGfxInitFunctionName === "boot_gfx_init") {
      verifyLinkedBootGfxInit(state);
      return;
    }
    verifyBootGfxInitBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_gfx_init") {
    if (state.target.linkedBootGfxInitUnitPath != null) {
      buildBootGfxInitTtyProbe(state);
      return;
    }
    verifyLinkedBootGfxInit(state);
    return;
  }
  if (state.phase === "behavioral_boot_gfx_init_tty_probe") {
    buildBootGfxInitTtyProbe(state);
    return;
  }
  if (state.phase === "map_boot_frame_wait_loop_boundary") {
    if (state.target.bootGfxHelpersFunctionName === "boot_frame_wait_loop") {
      verifyLinkedBootGfxHelpers(state);
      return;
    }
    verifyBootGfxHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_gfx_helpers") {
    if (state.target.linkedBootGfxHelpersUnitPath != null) {
      verifyBootFadeHelpersBoundary(state);
      return;
    }
    verifyLinkedBootGfxHelpers(state);
    return;
  }
  if (state.phase === "map_boot_fade_helpers_boundary") {
    if (state.target.bootFadeHelpersFunctionName === "boot_fade_object_spawn") {
      verifyLinkedBootFadeHelpers(state);
      return;
    }
    verifyBootFadeHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_fade_helpers") {
    if (state.target.linkedBootFadeHelpersUnitPath != null) {
      verifyBootGteHelpersBoundary(state);
      return;
    }
    verifyLinkedBootFadeHelpers(state);
    return;
  }
  if (state.phase === "map_boot_gte_helpers_boundary") {
    if (state.target.bootGteHelpersFunctionName === "boot_gte_project_object_origin") {
      verifyLinkedBootGteHelpers(state);
      return;
    }
    verifyBootGteHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_gte_helpers") {
    if (state.target.linkedBootGteHelpersUnitPath != null) {
      verifyBootObjectRenderHelpersBoundary(state);
      return;
    }
    verifyLinkedBootGteHelpers(state);
    return;
  }
  if (state.phase === "map_boot_object_render_helpers_boundary") {
    if (state.target.bootObjectRenderHelpersFunctionName === "boot_object_quad_emit") {
      verifyLinkedBootObjectRenderHelpers(state);
      return;
    }
    verifyBootObjectRenderHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_object_render_helpers") {
    if (state.target.linkedBootObjectRenderHelpersUnitPath != null) {
      verifyBootSceneAnimationHelpersBoundary(state);
      return;
    }
    verifyLinkedBootObjectRenderHelpers(state);
    return;
  }
  if (state.phase === "map_boot_scene_animation_boundary") {
    if (state.target.bootSceneAnimationHelpersFunctionName === "boot_scene_stream_load") {
      verifyLinkedBootSceneAnimationHelpers(state);
      return;
    }
    verifyBootSceneAnimationHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_scene_animation_helpers") {
    if (state.target.linkedBootSceneAnimationHelpersUnitPath != null) {
      verifyBootObjectRuntimeHelpersBoundary(state);
      return;
    }
    verifyLinkedBootSceneAnimationHelpers(state);
    return;
  }
  if (state.phase === "map_boot_object_runtime_boundary") {
    if (state.target.bootObjectRuntimeHelpersFunctionName === "boot_runtime_object_frame_limit") {
      verifyLinkedBootObjectRuntimeHelpers(state);
      return;
    }
    verifyBootObjectRuntimeHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_object_runtime_helpers") {
    if (state.target.linkedBootObjectRuntimeHelpersUnitPath != null) {
      verifyBootSceneRuntimeHelpersBoundary(state);
      return;
    }
    verifyLinkedBootObjectRuntimeHelpers(state);
    return;
  }
  if (state.phase === "map_boot_scene_runtime_boundary") {
    if (state.target.bootSceneRuntimeHelpersFunctionName === "boot_runtime_scene_phase_step_c") {
      verifyLinkedBootSceneRuntimeHelpers(state);
      return;
    }
    verifyBootSceneRuntimeHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_scene_runtime_helpers") {
    if (state.target.linkedBootSceneRuntimeHelpersUnitPath != null) {
      verifyBootSceneWaitHelpersBoundary(state);
      return;
    }
    verifyLinkedBootSceneRuntimeHelpers(state);
    return;
  }
  if (state.phase === "map_boot_scene_wait_boundary") {
    if (state.target.bootSceneWaitHelpersFunctionName === "boot_scene_wait_vram_prepare") {
      verifyLinkedBootSceneWaitHelpers(state);
      return;
    }
    verifyBootSceneWaitHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_scene_wait_helpers") {
    if (state.target.linkedBootSceneWaitHelpersUnitPath != null) {
      verifyBootSceneLateRuntimeHelpersBoundary(state);
      return;
    }
    verifyLinkedBootSceneWaitHelpers(state);
    return;
  }
  if (state.phase === "map_boot_scene_late_runtime_boundary") {
    if (
      state.target.bootSceneLateRuntimeHelpersFunctionName === "boot_scene_late_runtime_phase_a"
    ) {
      verifyLinkedBootSceneLateRuntimeHelpers(state);
      return;
    }
    verifyBootSceneLateRuntimeHelpersBoundary(state);
    return;
  }
  if (state.phase === "linked_boot_scene_late_runtime_helpers") {
    verifyLinkedBootSceneLateRuntimeHelpers(state);
    return;
  }
  throw new Error(`No runner implemented for phase ${state.phase}`);
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
    nextCheckpoint: "linked_runtime_init_always",
  };
  state.lastVerifiedCommand = "bun decomp:state record-runtime-init-tty-ok";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog("Manual runtime_init_once TTY boot/load/log probe passed.");
  printStatus(state);
}

function verifyLinkedRuntimeInitAlways(state: DecompState): void {
  if (state.phase === "behavioral_runtime_init_once_tty_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      printStatus(state);
      return;
    }
    transition(state, "linked_runtime_init_always", "bun decomp:state next");
  }
  requirePhase(state, "linked_runtime_init_always");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/runtime-init-always-linked-v0.json`;
  const rebuiltExePath = `decomp/build/linked/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked runtime-init-always unit not found: ${unitPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked runtime-init-always verifier",
  );

  state.target.linkedRuntimeInitAlwaysUnitPath = unitPath;
  state.target.linkedRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 376,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_asm_rebuild_manifest",
  };
  transition(state, "linked_asm_rebuild_manifest", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked runtime_init_always unit ${unitPath}; next checkpoint is linked assembly rebuild manifest.`,
  );
  printStatus(state);
}

function verifyLinkedAsmRebuildManifest(state: DecompState): void {
  requirePhase(state, "linked_asm_rebuild_manifest");
  const serial = requireValue(state.target.serial, "target.serial");
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 376,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_main_boot_function_boundary",
  };
  transition(state, "map_main_boot_function_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked assembly rebuild manifest ${manifestPath}; next checkpoint is main boot function boundary mapping.`,
  );
  printStatus(state);
}

function verifyMainBootFunctionBoundary(state: DecompState): void {
  if (state.phase === "linked_asm_rebuild_manifest") {
    if (state.target.linkedAsmManifestPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_main_boot_function_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_main_boot_function_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier("bun", ["decomp:verify-map", STATE_PATH, mapPath], "Main boot boundary verifier");

  state.target.mainBootFunctionName = "main_boot";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 376,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_main_boot_function",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(`Verified main_boot function boundary in ${mapPath}; no manual test requested.`);
  printStatus(state);
}

function verifyLinkedMainBootFunction(state: DecompState): void {
  if (state.phase === "map_main_boot_function_boundary") {
    if (state.target.mainBootFunctionName !== "main_boot") {
      printStatus(state);
      return;
    }
    transition(state, "linked_main_boot_function", "bun decomp:state next");
  }
  requirePhase(state, "linked_main_boot_function");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/main-boot-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath)) throw new Error(`Linked main_boot unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked main_boot verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedMainBootUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 764,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_post_main_boot_function_boundary",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified linked main_boot unit ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyPostMainBootFunctionBoundary(state: DecompState): void {
  if (state.phase === "linked_main_boot_function") {
    if (state.target.linkedMainBootUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_post_main_boot_function_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_post_main_boot_function_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Post-main boot boundary verifier",
  );

  state.target.postMainBootFunctionName = "boot_wait_draw_gate";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 764,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_post_main_boot_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(`Verified post-main_boot helper boundaries in ${mapPath}; no manual test requested.`);
  printStatus(state);
}

function verifyLinkedPostMainBootHelpers(state: DecompState): void {
  if (state.phase === "map_post_main_boot_function_boundary") {
    if (state.target.postMainBootFunctionName !== "boot_wait_draw_gate") {
      printStatus(state);
      return;
    }
    transition(state, "linked_post_main_boot_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_post_main_boot_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/post-main-boot-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked post-main boot helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked post-main boot helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedPostMainBootHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 1156,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_status_renderer_boundary",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified linked post-main_boot helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootStatusRendererBoundary(state: DecompState): void {
  if (state.phase === "linked_post_main_boot_helpers") {
    if (state.target.linkedPostMainBootHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_status_renderer_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_status_renderer_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot status renderer boundary verifier",
  );

  state.target.bootStatusRendererFunctionName = "boot_status_renderer";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 1156,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_status_renderer",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(`Verified boot_status_renderer boundary in ${mapPath}; no manual test requested.`);
  printStatus(state);
}

function verifyLinkedBootStatusRenderer(state: DecompState): void {
  if (state.phase === "map_boot_status_renderer_boundary") {
    if (state.target.bootStatusRendererFunctionName !== "boot_status_renderer") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_status_renderer", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_status_renderer");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-status-renderer-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot status renderer unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot status renderer verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootStatusRendererUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 1684,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_frame_dispatch_boundary",
  };
  transition(state, "map_boot_frame_dispatch_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot_status_renderer ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function recordBootStatusRendererOk(state: DecompState): void {
  requirePhase(state, "behavioral_boot_status_renderer_probe");
  state.evidence = {
    ...state.evidence,
    class: "behavioral_equivalence",
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_frame_dispatch_boundary",
  };
  state.lastVerifiedCommand = "bun decomp:state record-boot-status-renderer-ok";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog("Manual boot_status_renderer behavioral boot/load probe passed.");
  printStatus(state);
}

function verifyBootFrameDispatchBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_status_renderer") {
    if (state.target.linkedBootStatusRendererUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_frame_dispatch_boundary", "bun decomp:state next");
  }
  if (state.phase === "behavioral_boot_status_renderer_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_frame_dispatch_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_frame_dispatch_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot frame dispatch boundary verifier",
  );

  state.target.bootFrameDispatchFunctionName = "boot_frame_dispatch";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 1684,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_frame_dispatch",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(`Verified boot_frame_dispatch boundary in ${mapPath}; no manual test requested.`);
  printStatus(state);
}

function verifyLinkedBootFrameDispatch(state: DecompState): void {
  if (state.phase === "map_boot_frame_dispatch_boundary") {
    if (state.target.bootFrameDispatchFunctionName !== "boot_frame_dispatch") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_frame_dispatch", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_frame_dispatch");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-frame-dispatch-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot frame dispatch unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot frame dispatch verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootFrameDispatchUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 1916,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_status_state_init_boundary",
  };
  transition(state, "map_boot_status_state_init_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot_frame_dispatch ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootStatusStateInitBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_frame_dispatch") {
    if (state.target.linkedBootFrameDispatchUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_status_state_init_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_status_state_init_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot status state init boundary verifier",
  );

  state.target.bootStatusStateInitFunctionName = "boot_status_state_init";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 1916,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_status_state_init",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(`Verified boot_status_state_init boundary in ${mapPath}; no manual test requested.`);
  printStatus(state);
}

function verifyLinkedBootStatusStateInit(state: DecompState): void {
  if (state.phase === "map_boot_status_state_init_boundary") {
    if (state.target.bootStatusStateInitFunctionName !== "boot_status_state_init") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_status_state_init", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_status_state_init");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-status-state-init-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot status state init unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot status state init verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootStatusStateInitUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 2440,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_input_helpers_boundary",
  };
  transition(state, "map_boot_input_helpers_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot_status_state_init ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootInputHelpersBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_status_state_init") {
    if (state.target.linkedBootStatusStateInitUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_input_helpers_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_input_helpers_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot input helpers boundary verifier",
  );

  state.target.bootInputHelpersFunctionName = "boot_input_position_loop";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 2440,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_input_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified boot_input_position_loop and boot_callback_slots_clear boundaries in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function verifyLinkedBootInputHelpers(state: DecompState): void {
  if (state.phase === "map_boot_input_helpers_boundary") {
    if (state.target.bootInputHelpersFunctionName !== "boot_input_position_loop") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_input_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_input_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-input-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot input helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot input helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootInputHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 2824,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_transform_helpers_boundary",
  };
  transition(state, "map_boot_transform_helpers_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot input helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootTransformHelpersBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_input_helpers") {
    if (state.target.linkedBootInputHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_transform_helpers_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_transform_helpers_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot transform helpers boundary verifier",
  );

  state.target.bootTransformHelpersFunctionName = "boot_apply_object_offset";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 2824,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_transform_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(`Verified boot transform helper boundaries in ${mapPath}; no manual test requested.`);
  printStatus(state);
}

function verifyLinkedBootTransformHelpers(state: DecompState): void {
  if (state.phase === "map_boot_transform_helpers_boundary") {
    if (state.target.bootTransformHelpersFunctionName !== "boot_apply_object_offset") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_transform_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_transform_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-transform-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot transform helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot transform helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootTransformHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 3340,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_gfx_init_boundary",
  };
  transition(state, "map_boot_gfx_init_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot transform helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootGfxInitBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_transform_helpers") {
    if (state.target.linkedBootTransformHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_gfx_init_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_gfx_init_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier("bun", ["decomp:verify-map", STATE_PATH, mapPath], "Boot gfx init boundary verifier");

  state.target.bootGfxInitFunctionName = "boot_gfx_init";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 3340,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_gfx_init",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(`Verified boot_gfx_init boundary in ${mapPath}; no manual test requested.`);
  printStatus(state);
}

function verifyLinkedBootGfxInit(state: DecompState): void {
  if (state.phase === "map_boot_gfx_init_boundary") {
    if (state.target.bootGfxInitFunctionName !== "boot_gfx_init") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_gfx_init", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_gfx_init");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-gfx-init-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath)) throw new Error(`Linked boot gfx init unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot gfx init verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootGfxInitUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 3596,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "behavioral_boot_gfx_init_tty_probe",
  };
  transition(state, "behavioral_boot_gfx_init_tty_probe", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot_gfx_init ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function buildBootGfxInitTtyProbe(state: DecompState): void {
  if (state.phase === "linked_boot_gfx_init") {
    if (state.target.linkedBootGfxInitUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "behavioral_boot_gfx_init_tty_probe", "bun decomp:state next");
  }
  requirePhase(state, "behavioral_boot_gfx_init_tty_probe");
  if (state.evidence.manualTestingAddsEvidence) {
    printStatus(state);
    return;
  }

  const serial = requireValue(state.target.serial, "target.serial");
  const probePath = `decomp/manual-tests/${serial}/boot-gfx-init-tty-log-v0.json`;
  const discPath =
    "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).bin";
  const cuePath =
    "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).cue";
  const expectedLogText = "MDEC_out_sync";

  if (!existsSync(probePath)) throw new Error(`Boot gfx init TTY probe not found: ${probePath}`);
  runVerifier(
    "bun",
    ["decomp:build-manual-disc", STATE_PATH, probePath],
    "Boot gfx init TTY manual disc builder",
  );

  state.target.bootGfxInitTtyProbePath = probePath;
  state.target.manualTestDiscPath = discPath;
  state.target.manualTestCuePath = cuePath;
  state.target.manualTestExpectedLogText = expectedLogText;
  state.evidence = {
    class: "behavioral_equivalence",
    sourceGeneratedExecutableBytes: 3596,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: true,
    nextCheckpoint: "manual_boot_load_boot_gfx_init_tty_disc",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Built boot_gfx_init TTY probe ${probePath}; manual boot/load/log test required at ${cuePath}.`,
  );
  printStatus(state);
}

function recordBootGfxInitTtyOk(state: DecompState): void {
  requirePhase(state, "behavioral_boot_gfx_init_tty_probe");
  state.evidence = {
    ...state.evidence,
    class: "behavioral_equivalence",
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_frame_wait_loop_boundary",
  };
  transition(
    state,
    "map_boot_frame_wait_loop_boundary",
    "bun decomp:state record-boot-gfx-init-tty-ok",
  );
  writeState(state);
  appendLog("Manual boot_gfx_init TTY boot/load/log probe passed.");
  printStatus(state);
}

function verifyBootGfxHelpersBoundary(state: DecompState): void {
  requirePhase(state, "map_boot_frame_wait_loop_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot graphics helper boundary verifier",
  );

  state.target.bootGfxHelpersFunctionName = "boot_frame_wait_loop";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 3596,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_gfx_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified boot graphics helper boundaries 0x800137e4..0x80015078 in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function verifyLinkedBootGfxHelpers(state: DecompState): void {
  if (state.phase === "map_boot_frame_wait_loop_boundary") {
    if (state.target.bootGfxHelpersFunctionName !== "boot_frame_wait_loop") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_gfx_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_gfx_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-gfx-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot graphics helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot graphics helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootGfxHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 9888,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_fade_helpers_boundary",
  };
  transition(state, "map_boot_fade_helpers_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot graphics helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootFadeHelpersBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_gfx_helpers") {
    if (state.target.linkedBootGfxHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_fade_helpers_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_fade_helpers_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot fade helper boundary verifier",
  );

  state.target.bootFadeHelpersFunctionName = "boot_fade_object_spawn";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 9888,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_fade_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified boot fade/palette helper boundaries 0x80015078..0x80015d18 in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function verifyLinkedBootFadeHelpers(state: DecompState): void {
  if (state.phase === "map_boot_fade_helpers_boundary") {
    if (state.target.bootFadeHelpersFunctionName !== "boot_fade_object_spawn") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_fade_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_fade_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-fade-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot fade helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot fade helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootFadeHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 13120,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_gte_helpers_boundary",
  };
  transition(state, "map_boot_gte_helpers_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot fade/palette helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootGteHelpersBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_fade_helpers") {
    if (state.target.linkedBootFadeHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_gte_helpers_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_gte_helpers_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot GTE helper boundary verifier",
  );

  state.target.bootGteHelpersFunctionName = "boot_gte_project_object_origin";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 13120,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_gte_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified boot GTE helper boundaries 0x80015d18..0x80016784 in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function verifyLinkedBootGteHelpers(state: DecompState): void {
  if (state.phase === "map_boot_gte_helpers_boundary") {
    if (state.target.bootGteHelpersFunctionName !== "boot_gte_project_object_origin") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_gte_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_gte_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-gte-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath)) throw new Error(`Linked boot GTE helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot GTE helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootGteHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 15788,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_object_render_helpers_boundary",
  };
  transition(state, "map_boot_object_render_helpers_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot GTE helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootObjectRenderHelpersBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_gte_helpers") {
    if (state.target.linkedBootGteHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_object_render_helpers_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_object_render_helpers_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot object-render helper boundary verifier",
  );

  state.target.bootObjectRenderHelpersFunctionName = "boot_object_quad_emit";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 15788,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_object_render_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified boot object-render helper boundaries 0x80016784..0x8001755c in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function verifyLinkedBootObjectRenderHelpers(state: DecompState): void {
  if (state.phase === "map_boot_object_render_helpers_boundary") {
    if (state.target.bootObjectRenderHelpersFunctionName !== "boot_object_quad_emit") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_object_render_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_object_render_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-object-render-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot object-render helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot object-render helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootObjectRenderHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 19332,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_scene_animation_boundary",
  };
  transition(state, "map_boot_scene_animation_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot object-render helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootSceneAnimationHelpersBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_object_render_helpers") {
    if (state.target.linkedBootObjectRenderHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_scene_animation_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_scene_animation_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot scene-animation helper boundary verifier",
  );

  state.target.bootSceneAnimationHelpersFunctionName = "boot_scene_stream_load";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 19332,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_scene_animation_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified boot scene-animation helper boundaries 0x8001755c..0x80017db4 in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function verifyLinkedBootSceneAnimationHelpers(state: DecompState): void {
  if (state.phase === "map_boot_scene_animation_boundary") {
    if (state.target.bootSceneAnimationHelpersFunctionName !== "boot_scene_stream_load") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_scene_animation_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_scene_animation_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-scene-animation-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot scene-animation helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot scene-animation helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootSceneAnimationHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 21468,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_object_runtime_boundary",
  };
  transition(state, "map_boot_object_runtime_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot scene-animation helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootObjectRuntimeHelpersBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_scene_animation_helpers") {
    if (state.target.linkedBootSceneAnimationHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_object_runtime_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_object_runtime_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot object-runtime helper boundary verifier",
  );

  state.target.bootObjectRuntimeHelpersFunctionName = "boot_runtime_object_frame_limit";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 21468,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_object_runtime_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified boot object-runtime helper boundaries 0x80017db4..0x80018db4 in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function verifyLinkedBootObjectRuntimeHelpers(state: DecompState): void {
  if (state.phase === "map_boot_object_runtime_boundary") {
    if (state.target.bootObjectRuntimeHelpersFunctionName !== "boot_runtime_object_frame_limit") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_object_runtime_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_object_runtime_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-object-runtime-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot object-runtime helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot object-runtime helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootObjectRuntimeHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 25564,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_scene_runtime_boundary",
  };
  transition(state, "map_boot_scene_runtime_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot object-runtime helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootSceneRuntimeHelpersBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_object_runtime_helpers") {
    if (state.target.linkedBootObjectRuntimeHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_scene_runtime_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_scene_runtime_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot scene-runtime helper boundary verifier",
  );

  state.target.bootSceneRuntimeHelpersFunctionName = "boot_runtime_scene_phase_step_c";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 25564,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_scene_runtime_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified boot scene-runtime helper boundaries 0x80018db4..0x8001944c in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function verifyLinkedBootSceneRuntimeHelpers(state: DecompState): void {
  if (state.phase === "map_boot_scene_runtime_boundary") {
    if (state.target.bootSceneRuntimeHelpersFunctionName !== "boot_runtime_scene_phase_step_c") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_scene_runtime_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_scene_runtime_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-scene-runtime-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot scene-runtime helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot scene-runtime helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootSceneRuntimeHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 27252,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_scene_wait_boundary",
  };
  transition(state, "map_boot_scene_wait_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot scene-runtime helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootSceneWaitHelpersBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_scene_runtime_helpers") {
    if (state.target.linkedBootSceneRuntimeHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_scene_wait_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_scene_wait_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot scene wait/duel-runtime helper boundary verifier",
  );

  state.target.bootSceneWaitHelpersFunctionName = "boot_scene_wait_vram_prepare";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 27252,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_scene_wait_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified boot scene wait/duel-runtime helper boundaries 0x8001944c..0x800208d4 in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function verifyLinkedBootSceneWaitHelpers(state: DecompState): void {
  if (state.phase === "map_boot_scene_wait_boundary") {
    if (state.target.bootSceneWaitHelpersFunctionName !== "boot_scene_wait_vram_prepare") {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_scene_wait_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_scene_wait_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-scene-wait-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot scene wait helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot scene wait helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootSceneWaitHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 57084,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_scene_late_runtime_boundary",
  };
  transition(state, "map_boot_scene_late_runtime_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot scene wait/duel-runtime helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
  printStatus(state);
}

function verifyBootSceneLateRuntimeHelpersBoundary(state: DecompState): void {
  if (state.phase === "linked_boot_scene_wait_helpers") {
    if (state.target.linkedBootSceneWaitHelpersUnitPath == null) {
      printStatus(state);
      return;
    }
    transition(state, "map_boot_scene_late_runtime_boundary", "bun decomp:state next");
  }
  requirePhase(state, "map_boot_scene_late_runtime_boundary");

  const mapPath = requireValue(state.target.boundaryMapPath, "target.boundaryMapPath");
  runVerifier(
    "bun",
    ["decomp:verify-map", STATE_PATH, mapPath],
    "Boot scene late-runtime helper boundary verifier",
  );

  state.target.bootSceneLateRuntimeHelpersFunctionName = "boot_scene_late_runtime_phase_a";
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 57084,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "linked_boot_scene_late_runtime_helpers",
  };
  state.lastVerifiedCommand = "bun decomp:state next";
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendLog(
    `Verified boot scene late-runtime helper boundaries 0x800208d4..0x80023fbc in ${mapPath}; no manual test requested.`,
  );
  printStatus(state);
}

function verifyLinkedBootSceneLateRuntimeHelpers(state: DecompState): void {
  if (state.phase === "map_boot_scene_late_runtime_boundary") {
    if (
      state.target.bootSceneLateRuntimeHelpersFunctionName !== "boot_scene_late_runtime_phase_a"
    ) {
      printStatus(state);
      return;
    }
    transition(state, "linked_boot_scene_late_runtime_helpers", "bun decomp:state next");
  }
  requirePhase(state, "linked_boot_scene_late_runtime_helpers");

  const serial = requireValue(state.target.serial, "target.serial");
  const unitPath = `decomp/linked-units/${serial}/boot-scene-late-runtime-helpers-linked-v0.json`;
  const manifestPath = `decomp/manifests/${serial}.linked-asm-v0.json`;
  const rebuiltExePath = `decomp/build/linked-manifest/${serial}.exe`;

  if (!existsSync(unitPath))
    throw new Error(`Linked boot scene late-runtime helpers unit not found: ${unitPath}`);
  if (!existsSync(manifestPath))
    throw new Error(`Linked assembly manifest not found: ${manifestPath}`);
  runVerifier(
    "bun",
    ["decomp:verify-linked-unit", STATE_PATH, unitPath],
    "Linked boot scene late-runtime helpers verifier",
  );
  runVerifier(
    "bun",
    ["decomp:verify-linked-manifest", STATE_PATH, manifestPath],
    "Linked assembly manifest verifier",
  );

  state.target.linkedBootSceneLateRuntimeHelpersUnitPath = unitPath;
  state.target.linkedAsmManifestPath = manifestPath;
  state.target.linkedAsmManifestRebuildExePath = rebuiltExePath;
  state.evidence = {
    class: "linked_executable",
    sourceGeneratedExecutableBytes: 71140,
    byteReplayExecutableBytes: 0,
    manualTestingAddsEvidence: false,
    nextCheckpoint: "map_boot_scene_interaction_boundary",
  };
  transition(state, "map_boot_scene_interaction_boundary", "bun decomp:state next");
  writeState(state);
  appendLog(
    `Verified linked boot scene late-runtime helpers ${unitPath} and refreshed linked assembly manifest ${manifestPath}.`,
  );
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
      return `Manual test: required: binary change under test: linked entrypoint bootstrap semantic no-op probe. Boot ${state.target.manualTestCuePath ?? state.target.manualTestDiscPath ?? "(manual test disc path missing)"} in DuckStation, start the game, and load a save. If it passes, record with: bun decomp:state record-behavioral-boot-ok`;
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_runtime_init_once") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "behavioral_runtime_init_once_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      return `Manual test: required: binary change under test: linked runtime_init_once semantic no-op probe. Boot ${state.target.manualTestCuePath ?? state.target.manualTestDiscPath ?? "(manual test disc path missing)"} in DuckStation, start the game, and load a save. If it passes, record with: bun decomp:state record-runtime-init-boot-ok`;
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "behavioral_runtime_init_once_tty_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      return `Manual test: required: binary change under test: linked runtime_init_once emits a BIOS TTY log on the first-run path. Boot ${state.target.manualTestCuePath ?? state.target.manualTestDiscPath ?? "(manual test disc path missing)"} in DuckStation, start the game, and load a save. Then an agent must verify DuckStation logs contain "${state.target.manualTestExpectedLogText ?? "MDEC_out_sync"}" before recording: bun decomp:state record-runtime-init-tty-ok`;
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_runtime_init_always") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_asm_rebuild_manifest") {
    if (state.target.linkedAsmManifestPath != null) {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_main_boot_function_boundary") {
    if (state.target.mainBootFunctionName === "main_boot") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_main_boot_function") {
    if (state.target.linkedMainBootUnitPath != null) {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_post_main_boot_function_boundary") {
    if (state.target.postMainBootFunctionName === "boot_wait_draw_gate") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_post_main_boot_helpers") {
    if (state.target.linkedPostMainBootHelpersUnitPath != null) {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_status_renderer_boundary") {
    if (state.target.bootStatusRendererFunctionName === "boot_status_renderer") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_status_renderer") {
    if (state.target.linkedBootStatusRendererUnitPath != null) {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "behavioral_boot_status_renderer_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      return `Manual test: required: binary change under test: obsolete linked boot_status_renderer semantic no-op probe. Boot ${state.target.manualTestCuePath ?? state.target.manualTestDiscPath ?? "(manual test disc path missing)"} in DuckStation, start the game, and load a save. If it passes, record with: bun decomp:state record-boot-status-renderer-ok`;
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_frame_dispatch_boundary") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_frame_dispatch") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_status_state_init_boundary") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_status_state_init") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_input_helpers_boundary") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_input_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_transform_helpers_boundary") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_transform_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_gfx_init_boundary") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_gfx_init") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "behavioral_boot_gfx_init_tty_probe") {
    if (state.evidence.manualTestingAddsEvidence) {
      return `Manual test: required: binary change under test: linked boot_gfx_init now routes its initialization call through a generated TTY hook, proving this boot graphics source path executes at runtime. Boot ${state.target.manualTestCuePath ?? state.target.manualTestDiscPath ?? "(manual test disc path missing)"} in DuckStation, start the game, and load a save. Then an agent must verify DuckStation logs contain "${state.target.manualTestExpectedLogText ?? "MDEC_out_sync"}" before recording: bun decomp:state record-boot-gfx-init-tty-ok`;
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_frame_wait_loop_boundary") {
    if (state.target.bootGfxHelpersFunctionName === "boot_frame_wait_loop") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_gfx_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_fade_helpers_boundary") {
    if (state.target.bootFadeHelpersFunctionName === "boot_fade_object_spawn") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_fade_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_gte_helpers_boundary") {
    if (state.target.bootGteHelpersFunctionName === "boot_gte_project_object_origin") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_gte_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_object_render_helpers_boundary") {
    if (state.target.bootObjectRenderHelpersFunctionName === "boot_object_quad_emit") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_object_render_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_scene_animation_boundary") {
    if (state.target.bootSceneAnimationHelpersFunctionName === "boot_scene_stream_load") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_scene_animation_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_object_runtime_boundary") {
    if (state.target.bootObjectRuntimeHelpersFunctionName === "boot_runtime_object_frame_limit") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_object_runtime_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_scene_runtime_boundary") {
    if (state.target.bootSceneRuntimeHelpersFunctionName === "boot_runtime_scene_phase_step_c") {
      return "Next: bun decomp:state next";
    }
    return "Next: bun decomp:state next";
  }
  if (state.phase === "linked_boot_scene_runtime_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_scene_wait_boundary") {
    if (state.target.bootSceneWaitHelpersFunctionName === "boot_scene_wait_vram_prepare") {
      return "Next: bun decomp:state next";
    }
    return "Next: map and verify the scene wait/duel-runtime block 0x8001944c..0x800208d4.";
  }
  if (state.phase === "linked_boot_scene_wait_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_scene_late_runtime_boundary") {
    if (
      state.target.bootSceneLateRuntimeHelpersFunctionName === "boot_scene_late_runtime_phase_a"
    ) {
      return "Next: bun decomp:state next";
    }
    return "Next: map and verify the boot scene late-runtime block 0x800208d4..0x80023fbc.";
  }
  if (state.phase === "linked_boot_scene_late_runtime_helpers") {
    return "Next: bun decomp:state next";
  }
  if (state.phase === "map_boot_scene_interaction_boundary") {
    return "Next: map and verify the next boot scene interaction block starting at 0x80023fbc.";
  }
  return "Next: bun decomp:state next";
}

function requirePhase(state: DecompState, phase: Phase): void {
  if (state.phase !== phase) {
    throw new Error(`Expected phase ${phase}, got ${state.phase}. Run "bun decomp:state status".`);
  }
}

function requireValue<T>(value: T | null | undefined, label: string): T {
  if (value == null) throw new Error(`Missing ${label} in ${STATE_PATH}`);
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
