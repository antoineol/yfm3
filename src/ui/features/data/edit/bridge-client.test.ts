import { afterEach, describe, expect, test, vi } from "vitest";
import {
  fetchPalFrWordingStatus,
  getCachedPalFrWordingStatus,
  invalidatePalFrWordingStatusCache,
  type PalFrWordingStatus,
} from "./bridge-client.ts";

afterEach(() => {
  invalidatePalFrWordingStatusCache();
  vi.unstubAllGlobals();
});

describe("PAL FR wording status cache", () => {
  test("returns cached status for the same active disc key", async () => {
    const status = supportedStatus("PAL-FR.bin");
    const fetchMock = vi.fn(async () => jsonResponse(status));
    vi.stubGlobal("fetch", fetchMock);

    const first = await fetchPalFrWordingStatus({ cacheKey: "disc-a" });
    const second = await fetchPalFrWordingStatus({ cacheKey: "disc-a" });

    expect(first).toStrictEqual(status);
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getCachedPalFrWordingStatus("disc-a")).toBe(first);
  });

  test("dedupes concurrent loads for the same active disc key", async () => {
    const status = supportedStatus("PAL-FR.bin");
    let resolveFetch!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const first = fetchPalFrWordingStatus({ cacheKey: "disc-a" });
    const second = fetchPalFrWordingStatus({ cacheKey: "disc-a" });
    resolveFetch(jsonResponse(status));

    const firstStatus = await first;
    const secondStatus = await second;

    expect(firstStatus).toStrictEqual(status);
    expect(secondStatus).toBe(firstStatus);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("refetches after invalidation", async () => {
    const first = supportedStatus("PAL-FR-a.bin");
    const second = supportedStatus("PAL-FR-b.bin");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(first))
      .mockResolvedValueOnce(jsonResponse(second));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPalFrWordingStatus({ cacheKey: "disc-a" });
    invalidatePalFrWordingStatusCache("disc-a");

    const next = await fetchPalFrWordingStatus({ cacheKey: "disc-a" });

    expect(next).toStrictEqual(second);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getCachedPalFrWordingStatus("disc-a")).toBe(next);
  });

  test("does not cache an in-flight response after invalidation", async () => {
    const status = supportedStatus("PAL-FR.bin");
    let resolveFetch!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const pending = fetchPalFrWordingStatus({ cacheKey: "disc-a" });
    invalidatePalFrWordingStatusCache("disc-a");
    resolveFetch(jsonResponse(status));

    await expect(pending).resolves.toStrictEqual(status);
    expect(getCachedPalFrWordingStatus("disc-a")).toBeNull();
  });
});

function supportedStatus(discFilename: string): PalFrWordingStatus {
  return {
    supported: true,
    gameSerial: "SLES_039.48",
    discFilename,
    glyphRenderingPatch: { applied: true, changed: false, targets: [] },
    entries: [],
  };
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}
