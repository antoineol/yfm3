import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { parsePsxExeHeader } from "../../bridge/extract/detect-exe.ts";

interface DecompState {
  schemaVersion: 1;
  phase: string;
  target: {
    serial: string | null;
    exeSize: number | null;
    exeSha256: string | null;
    exeLoadAddr: number | null;
    exeTextSize: number | null;
    extractedExePath: string | null;
  };
}

interface BoundaryMap {
  schemaVersion: 1;
  serial: string;
  exe: {
    fileSize: number;
    sha256: string;
    entrypoint: number;
    initialGp: number;
    loadAddress: number;
    payloadSize: number;
    stackPointer: number;
  };
  ranges: BoundaryRange[];
  functions?: FunctionBoundary[];
}

interface BoundaryRange {
  name: string;
  kind: "header" | "payload";
  fileStart: number;
  fileEnd: number;
  size: number;
  ramStart?: number;
  ramEnd?: number;
}

interface FunctionBoundary {
  name: string;
  kind: "entrypoint_bootstrap" | "function";
  fileStart: number;
  fileEnd: number;
  ramStart: number;
  ramEnd: number;
  size: number;
  boundaryEvidence: string;
}

const statePath = process.argv[2] ?? "decomp/STATE.json";
const mapPath = process.argv[3] ?? "decomp/maps/SLUS_014.11.json";

verifyBoundaryMap(statePath, mapPath);

function verifyBoundaryMap(stateFile: string, mapFile: string): void {
  const state = readJson<DecompState>(stateFile);
  const map = readJson<BoundaryMap>(mapFile);
  const exePath = required(state.target.extractedExePath, "target.extractedExePath");
  if (!existsSync(exePath)) throw new Error(`Extracted executable not found: ${exePath}`);

  const exe = readFileSync(exePath);
  const header = parsePsxExeHeader(exe);
  const exeSha256 = sha256(exe);
  const entrypoint = exe.readUInt32LE(0x10);
  const initialGp = exe.readUInt32LE(0x14);
  const stackPointer = exe.readUInt32LE(0x30);

  assertEqual(map.schemaVersion, 1, "map.schemaVersion");
  assertEqual(map.serial, required(state.target.serial, "target.serial"), "map.serial");
  assertEqual(
    map.exe.fileSize,
    required(state.target.exeSize, "target.exeSize"),
    "map.exe.fileSize",
  );
  assertEqual(map.exe.fileSize, exe.length, "map.exe.fileSize vs extracted executable length");
  assertEqual(
    map.exe.sha256,
    required(state.target.exeSha256, "target.exeSha256"),
    "map.exe.sha256",
  );
  assertEqual(map.exe.sha256, exeSha256, "map.exe.sha256 vs extracted executable hash");
  assertEqual(map.exe.entrypoint, entrypoint, "map.exe.entrypoint");
  assertEqual(map.exe.initialGp, initialGp, "map.exe.initialGp");
  assertEqual(
    map.exe.loadAddress,
    required(state.target.exeLoadAddr, "target.exeLoadAddr"),
    "map.exe.loadAddress",
  );
  assertEqual(map.exe.loadAddress, header.loadAddr, "map.exe.loadAddress vs PS-X header");
  assertEqual(
    map.exe.payloadSize,
    required(state.target.exeTextSize, "target.exeTextSize"),
    "map.exe.payloadSize",
  );
  assertEqual(map.exe.payloadSize, header.textSize, "map.exe.payloadSize vs PS-X header");
  assertEqual(map.exe.stackPointer, stackPointer, "map.exe.stackPointer");

  const payload = verifyRanges(map);
  verifyFunctions(map, exe, payload);
  console.log(
    `Verified boundary map ${mapFile}: ${map.serial}, ${map.ranges.length} ranges, ${map.functions?.length ?? 0} functions, exeSha256=${exeSha256}`,
  );
}

function verifyRanges(map: BoundaryMap): BoundaryRange {
  const header = requiredRange(map, "psx_exe_header");
  assertEqual(header.kind, "header", "psx_exe_header.kind");
  assertEqual(header.fileStart, 0, "psx_exe_header.fileStart");
  assertEqual(header.fileEnd, 0x800, "psx_exe_header.fileEnd");
  assertEqual(header.size, 0x800, "psx_exe_header.size");

  const payload = requiredRange(map, "main_payload");
  assertEqual(payload.kind, "payload", "main_payload.kind");
  assertEqual(payload.fileStart, 0x800, "main_payload.fileStart");
  assertEqual(payload.fileEnd, map.exe.fileSize, "main_payload.fileEnd");
  assertEqual(payload.size, map.exe.payloadSize, "main_payload.size");
  assertEqual(payload.fileEnd - payload.fileStart, payload.size, "main_payload computed size");
  assertEqual(payload.ramStart, map.exe.loadAddress, "main_payload.ramStart");
  assertEqual(payload.ramEnd, map.exe.loadAddress + map.exe.payloadSize, "main_payload.ramEnd");

  assertEqual(header.fileEnd, payload.fileStart, "header/payload contiguity");
  if (map.exe.entrypoint < required(payload.ramStart, "main_payload.ramStart")) {
    throw new Error("map.exe.entrypoint is before main_payload RAM range");
  }
  if (map.exe.entrypoint >= required(payload.ramEnd, "main_payload.ramEnd")) {
    throw new Error("map.exe.entrypoint is after main_payload RAM range");
  }
  return payload;
}

