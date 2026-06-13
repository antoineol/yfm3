export function shouldReloadBridge(filename: string | null | undefined): filename is string {
  if (!filename) return false;
  if (filename === "package.json") return true;
  if (!filename.endsWith(".ts")) return false;
  if (filename.endsWith(".test.ts")) return false;
  if (filename.endsWith(".integration.test.ts")) return false;
  return true;
}
