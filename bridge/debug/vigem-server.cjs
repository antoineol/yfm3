/**
 * Persistent ViGEm helper server.
 * Spawns vigem-helper.ps1 once, keeps it alive.
 * Listens on a local TCP port for button commands.
 *
 * Start:  node bridge/debug/vigem-server.cjs
 * Send:   echo "tap cross" | nc localhost 7777
 * Stop:   echo "shutdown" | nc localhost 7777
 */

const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");

const PORT = 7777;
const VIGEM_SCRIPT = path.join(__dirname, "vigem-helper.ps1");

let helper = null;
let buf = "";
let pendingResolve = null;

function waitOk() {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, 3000);
    pendingResolve = () => {
      clearTimeout(t);
      resolve();
    };
    drainBuffer();
  });
}

function drainBuffer() {
  while (buf.includes("ok\n")) {
    buf = buf.substring(buf.indexOf("ok\n") + 3);
    if (pendingResolve) {
      const r = pendingResolve;
      pendingResolve = null;
      r();
    }
  }
}

function startHelper() {
  console.log("Spawning vigem-helper.ps1...");
  helper = spawn(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", VIGEM_SCRIPT],
    { stdio: ["pipe", "pipe", "pipe"] },
  );

  helper.stderr.on("data", (d) => {
    const line = d.toString().trim();
    if (line) console.log("[vigem]", line);
  });

  helper.stdout.on("data", (d) => {
    buf += d.toString();
    drainBuffer();
  });

  helper.on("exit", (code) => {
    console.log("[vigem] exited:", code);
    helper = null;
  });
}

startHelper();

const server = net.createServer((socket) => {
  let data = "";
  socket.on("data", async (chunk) => {
    data += chunk.toString();
    // Process complete lines
    while (data.includes("\n")) {
      const idx = data.indexOf("\n");
      const cmd = data.substring(0, idx).trim();
      data = data.substring(idx + 1);

      if (!cmd) continue;

      if (cmd === "shutdown") {
        console.log("Shutting down...");
        if (helper) {
          helper.stdin.write("quit\n");
          helper.stdin.end();
        }
        socket.write("bye\n");
        socket.end();
        server.close();
        setTimeout(() => process.exit(), 1000);
        return;
      }
      if (!helper || helper.exitCode !== null) {
        socket.write("error: helper not running\n");
        continue;
      }
      helper.stdin.write(cmd + "\n");
      await waitOk();
      socket.write("ok\n");
    }
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`ViGEm server listening on localhost:${PORT}`);
  console.log("Waiting for controller detection (5s)...");
  setTimeout(() => console.log("Ready for commands."), 5000);
});
