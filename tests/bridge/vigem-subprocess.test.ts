import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVigemSubprocess } from "../../bridge/vigem-subprocess.ts";

// ── Mock child process ──────────────────────────────────────────

class MockStdin {
  written: string[] = [];
  writable = true;
  write(data: string): boolean {
    this.written.push(data);
    return true;
  }
  end(): void {
    this.writable = false;
  }
}

class MockReadable extends EventEmitter {}

class MockChildProcess extends EventEmitter {
  stdin = new MockStdin();
  stdout = new MockReadable();
  stderr = new MockReadable();
  exitCode: number | null = null;
  killed = false;

  kill(): void {
    this.killed = true;
    this.exitCode = 1;
    this.emit("exit", 1);
  }

  /** Test helper: simulate "ok\n" on stdout. */
  _ok(): void {
    this.stdout.emit("data", Buffer.from("ok\n"));
  }

  /** Test helper: simulate process exit. */
  _exit(code: number): void {
    this.exitCode = code;
    this.emit("exit", code);
  }
}

let mockProc: MockChildProcess;

// biome-ignore lint/suspicious/noExplicitAny: test mock
const mockSpawn = vi.fn((): any => {
  mockProc = new MockChildProcess();
  return mockProc;
});

// ── Tests ───────────────────────────────────────────────────────

const NO_DELAY = { detectionDelayMs: 0, spawnFn: mockSpawn };

describe("createVigemSubprocess", () => {
  let sub: ReturnType<typeof createVigemSubprocess>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    sub = createVigemSubprocess(NO_DELAY);
  });

  afterEach(() => {
    sub.destroy();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("is not alive before any command", () => {
    expect(sub.alive).toBe(false);
  });

  it("spawns on first tap and resolves on ok", async () => {
    const p = sub.tap("cross");
    expect(sub.alive).toBe(true);
    expect(mockProc.stdin.written).toContain("tap cross\n");

    mockProc._ok();
    await p;
  });

  it("sends tap with holdMs", async () => {
    const p = sub.tap("up", 200);
    mockProc._ok();
    await p;

    expect(mockProc.stdin.written).toContain("tap up 200\n");
  });

  it("sends press command", async () => {
    const p = sub.press("circle");
    mockProc._ok();
    await p;

    expect(mockProc.stdin.written).toContain("press circle\n");
  });

  it("sends release command", async () => {
    const p = sub.release("square");
    mockProc._ok();
    await p;

    expect(mockProc.stdin.written).toContain("release square\n");
  });

  it("sends releaseAll command", async () => {
    const p = sub.releaseAll();
    mockProc._ok();
    await p;

    expect(mockProc.stdin.written).toContain("releaseall\n");
  });

  it("rejects when process exits before ok", async () => {
    const p = sub.tap("cross");
    mockProc._exit(1);

    await expect(p).rejects.toThrow("exited with code 1");
    expect(sub.alive).toBe(false);
  });

  it("rejects on command timeout", async () => {
    const p = sub.tap("cross");
    vi.advanceTimersByTime(6_000);

    await expect(p).rejects.toThrow("timed out");
  });

  it("re-spawns after process death", async () => {
    const p1 = sub.tap("cross");
    const firstProc = mockProc;
    mockProc._ok();
    await p1;

    firstProc._exit(0);
    expect(sub.alive).toBe(false);

    const p2 = sub.tap("circle");
    expect(sub.alive).toBe(true);
    expect(mockProc).not.toBe(firstProc);

    mockProc._ok();
    await p2;
  });

  it("destroy sends quit and ends stdin", () => {
    void sub.tap("cross").catch(() => {});
    const p = mockProc;

    sub.destroy();
    expect(p.stdin.written).toContain("quit\n");
  });

  it("handles multiple sequential commands", async () => {
    const p1 = sub.tap("cross");
    mockProc._ok();
    await p1;

    const p2 = sub.tap("up");
    mockProc._ok();
    await p2;

    const p3 = sub.press("circle");
    mockProc._ok();
    await p3;

    expect(mockProc.stdin.written).toEqual(["tap cross\n", "tap up\n", "press circle\n"]);
  });
});

describe("createVigemSubprocess detection delay", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("delays first command on fresh spawn", async () => {
    vi.useRealTimers();
    const sub = createVigemSubprocess({ detectionDelayMs: 50, spawnFn: mockSpawn });

    const start = Date.now();
    const p = sub.tap("cross");

    await new Promise((r) => setTimeout(r, 10));
    expect(mockProc.stdin.written).toHaveLength(0);

    await new Promise((r) => setTimeout(r, 60));
    expect(mockProc.stdin.written).toContain("tap cross\n");
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);

    mockProc._ok();
    await p;
    sub.destroy();
  });
});
