import bridgePkg from "../../../../bridge/package.json";

export const BRIDGE_MIN_VERSION: string = bridgePkg.version;
export const BRIDGE_DOWNLOAD_URL = `https://github.com/antoineol/yfm3/releases/download/bridge-v${BRIDGE_MIN_VERSION}/yfm-bridge-win-x64-v${BRIDGE_MIN_VERSION}.zip`;
export const DUCKSTATION_URL = "https://www.duckstation.org";
export const BIOS_US_URL = "https://example.com/bios-us"; // TODO: replace with real link
export const BIOS_EU_URL =
  "https://www.planetemu.net/rom/sony-playstation-bios/sony-playstation-scph-7502-bios-v4-1-1997-12-16-sony-eu";