function verifyFunctions(map: BoundaryMap, exe: Buffer, payload: BoundaryRange): void {
  const functions = map.functions ?? [];
  if (functions.length === 0) return;

  const sorted = [...functions].sort((left, right) => left.fileStart - right.fileStart);
  for (const boundary of sorted) {
    verifyFunctionBoundary(map, payload, boundary);
  }
  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1];
    const current = sorted[i];
    if (!previous || !current) throw new Error(`Missing function boundary at index ${i}`);
    if (previous.fileEnd > current.fileStart) {
      throw new Error(`Function boundary overlap: ${previous.name} overlaps ${current.name}`);
    }
  }

  const bootstrap = requiredFunction(map, "entrypoint_bootstrap");
  assertEqual(bootstrap.kind, "entrypoint_bootstrap", "entrypoint_bootstrap.kind");
  assertEqual(bootstrap.ramStart, map.exe.entrypoint, "entrypoint_bootstrap.ramStart");
  assertEqual(bootstrap.size, 160, "entrypoint_bootstrap.size");

  const firstFunction = requiredFunction(map, "runtime_init_once");
  assertEqual(firstFunction.kind, "function", "runtime_init_once.kind");
  assertEqual(firstFunction.ramStart, bootstrap.ramEnd, "runtime_init_once starts after bootstrap");
  assertEqual(firstFunction.size, 112, "runtime_init_once.size");
  assertReturnShape(exe, firstFunction);

  const runtimeInitAlways = requiredFunction(map, "runtime_init_always");
  assertEqual(runtimeInitAlways.kind, "function", "runtime_init_always.kind");
  assertEqual(
    runtimeInitAlways.ramStart,
    firstFunction.ramEnd,
    "runtime_init_always starts after runtime_init_once",
  );
  assertEqual(runtimeInitAlways.size, 104, "runtime_init_always.size");
  assertReturnShape(exe, runtimeInitAlways);

  const mainBoot = requiredFunction(map, "main_boot");
  assertEqual(mainBoot.kind, "function", "main_boot.kind");
  assertEqual(
    mainBoot.ramStart,
    runtimeInitAlways.ramEnd,
    "main_boot starts after runtime_init_always",
  );
  assertEqual(mainBoot.size, 388, "main_boot.size");
  assertReturnShape(exe, mainBoot, 0x27bd0018);

  const bootFrameCounters = requiredFunction(map, "boot_frame_counters");
  assertEqual(bootFrameCounters.kind, "function", "boot_frame_counters.kind");
  assertEqual(
    bootFrameCounters.ramStart,
    mainBoot.ramEnd,
    "boot_frame_counters starts after main_boot",
  );
  assertEqual(bootFrameCounters.size, 120, "boot_frame_counters.size");
  assertReturnShape(exe, bootFrameCounters, 0x27bd0018);

  const bootFrameStep = requiredFunction(map, "boot_frame_step");
  assertEqual(bootFrameStep.kind, "function", "boot_frame_step.kind");
  assertEqual(
    bootFrameStep.ramStart,
    bootFrameCounters.ramEnd,
    "boot_frame_step starts after boot_frame_counters",
  );
  assertEqual(bootFrameStep.size, 56, "boot_frame_step.size");
  assertReturnShape(exe, bootFrameStep, 0x27bd0018);

  const bootFrameRepeat = requiredFunction(map, "boot_frame_repeat");
  assertEqual(bootFrameRepeat.kind, "function", "boot_frame_repeat.kind");
  assertEqual(
    bootFrameRepeat.ramStart,
    bootFrameStep.ramEnd,
    "boot_frame_repeat starts after boot_frame_step",
  );
  assertEqual(bootFrameRepeat.size, 48, "boot_frame_repeat.size");
  assertReturnShape(exe, bootFrameRepeat, 0x27bd0018);

  const bootWaitDrawGate = requiredFunction(map, "boot_wait_draw_gate");
  assertEqual(bootWaitDrawGate.kind, "function", "boot_wait_draw_gate.kind");
  assertEqual(
    bootWaitDrawGate.ramStart,
    bootFrameRepeat.ramEnd,
    "boot_wait_draw_gate starts after boot_frame_repeat",
  );
  assertEqual(bootWaitDrawGate.size, 168, "boot_wait_draw_gate.size");
  assertReturnShape(exe, bootWaitDrawGate, 0x27bd0018);

  const bootStatusRenderer = requiredFunction(map, "boot_status_renderer");
  assertEqual(bootStatusRenderer.kind, "function", "boot_status_renderer.kind");
  assertEqual(
    bootStatusRenderer.ramStart,
    bootWaitDrawGate.ramEnd,
    "boot_status_renderer starts after boot_wait_draw_gate",
  );
  assertEqual(bootStatusRenderer.size, 528, "boot_status_renderer.size");
  assertReturnShape(exe, bootStatusRenderer, 0x27bd0028);

  const bootFrameDispatch = requiredFunction(map, "boot_frame_dispatch");
  assertEqual(bootFrameDispatch.kind, "function", "boot_frame_dispatch.kind");
  assertEqual(
    bootFrameDispatch.ramStart,
    bootStatusRenderer.ramEnd,
    "boot_frame_dispatch starts after boot_status_renderer",
  );
  assertEqual(bootFrameDispatch.size, 232, "boot_frame_dispatch.size");
  assertReturnShape(exe, bootFrameDispatch, 0x27bd0020);

  const bootStatusStateInit = requiredFunction(map, "boot_status_state_init");
  assertEqual(bootStatusStateInit.kind, "function", "boot_status_state_init.kind");
  assertEqual(
    bootStatusStateInit.ramStart,
    bootFrameDispatch.ramEnd,
    "boot_status_state_init starts after boot_frame_dispatch",
  );
  assertEqual(bootStatusStateInit.size, 524, "boot_status_state_init.size");
  assertReturnShape(exe, bootStatusStateInit, 0x27bd0030);

  const bootInputPositionLoop = requiredFunction(map, "boot_input_position_loop");
  assertEqual(bootInputPositionLoop.kind, "function", "boot_input_position_loop.kind");
  assertEqual(
    bootInputPositionLoop.ramStart,
    bootStatusStateInit.ramEnd,
    "boot_input_position_loop starts after boot_status_state_init",
  );
  assertEqual(bootInputPositionLoop.size, 340, "boot_input_position_loop.size");
  assertReturnShape(exe, bootInputPositionLoop, 0x27bd0018);

  const bootCallbackSlotsClear = requiredFunction(map, "boot_callback_slots_clear");
  assertEqual(bootCallbackSlotsClear.kind, "function", "boot_callback_slots_clear.kind");
  assertEqual(
    bootCallbackSlotsClear.ramStart,
    bootInputPositionLoop.ramEnd,
    "boot_callback_slots_clear starts after boot_input_position_loop",
  );
  assertEqual(bootCallbackSlotsClear.size, 44, "boot_callback_slots_clear.size");
  assertReturnShape(exe, bootCallbackSlotsClear);

  const bootApplyObjectOffset = requiredFunction(map, "boot_apply_object_offset");
  assertEqual(bootApplyObjectOffset.kind, "function", "boot_apply_object_offset.kind");
  assertEqual(
    bootApplyObjectOffset.ramStart,
    bootCallbackSlotsClear.ramEnd,
    "boot_apply_object_offset starts after boot_callback_slots_clear",
  );
  assertEqual(bootApplyObjectOffset.size, 76, "boot_apply_object_offset.size");
  assertReturnShape(exe, bootApplyObjectOffset, 0x27bd0018);

  const bootRotateStatusObjectA = requiredFunction(map, "boot_rotate_status_object_a");
  assertEqual(bootRotateStatusObjectA.kind, "function", "boot_rotate_status_object_a.kind");
  assertEqual(
    bootRotateStatusObjectA.ramStart,
    bootApplyObjectOffset.ramEnd,
    "boot_rotate_status_object_a starts after boot_apply_object_offset",
  );
  assertEqual(bootRotateStatusObjectA.size, 208, "boot_rotate_status_object_a.size");
  assertReturnShape(exe, bootRotateStatusObjectA, 0x27bd0028);

  const bootRotateStatusObjectB = requiredFunction(map, "boot_rotate_status_object_b");
  assertEqual(bootRotateStatusObjectB.kind, "function", "boot_rotate_status_object_b.kind");
  assertEqual(
    bootRotateStatusObjectB.ramStart,
    bootRotateStatusObjectA.ramEnd,
    "boot_rotate_status_object_b starts after boot_rotate_status_object_a",
  );
  assertEqual(bootRotateStatusObjectB.size, 216, "boot_rotate_status_object_b.size");
  assertReturnShape(exe, bootRotateStatusObjectB, 0x27bd0028);

  const bootFrameDrawHook = requiredFunction(map, "boot_frame_draw_hook");
  assertEqual(bootFrameDrawHook.kind, "function", "boot_frame_draw_hook.kind");
  assertEqual(
    bootFrameDrawHook.ramStart,
    bootRotateStatusObjectB.ramEnd,
    "boot_frame_draw_hook starts after boot_rotate_status_object_b",
  );
  assertEqual(bootFrameDrawHook.size, 16, "boot_frame_draw_hook.size");
  assertReturnShape(exe, bootFrameDrawHook);

  const bootGfxInit = requiredFunction(map, "boot_gfx_init");
  assertEqual(bootGfxInit.kind, "function", "boot_gfx_init.kind");
  assertEqual(
    bootGfxInit.ramStart,
    bootFrameDrawHook.ramEnd,
    "boot_gfx_init starts after boot_frame_draw_hook",
  );
  assertEqual(bootGfxInit.size, 256, "boot_gfx_init.size");
  assertReturnShape(exe, bootGfxInit, 0x27bd0028);

  let previousBootGfxHelper = bootGfxInit;
  for (const expected of [
    { name: "boot_frame_wait_loop", size: 180, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_state_reset", size: 92, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_asset_load", size: 76, delaySlot: 0x27bd0038 },
    { name: "boot_gfx_coords_init", size: 88, delaySlot: 0xac820024 },
    { name: "boot_gfx_object_init", size: 252, delaySlot: 0x27bd0028 },
    { name: "boot_gfx_static_object_setup", size: 112, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_stream_object_setup", size: 100, delaySlot: 0xac430024 },
    { name: "boot_gfx_callback_object_setup", size: 192, delaySlot: 0x27bd0028 },
    { name: "boot_gfx_stream_step", size: 1144, delaySlot: 0x27bd0020 },
    { name: "boot_gfx_callback_fade_overlay", size: 148, delaySlot: 0x27bd0020 },
    { name: "boot_gfx_callback_loading_image", size: 116, delaySlot: 0x27bd0020 },
    { name: "boot_gfx_callback_flag_ready", size: 120, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_callback_mark_done", size: 116, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_callback_mode_done", size: 116, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_callback_enable_stage", size: 136, delaySlot: 0x27bd0020 },
    { name: "boot_gfx_callback_store_asset_size", size: 76, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_state_commit", size: 220, delaySlot: 0 },
    { name: "boot_gfx_dma_pump", size: 164, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_driver_step", size: 1280, delaySlot: 0x27bd0020 },
    { name: "boot_gfx_frame_service", size: 212, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_object_mode_apply", size: 272, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_object_submit", size: 476, delaySlot: 0x27bd0040 },
    { name: "boot_gfx_primary_object_submit", size: 208, delaySlot: 0x27bd0038 },
    { name: "boot_gfx_secondary_object_submit", size: 184, delaySlot: 0x27bd0038 },
    { name: "boot_gfx_dma_idle_guard", size: 108, delaySlot: 0x27bd0018 },
    { name: "boot_gfx_dma_mode_reset", size: 40, delaySlot: 0 },
    { name: "boot_gfx_dma_flush", size: 64, delaySlot: 0x27bd0018 },
  ]) {
    const helper = requiredFunction(map, expected.name);
    assertEqual(helper.kind, "function", `${expected.name}.kind`);
    assertEqual(
      helper.ramStart,
      previousBootGfxHelper.ramEnd,
      `${expected.name} starts after ${previousBootGfxHelper.name}`,
    );
    assertEqual(helper.size, expected.size, `${expected.name}.size`);
    assertReturnShape(exe, helper, expected.delaySlot);
    previousBootGfxHelper = helper;
  }

  let previousBootFadeHelper = previousBootGfxHelper;
  for (const expected of [
    { name: "boot_fade_object_spawn", size: 196, delaySlot: 0x27bd0038 },
    { name: "boot_fade_callback_tick", size: 116, delaySlot: 0x27bd0018 },
    { name: "boot_fade_state_reset", size: 40, delaySlot: 0 },
    { name: "boot_fade_ramp_step", size: 312, delaySlot: 0 },
    { name: "boot_fade_state_step", size: 468, delaySlot: 0x27bd0020 },
    { name: "boot_fade_render", size: 468, delaySlot: 0x27bd0028 },
    { name: "boot_fade_palette_fill", size: 36, delaySlot: 0 },
    { name: "boot_fade_out_reset", size: 80, delaySlot: 0x27bd0018 },
    { name: "boot_fade_out_apply_defaults", size: 84, delaySlot: 0 },
    { name: "boot_fade_out_prepare", size: 92, delaySlot: 0x27bd0018 },
    { name: "boot_fade_out_start", size: 64, delaySlot: 0x27bd0018 },
    { name: "boot_fade_out_start_from_color", size: 84, delaySlot: 0x27bd0018 },
    { name: "boot_fade_in_apply_defaults", size: 72, delaySlot: 0 },
    { name: "boot_fade_in_prepare", size: 76, delaySlot: 0x27bd0018 },
    { name: "boot_fade_in_start", size: 64, delaySlot: 0x27bd0018 },
    { name: "boot_fade_in_start_from_color", size: 84, delaySlot: 0x27bd0018 },
    { name: "boot_fade_wait", size: 64, delaySlot: 0x27bd0018 },
    { name: "boot_fade_out_and_wait", size: 40, delaySlot: 0x27bd0018 },
    { name: "boot_fade_out_flagged_and_wait", size: 40, delaySlot: 0x27bd0018 },
    { name: "boot_fade_out_color_and_wait", size: 40, delaySlot: 0x27bd0018 },
    { name: "boot_fade_out_hold_and_wait", size: 68, delaySlot: 0x27bd0018 },
    { name: "boot_fade_out_hold_flagged_and_wait", size: 68, delaySlot: 0x27bd0018 },
    { name: "boot_fade_in_and_wait", size: 40, delaySlot: 0x27bd0018 },
    { name: "boot_fade_in_flagged_and_wait", size: 40, delaySlot: 0x27bd0018 },
    { name: "boot_fade_in_color_and_wait", size: 40, delaySlot: 0x27bd0018 },
    { name: "boot_fade_in_hold_and_wait", size: 68, delaySlot: 0x27bd0018 },
    { name: "boot_fade_in_hold_flagged_and_wait", size: 68, delaySlot: 0x27bd0018 },
    { name: "boot_fade_set_target_and_flags", size: 24, delaySlot: 0xa0450006 },
    { name: "boot_fade_set_level", size: 28, delaySlot: 0xa0430006 },
    { name: "boot_fade_out_start_no_wait", size: 60, delaySlot: 0x27bd0018 },
    { name: "boot_fade_out_hold_no_wait", size: 60, delaySlot: 0x27bd0018 },
    { name: "boot_fade_in_start_no_wait", size: 60, delaySlot: 0x27bd0018 },
    { name: "boot_fade_in_hold_no_wait", size: 60, delaySlot: 0x27bd0018 },
    { name: "boot_fade_mark_visible", size: 16, delaySlot: 0 },
    { name: "boot_fade_mark_hidden", size: 12, delaySlot: 0 },
  ]) {
    const helper = requiredFunction(map, expected.name);
    assertEqual(helper.kind, "function", `${expected.name}.kind`);
    assertEqual(
      helper.ramStart,
      previousBootFadeHelper.ramEnd,
      `${expected.name} starts after ${previousBootFadeHelper.name}`,
    );
    assertEqual(helper.size, expected.size, `${expected.name}.size`);
    assertReturnShape(exe, helper, expected.delaySlot);
    previousBootFadeHelper = helper;
  }

  let previousBootGteHelper = previousBootFadeHelper;
  for (const expected of [
    { name: "boot_gte_project_object_origin", size: 160, delaySlot: 0x27bd0018 },
    { name: "boot_gte_project_object_from_slot", size: 68, delaySlot: 0x27bd0018 },
    { name: "boot_gte_project_object_screen_pos", size: 248, delaySlot: 0x27bd0020 },
    { name: "boot_gte_submit_object_quad", size: 1544, delaySlot: 0x27bd0048 },
    { name: "boot_gte_scene_object_loop", size: 636, delaySlot: 0x27bd0028 },
    { name: "boot_gte_set_depth_side_flag", size: 12, delaySlot: 0xa0850069 },
  ]) {
    const helper = requiredFunction(map, expected.name);
    assertEqual(helper.kind, "function", `${expected.name}.kind`);
    assertEqual(
      helper.ramStart,
      previousBootGteHelper.ramEnd,
      `${expected.name} starts after ${previousBootGteHelper.name}`,
    );
    assertEqual(helper.size, expected.size, `${expected.name}.size`);
    assertReturnShape(exe, helper, expected.delaySlot);
    previousBootGteHelper = helper;
  }

  let previousBootObjectRenderHelper = previousBootGteHelper;
  for (const expected of [
    { name: "boot_object_quad_emit", size: 1408, delaySlot: 0x27bd0058 },
    { name: "boot_object_quad_emit_from_object", size: 40, delaySlot: 0x27bd0018 },
    { name: "boot_object_glyph_strip_emit", size: 176, delaySlot: 0x27bd0030 },
    { name: "boot_object_ease_height", size: 148, delaySlot: 0 },
    { name: "boot_object_shadow_emit", size: 412, delaySlot: 0x27bd0028 },
    { name: "boot_object_flags_visible", size: 40, delaySlot: 0 },
    { name: "boot_object_lookup_visibility_height", size: 148, delaySlot: 0x00001021 },
    { name: "boot_object_metric_pack", size: 104, delaySlot: 0x00451025 },
    { name: "boot_scene_object_system_init", size: 120, delaySlot: 0x27bd0018 },
    { name: "boot_scene_object_configure", size: 948, delaySlot: 0x27bd0020 },
  ]) {
    const helper = requiredFunction(map, expected.name);
    assertEqual(helper.kind, "function", `${expected.name}.kind`);
    assertEqual(
      helper.ramStart,
      previousBootObjectRenderHelper.ramEnd,
      `${expected.name} starts after ${previousBootObjectRenderHelper.name}`,
    );
    assertEqual(helper.size, expected.size, `${expected.name}.size`);
    assertReturnShape(exe, helper, expected.delaySlot);
    previousBootObjectRenderHelper = helper;
  }

  let previousBootSceneAnimationHelper = previousBootObjectRenderHelper;
  for (const expected of [
    { name: "boot_scene_stream_load", size: 68, delaySlot: 0x27bd0018 },
    { name: "boot_scene_anim_state_init", size: 304, delaySlot: 0x27bd0008 },
    { name: "boot_scene_object_slots_clear", size: 56, delaySlot: 0 },
    { name: "boot_scene_actor_slots_clear", size: 132, delaySlot: 0xa0400083 },
    { name: "boot_scene_model_slots_clear", size: 56, delaySlot: 0 },
    { name: "boot_scene_project_points", size: 248, delaySlot: 0x27bd0020 },
    { name: "boot_scene_camera_reset", size: 208, delaySlot: 0x27bd0028 },
    { name: "boot_scene_intro_object_submit", size: 104, delaySlot: 0x27bd0028 },
    { name: "boot_scene_bootstrap", size: 960, delaySlot: 0x27bd0030 },
  ]) {
    const helper = requiredFunction(map, expected.name);
    assertEqual(helper.kind, "function", `${expected.name}.kind`);
    assertEqual(
      helper.ramStart,
      previousBootSceneAnimationHelper.ramEnd,
      `${expected.name} starts after ${previousBootSceneAnimationHelper.name}`,
    );
    assertEqual(helper.size, expected.size, `${expected.name}.size`);
    assertReturnShape(exe, helper, expected.delaySlot);
    previousBootSceneAnimationHelper = helper;
  }

  let previousBootObjectRuntimeHelper = previousBootSceneAnimationHelper;
  for (const expected of [
    { name: "boot_runtime_object_frame_limit", size: 136, delaySlot: 0 },
    { name: "boot_runtime_object_visual_flags", size: 200, delaySlot: 0 },
    { name: "boot_runtime_object_alloc_from_scene_slot", size: 256, delaySlot: 0x27bd0028 },
    { name: "boot_runtime_object_alloc_with_flag", size: 124, delaySlot: 0x27bd0018 },
    { name: "boot_runtime_object_visual_refresh", size: 208, delaySlot: 0x27bd0020 },
    { name: "boot_runtime_marker_object_spawn", size: 156, delaySlot: 0x27bd0030 },
    { name: "boot_runtime_object_status_kind", size: 112, delaySlot: 0x00a01021 },
    { name: "boot_runtime_scene_active_objects_step", size: 940, delaySlot: 0x27bd0028 },
    { name: "boot_runtime_scene_phase_step_a", size: 900, delaySlot: 0x27bd0028 },
    { name: "boot_runtime_scene_phase_step_b", size: 680, delaySlot: 0x27bd0038 },
    { name: "boot_runtime_object_vertical_step", size: 196, delaySlot: 0x27bd0018 },
    { name: "boot_runtime_hand_slot_filter", size: 188, delaySlot: 0x27bd0010 },
  ]) {
    const helper = requiredFunction(map, expected.name);
    assertEqual(helper.kind, "function", `${expected.name}.kind`);
    assertEqual(
      helper.ramStart,
      previousBootObjectRuntimeHelper.ramEnd,
      `${expected.name} starts after ${previousBootObjectRuntimeHelper.name}`,
    );
    assertEqual(helper.size, expected.size, `${expected.name}.size`);
    assertReturnShape(exe, helper, expected.delaySlot);
    previousBootObjectRuntimeHelper = helper;
  }

  let previousBootSceneRuntimeHelper = previousBootObjectRuntimeHelper;
  for (const expected of [
    { name: "boot_runtime_scene_phase_step_c", size: 568, delaySlot: 0x27bd0020 },
    { name: "boot_runtime_scene_phase_step_d", size: 1120, delaySlot: 0x27bd0018 },
  ]) {
    const helper = requiredFunction(map, expected.name);
    assertEqual(helper.kind, "function", `${expected.name}.kind`);
    assertEqual(
      helper.ramStart,
      previousBootSceneRuntimeHelper.ramEnd,
      `${expected.name} starts after ${previousBootSceneRuntimeHelper.name}`,
    );
    assertEqual(helper.size, expected.size, `${expected.name}.size`);
    assertReturnShape(exe, helper, expected.delaySlot);
    previousBootSceneRuntimeHelper = helper;
  }

  let previousBootSceneWaitHelper = previousBootSceneRuntimeHelper;
  for (const expected of [
    { name: "boot_scene_wait_vram_prepare", size: 280, delaySlot: 0x27bd0020 },
    { name: "boot_scene_wait_marker_spawn", size: 164, delaySlot: 0x27bd0038 },
    { name: "boot_scene_wait_phase_step", size: 1024, delaySlot: 0x27bd0028 },
    { name: "boot_scene_pair_table_lookup", size: 88, delaySlot: 0x00a01021 },
    { name: "boot_scene_range_table_lookup", size: 204, delaySlot: 0x00431025 },
    { name: "boot_runtime_object_alpha_tick", size: 116, delaySlot: 0 },
    { name: "boot_runtime_object_alpha_start", size: 48, delaySlot: 0xa4830008 },
    { name: "boot_runtime_object_alpha_step", size: 248, delaySlot: 0x27bd0018 },
    { name: "boot_scene_wait_optional_sound", size: 80, delaySlot: 0x27bd0018 },
    { name: "boot_scene_duel_runtime_phase_a", size: 5044, delaySlot: 0x27bd0030 },
    { name: "boot_scene_gte_project_wait_object", size: 164, delaySlot: 0x27bd0020 },
    { name: "boot_scene_duel_runtime_phase_b", size: 1552, delaySlot: 0x27bd0030 },
    { name: "boot_scene_slot_position_apply", size: 44, delaySlot: 0xa4620032 },
    { name: "boot_scene_slot_marker_spawn", size: 268, delaySlot: 0x27bd0038 },
    { name: "boot_scene_slot_color_clear", size: 128, delaySlot: 0 },
    { name: "boot_scene_slot_cleanup_step", size: 440, delaySlot: 0 },
    { name: "boot_scene_slot_object_emit", size: 600, delaySlot: 0x27bd0048 },
    { name: "boot_scene_slot_flag_check", size: 64, delaySlot: 0x00001021 },
    { name: "boot_scene_duel_runtime_phase_c", size: 5304, delaySlot: 0x27bd0040 },
    { name: "boot_scene_object_exit_step", size: 260, delaySlot: 0x27bd0018 },
    { name: "boot_scene_object_rgb_step", size: 128, delaySlot: 0 },
    { name: "boot_scene_object_ease_step", size: 340, delaySlot: 0x27bd0018 },
    { name: "boot_scene_aux_object_spawn", size: 156, delaySlot: 0x27bd0028 },
    { name: "boot_scene_grid_compare_step", size: 188, delaySlot: 0x27bd0018 },
    { name: "boot_scene_duel_runtime_phase_d", size: 5632, delaySlot: 0x27bd0040 },
    { name: "boot_scene_object_ease_y_step", size: 176, delaySlot: 0x27bd0018 },
    { name: "boot_scene_object_ease_z_step", size: 292, delaySlot: 0x27bd0018 },
    { name: "boot_scene_card_match_score", size: 216, delaySlot: 0x27bd0018 },
    { name: "boot_scene_card_attack_score", size: 92, delaySlot: 0x27bd0020 },
    { name: "boot_scene_card_defense_score", size: 92, delaySlot: 0x27bd0020 },
    { name: "boot_scene_card_compare_score", size: 252, delaySlot: 0x27bd0020 },
    { name: "boot_scene_target_card_select", size: 660, delaySlot: 0x27bd0018 },
    { name: "boot_scene_reward_panel_step", size: 504, delaySlot: 0x27bd0020 },
    { name: "boot_scene_duel_runtime_phase_e", size: 4984, delaySlot: 0x27bd0030 },
  ]) {
    const helper = requiredFunction(map, expected.name);
    assertEqual(helper.kind, "function", `${expected.name}.kind`);
    assertEqual(
      helper.ramStart,
      previousBootSceneWaitHelper.ramEnd,
      `${expected.name} starts after ${previousBootSceneWaitHelper.name}`,
    );
    assertEqual(helper.size, expected.size, `${expected.name}.size`);
    assertReturnShape(exe, helper, expected.delaySlot);
    previousBootSceneWaitHelper = helper;
  }

  let previousBootSceneLateRuntimeHelper = previousBootSceneWaitHelper;
  for (const expected of [
    { name: "boot_scene_late_runtime_phase_a", size: 180, delaySlot: 0x27bd0020 },
    { name: "boot_scene_late_runtime_phase_b", size: 604, delaySlot: 0x27bd0038 },
    { name: "boot_scene_late_runtime_phase_c", size: 360, delaySlot: 0x27bd0020 },
    { name: "boot_scene_late_runtime_phase_d", size: 412, delaySlot: 0x27bd0038 },
    { name: "boot_scene_late_runtime_object_flag_step", size: 100, delaySlot: 0x27bd0018 },
    { name: "boot_scene_late_runtime_phase_e", size: 1332, delaySlot: 0x27bd0048 },
    { name: "boot_scene_late_runtime_card_setup", size: 216, delaySlot: 0x27bd0020 },
    { name: "boot_scene_late_runtime_value_clear", size: 64, delaySlot: 0 },
    { name: "boot_scene_late_runtime_phase_f", size: 632, delaySlot: 0x27bd0030 },
    { name: "boot_scene_late_runtime_input_gate", size: 132, delaySlot: 0x27bd0018 },
    { name: "boot_scene_late_runtime_store_pair", size: 92, delaySlot: 0xa4e40000 },
    { name: "boot_scene_late_runtime_phase_g", size: 1992, delaySlot: 0x27bd0040 },
    { name: "boot_scene_late_runtime_phase_h", size: 572, delaySlot: 0x27bd0018 },
    { name: "boot_scene_late_runtime_phase_i", size: 804, delaySlot: 0x27bd0018 },
    { name: "boot_scene_late_runtime_sound_flag", size: 92, delaySlot: 0x27bd0018 },
    { name: "boot_scene_late_runtime_phase_j", size: 896, delaySlot: 0x27bd0020 },
    { name: "boot_scene_late_runtime_phase_k", size: 928, delaySlot: 0x27bd0020 },
    { name: "boot_scene_late_runtime_window_anim_step", size: 344, delaySlot: 0 },
    { name: "boot_scene_late_runtime_phase_l", size: 172, delaySlot: 0x27bd0018 },
    { name: "boot_scene_late_runtime_value_pack", size: 88, delaySlot: 0 },
    { name: "boot_scene_late_runtime_phase_m", size: 160, delaySlot: 0x27bd0028 },
    { name: "boot_scene_late_runtime_actor_sound", size: 180, delaySlot: 0x27bd0018 },
    { name: "boot_scene_late_runtime_phase_n", size: 840, delaySlot: 0x27bd0030 },
    { name: "boot_scene_late_runtime_phase_o", size: 88, delaySlot: 0x27bd0018 },
    { name: "boot_scene_late_runtime_phase_p", size: 220, delaySlot: 0x27bd0028 },
    { name: "boot_scene_late_runtime_phase_q", size: 1864, delaySlot: 0x27bd0038 },
    { name: "boot_scene_late_runtime_phase_r", size: 692, delaySlot: 0x27bd0030 },
  ]) {
    const helper = requiredFunction(map, expected.name);
    assertEqual(helper.kind, "function", `${expected.name}.kind`);
    assertEqual(
      helper.ramStart,
      previousBootSceneLateRuntimeHelper.ramEnd,
      `${expected.name} starts after ${previousBootSceneLateRuntimeHelper.name}`,
    );
    assertEqual(helper.size, expected.size, `${expected.name}.size`);
    assertReturnShape(exe, helper, expected.delaySlot);
    previousBootSceneLateRuntimeHelper = helper;
  }
}

function verifyFunctionBoundary(
  map: BoundaryMap,
  payload: BoundaryRange,
  boundary: FunctionBoundary,
): void {
  assertEqual(boundary.fileEnd - boundary.fileStart, boundary.size, `${boundary.name}.file size`);
  assertEqual(boundary.ramEnd - boundary.ramStart, boundary.size, `${boundary.name}.RAM size`);
  assertEqual(
    boundary.fileStart,
    0x800 + (boundary.ramStart - map.exe.loadAddress),
    `${boundary.name}.fileStart vs RAM`,
  );
  if (boundary.fileStart % 4 !== 0 || boundary.fileEnd % 4 !== 0) {
    throw new Error(`${boundary.name} file range is not word-aligned`);
  }
  if (boundary.ramStart % 4 !== 0 || boundary.ramEnd % 4 !== 0) {
    throw new Error(`${boundary.name} RAM range is not word-aligned`);
  }
  if (boundary.fileStart < payload.fileStart || boundary.fileEnd > payload.fileEnd) {
    throw new Error(`${boundary.name} is outside main_payload`);
  }
  if (
    boundary.ramStart < required(payload.ramStart, "main_payload.ramStart") ||
    boundary.ramEnd > required(payload.ramEnd, "main_payload.ramEnd")
  ) {
    throw new Error(`${boundary.name} RAM range is outside main_payload`);
  }
  if (boundary.boundaryEvidence.trim() === "") {
    throw new Error(`${boundary.name}.boundaryEvidence is empty`);
  }
}

function assertReturnShape(exe: Buffer, boundary: FunctionBoundary, expectedDelaySlot = 0): void {
  const returnWordOffset = boundary.fileEnd - 8;
  const delaySlotOffset = boundary.fileEnd - 4;
  assertEqual(exe.readUInt32LE(returnWordOffset), 0x03e00008, `${boundary.name}.return jr ra`);
  assertEqual(
    exe.readUInt32LE(delaySlotOffset),
    expectedDelaySlot,
    `${boundary.name}.return delay slot`,
  );
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function required<T>(value: T | null | undefined, label: string): T {
  if (value == null) throw new Error(`Missing ${label}`);
  return value;
}

function requiredRange(map: BoundaryMap, name: string): BoundaryRange {
  const range = map.ranges.find((candidate) => candidate.name === name);
  if (!range) throw new Error(`Missing range ${name}`);
  return range;
}

function requiredFunction(map: BoundaryMap, name: string): FunctionBoundary {
  const boundary = map.functions?.find((candidate) => candidate.name === name);
  if (!boundary) throw new Error(`Missing function boundary ${name}`);
  return boundary;
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function sha256(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}
