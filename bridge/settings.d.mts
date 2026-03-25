export function patchSettingsIni(content: string): { patched: boolean; content: string };
export function findSettingsPath(): string | null;
export function ensureSharedMemoryEnabled(): { patched: boolean; enabled: boolean; error?: string };
