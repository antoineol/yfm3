# Dev-mode lock probe: Rust helper plan

## Why this exists

`bridge/iso-lock-probe.ts` currently has two transports:

- **Windows native** — direct FFI to `kernel32!CreateFileW(dwShareMode=0)`. Sub-millisecond per probe.
- **WSL** — shells out to `powershell.exe` and calls `[System.IO.File]::Open(path, 'Open', 'Read', 'None')`. ~400–600 ms per probe (cold ~550 ms, warm ~400 ms after Windows DLL cache primes).

The PowerShell path works, has identical Win32 lock semantics to the FFI (`FileShare.None` ↔ `dwShareMode=0`), and degrades safely. But its cold-start cost is dominated by .NET runtime spin-up — unavoidable from PowerShell. This plan covers replacing it with a tiny native helper to bring dev-mode probe latency in line with the production FFI (~15–30 ms).

Promote this from a "nice-to-have" to "do it" only if PowerShell latency actually annoys you in practice. The current architecture in `iso-lock-probe.ts` is already a per-platform dispatcher, so the swap is a single-file change.

## Goal

A WSL bridge run (`bun run bridge/serve.ts`) probes ISO locks in **≤30 ms** instead of ~500 ms, with **byte-identical semantics** to the production FFI probe.

## Approach

Compile a tiny Windows binary (`probe-locks.exe`, target ~500 KB statically linked) that:

1. Reads JSON from stdin: `{ "paths": ["C:\\path\\one.iso", "C:\\path\\two.iso"] }`.
2. For each path, calls `CreateFileW(GENERIC_READ, dwShareMode=0, OPEN_EXISTING)`. Same syscall, same flags as `bridge/iso-lock-probe.ts:probeViaFfi`.
3. Closes successful handles. Treats `ERROR_SHARING_VIOLATION` (32) as locked. Ignores other errors (missing files, permission denied, etc.).
4. Writes JSON to stdout: `{ "lockedIndices": [0, 2] }` — same index-based round-trip as the PowerShell script, so non-ASCII paths can't be mangled by console code pages.
5. Exits.

Cold-start budget: process spawn + ntdll/kernel32 implicit load + N × `CreateFileW`. Empirically ~15–30 ms total on Windows 10/11.

## Implementation outline

### Helper source: `bridge/tools/probe-locks/`

```
bridge/tools/probe-locks/
├── Cargo.toml
├── src/
│   └── main.rs              # ~80 LoC
└── README.md                # build instructions
```

`Cargo.toml` (sketch):

```toml
[package]
name = "probe-locks"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
windows-sys = { version = "0.59", features = [
    "Win32_Foundation",
    "Win32_Storage_FileSystem",
    "Win32_System_IO",
] }

[profile.release]
opt-level = "z"
lto = true
codegen-units = 1
strip = true
panic = "abort"
```

`src/main.rs` (sketch — illustrative, not final):

```rust
use serde::{Deserialize, Serialize};
use std::io::{Read, Write};
use windows_sys::Win32::Foundation::{CloseHandle, GetLastError, ERROR_SHARING_VIOLATION, INVALID_HANDLE_VALUE};
use windows_sys::Win32::Storage::FileSystem::{CreateFileW, FILE_ATTRIBUTE_NORMAL, GENERIC_READ, OPEN_EXISTING};

#[derive(Deserialize)]
struct Input { paths: Vec<String> }

#[derive(Serialize)]
struct Output { lockedIndices: Vec<usize> }

fn main() {
    let mut buf = String::new();
    std::io::stdin().read_to_string(&mut buf).unwrap();
    let input: Input = serde_json::from_str(&buf).unwrap();

    let mut locked = Vec::new();
    for (i, path) in input.paths.iter().enumerate() {
        let wide: Vec<u16> = path.encode_utf16().chain(std::iter::once(0)).collect();
        unsafe {
            let h = CreateFileW(
                wide.as_ptr(),
                GENERIC_READ,
                0,                 // dwShareMode = 0 → FileShare.None
                std::ptr::null(),
                OPEN_EXISTING,
                FILE_ATTRIBUTE_NORMAL,
                std::ptr::null_mut(),
            );
            if h == INVALID_HANDLE_VALUE {
                if GetLastError() == ERROR_SHARING_VIOLATION { locked.push(i); }
            } else {
                CloseHandle(h);
            }
        }
    }

    let out = serde_json::to_string(&Output { lockedIndices: locked }).unwrap();
    std::io::stdout().write_all(out.as_bytes()).unwrap();
}
```

