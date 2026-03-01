import type { CardRefByName, FusionMaterial, KindIdentifier } from "./card-model.ts";

/**
 * Generate a unique key for a material pair.
 * Encodes color for color-qualified kinds: "[blue]Reptile"
 */
export function getMaterialPairKey(material1: FusionMaterial, material2: FusionMaterial): string {
  const m1Name = getMaterialKeyPart(material1);
  const m2Name = getMaterialKeyPart(material2);

  // Sort to ensure consistent key generation regardless of order
  const names = [m1Name, m2Name].sort();
  return `${names[0]}:${names[1]}`;
}

function getMaterialKeyPart(material: FusionMaterial): string {
  if (isCardRefByName(material)) {
    return material.name;
  }
  if (material.color) {
    return `[${material.color}]${material.kind}`;
  }
  return material.kind;
}

export function isCardRefByName(identifier: FusionMaterial): identifier is CardRefByName {
  return "name" in identifier;
}

/**
 * Type guard to check if a FusionMaterial is a KindIdentifier
 */
export function isKindIdentifier(identifier: FusionMaterial): identifier is KindIdentifier {
  return "kind" in identifier;
}