### Build flow

Cross-compile from WSL — no Windows toolchain needed:

```bash
# one-time setup
sudo apt install -y mingw-w64
rustup target add x86_64-pc-windows-gnu

# build
cd bridge/tools/probe-locks
cargo build --release --target x86_64-pc-windows-gnu
# → bridge/tools/probe-locks/target/x86_64-pc-windows-gnu/release/probe-locks.exe
```

Either commit the built `.exe` (so contributors don't need Rust) or add a `bun run build:probe-locks` script and let CI build it. Recommend committing the binary — it's tiny and we already commit `bridge.exe` artifacts.

Final installed location: `bridge/tools/probe-locks.exe` (move/rename after build).

### Wiring in `iso-lock-probe.ts`

Replace the body of `probeViaPowershell` with `probeViaNativeHelper`. The dispatch in `probeLockedIsos`, the `IS_WSL` detection, the path translation (`toWindowsPath`), and `parseLockedIndices` all stay — only the transport changes.

```ts
async function probeViaNativeHelper(paths: readonly string[]): Promise<Set<string>> {
  const locked = new Set<string>();
  if (helperDisabled) return locked;
  const helperWin = toWindowsPath(resolveHelperPath()); // e.g. /home/.../bridge/tools/probe-locks.exe
  const winPaths = paths.map(toWindowsPath);
  try {
    const child = execFile("cmd.exe", ["/c", helperWin], { timeout: 2000, encoding: "utf-8" });
    child.stdin?.write(JSON.stringify({ paths: winPaths }));
    child.stdin?.end();
    const stdout = await collectStdout(child);
    const parsed = JSON.parse(stdout) as { lockedIndices: number[] };
    for (const i of parsed.lockedIndices) {
      const orig = paths[i];
      if (orig !== undefined) locked.add(orig);
    }
  } catch (err) {
    helperDisabled = true;
    console.warn(`iso-lock-probe: native helper failed (${err}) — lock probe disabled`);
  }
  return locked;
}
```

`resolveHelperPath()` looks in `bridge/tools/probe-locks.exe` first; falls back to `process.env.YFM3_PROBE_LOCKS` for power users running a custom build.

Keep `probeViaPowershell` as a fallback when the native helper isn't found on disk (so contributors who haven't pulled the binary aren't broken).

### Tests

- `parseLockedIndices` already covers the parse layer. Reuse — same JSON shape modulo wrapper key.
- A new test mocks `execFile` to verify the wiring (request shape, error handling, helper-disabled latching).
- An integration smoke test only runs under `WSL_DISTRO_NAME` and skips elsewhere — same pattern as the existing PowerShell probe.

### Rollout

1. Land the Rust source + CI build target.
2. Land `iso-lock-probe.ts` change with the native-helper-or-PowerShell fallback. Ship a built binary committed alongside.
3. After a few weeks of stability, drop the PowerShell fallback if no one's hit a missing-binary case in dev.

## Cost / benefit (recap)

| Metric | PowerShell (today) | Rust helper |
|---|---|---|
| Cold-start latency | ~550 ms | ~15–30 ms |
| Warm-start latency | ~400 ms | ~15–30 ms |
| Dependencies | None (PowerShell ships with Windows) | 500 KB committed `.exe`, mingw + rustup target add for build |
| Semantics vs prod FFI | Identical (`FileShare.None`) | Identical (same `CreateFileW` flags) |
| Maintenance | None | Re-build occasionally; trivial source |

A single dev session probably hits `acquireGameData` 1–3 times. So the difference today is ~1.5 s vs ~0.05 s of total probe time. Probably not worth the binary maintenance until/unless someone notices.

## Out-of-scope ideas worth keeping in mind

- **Long-lived helper subprocess** for sub-millisecond probes. Useful only if probe-on-every-poll ever becomes a thing. Adds connection management. Skip unless needed.
- **Read DuckStation's command line via WMI** to identify the active disc directly (no probe needed when DuckStation was launched with the ISO as an arg). Genuinely helpful — could be added to the Rust helper as a sibling subcommand `probe-locks --duckstation-cmdline` that returns the active disc path when present. Lift this signal into `decideDiscMatch` as a pre-disambiguator. Useful even with the PowerShell transport.
- **Embed lock-probe directly into `bridge.exe`** as a CLI subcommand and reuse from WSL. Cuts shipping a second binary. But cold-start of the bun-compiled bridge.exe (~117 MB) is much slower than a stripped Rust binary, so this loses most of the speed win.
