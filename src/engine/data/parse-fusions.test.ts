import { describe, expect, it } from "vitest";
import { parseFusionCsv } from "./parse-fusions.ts";

describe("CSV Parser Tests", () => {
  it("should parse a full CSV string", () => {
    const csvContent = `	Fusionmaterial 1	Fusionmaterial 2		Result Fusion 1	Attack	Defense		Fusionmaterial 3		Result Fusion 2	Attack	Defense

	Dragon	Beast		Des Volstgalph	2200	1700		Fiend / Time Wizard		Gandora, The Destroyer	3000	0		Thunder / Time Wizard		Lord Of The Lair	4000	3000

	Dragon	Fiend		Koumori Dragon	2000	1700		Rock / Time Wizard		Red-Eyes B. Dragon	2900	2500		Zombie / Time Wizard		B. Skull Dragon	3700	3000
														Pyro		Meteor B. Dragon	4000	2500
														Machine		Red-Eyes B. Metal Dragon	3800	3400
														Aqua		White Night Dragon	4000	3500

	Dragon	Kuriboh		Winged Kuriboh	2800	1000`;

    const result = parseFusionCsv(csvContent);

    expect(result.fusions).toHaveLength(10);
    const fusion = result.fusions.find((f) => f.name === "Des Volstgalph");
    if (!fusion) throw new Error("Fusion not found");

    expect(fusion.attack).toBe(2200);
    expect(fusion.defense).toBe(1700);
    expect(fusion.materials.size).toBe(1);
    expect(fusion.materials).toBeInstanceOf(Set);
    expect(fusion.materials.has("Beast:Dragon")).toBe(true);

    // Find the Koumori Dragon fusion
    const koumoriDragonFusion = result.fusions.find((f) => f.name === "Koumori Dragon");
    if (!koumoriDragonFusion) throw new Error("Koumori Dragon fusion not found");

    expect(koumoriDragonFusion.attack).toBe(2000);
    expect(koumoriDragonFusion.defense).toBe(1700);
    expect(koumoriDragonFusion.materials.size).toBe(1);
    expect(koumoriDragonFusion.materials).toBeInstanceOf(Set);
    expect(koumoriDragonFusion.materials.has("Dragon:Fiend")).toBe(true);

    // Find the Winged Kuriboh fusion
    const wingedKuribohFusion = result.fusions.find((f) => f.name === "Winged Kuriboh");
    if (!wingedKuribohFusion) throw new Error("Winged Kuriboh fusion not found");

    expect(wingedKuribohFusion.attack).toBe(2800);
    expect(wingedKuribohFusion.defense).toBe(1000);
    expect(wingedKuribohFusion.materials.size).toBe(1);
    expect(wingedKuribohFusion.materials).toBeInstanceOf(Set);
    expect(wingedKuribohFusion.materials.has("Dragon:Kuriboh")).toBe(true);
  });

  it("should handle value propagation from previous rows", () => {
    const csvContent = `	Fusionmaterial 1	Fusionmaterial 2		Result Fusion 1	Attack	Defense

	Dragon	Harpie Lady		Harpie's Pet Dragon	3000	3500
		Harpie Lady 1`;

    const result = parseFusionCsv(csvContent);
    expect(result.fusions).toHaveLength(1);

    // Find the Harpie's Pet Dragon fusion
    const harpiePetDragonFusion = result.fusions.find((f) => f.name === "Harpie's Pet Dragon");
    if (!harpiePetDragonFusion) throw new Error("Harpie's Pet Dragon fusion not found");

    // Check materials - should have 2 material pairs as strings in the Set
    expect(harpiePetDragonFusion.materials.size).toBe(2);

    // Check that both material combinations are in the Set
    expect(harpiePetDragonFusion.materials.has("Dragon:Harpie Lady")).toBe(true);
    expect(harpiePetDragonFusion.materials.has("Dragon:Harpie Lady 1")).toBe(true);

    expect(harpiePetDragonFusion.name).toBe("Harpie's Pet Dragon");
    expect(harpiePetDragonFusion.attack).toBe(3000);
    expect(harpiePetDragonFusion.defense).toBe(3500);
  });

  it("should throw an error when the first fusion has a result but missing attack or defense", () => {
    const csvContent = `	Fusionmaterial 1	Fusionmaterial 2		Result Fusion 1	Attack	Defense

	Dragon	Beast		Des Volstgalph	2200	1700

	Dragon	Fiend		Koumori Dragon		1700`;
    // This test implicitly tests that the values lastXXX are reset when encountering a completely empty line.
    expect(() => parseFusionCsv(csvContent)).toThrow("Missing data for a fusion");
  });

  it("should not throw an error if the second fusion is completely empty", () => {
    const csvContent = `	Fusionmaterial 1	Fusionmaterial 2		Result Fusion 1	Attack	Defense

	Dragon	Beast		Des Volstgalph	2200	1700

	Dragon`;
    expect(() => parseFusionCsv(csvContent)).not.toThrow();
  });

  it("should throw an error if the second fusion has a name, but missing attack", () => {
    const csvContent = `	Fusionmaterial 1	Fusionmaterial 2		Result Fusion 1	Attack	Defense

	Dragon	Beast		Des Volstgalph	2200	1700

	Dragon	Fiend		Koumori Dragon		1700`;
    expect(() => parseFusionCsv(csvContent)).toThrow("Missing data for a fusion");
  });

  it('finds that "Dark-Eyes B. Dragon" has materials Kiryu and either Fiend or Time Wizard', () => {
    const csvContent = `	Fusionmaterial 1	Fusionmaterial 2		Result Fusion 1	Attack	Defense		Fusionmaterial 3		Result Fusion 2	Attack	Defense		Fusionmaterial 4		Result Fusion 3	Attack	Defense		Fusionmaterial 5		Result Fusion 4	Attack	Defense

	Dragon	Pyro		Kiryu	2000	1500		Fiend / Time Wizard		Dark-Eyes B. Dragon	2900	2500		Fairy / Time Wizard		White-Horned Dragon	3700	1400`;
    const result = parseFusionCsv(csvContent);

    // We should now have 3 fusions
    expect(result.fusions).toHaveLength(3);

    // Find the Dark-Eyes B. Dragon fusion
    const darkEyesFusion = result.fusions.find((f) => f.name === "Dark-Eyes B. Dragon");
    expect(darkEyesFusion).toBeDefined();

    if (!darkEyesFusion) throw new Error("Dark-Eyes B. Dragon fusion not found");

    // Should have 2 material pairs in the Set
    expect(darkEyesFusion.materials.size).toBe(2);

    // Check for the expected material combinations
    expect(darkEyesFusion.materials.has("Fiend:Kiryu")).toBe(true);
    expect(darkEyesFusion.materials.has("Kiryu:Time Wizard")).toBe(true);

    expect(darkEyesFusion.attack).toBe(2900);
    expect(darkEyesFusion.defense).toBe(2500);
  });

  it("should only reset lastValues when encountering a truly empty CSV line", () => {
    const csvContent = `	Fusionmaterial 1	Fusionmaterial 2		Result Fusion 1	Attack	Defense		Fusionmaterial 3		Result Fusion 2	Attack	Defense

	Dragon	Harpie Lady		Harpie's Pet Dragon	3000	3500
		Harpie Lady 1

	Dragon	WingedBeast		Stardust Dragon	2500	2000`;

    const result = parseFusionCsv(csvContent);

    expect(result.fusions).toHaveLength(2);

    const harpiePetDragon = result.fusions.find((f) => f.name === "Harpie's Pet Dragon");
    expect(harpiePetDragon).toBeDefined();

    if (!harpiePetDragon) throw new Error("Harpie's Pet Dragon fusion not found");

    // Should have 2 material pairs in the Set
    expect(harpiePetDragon.materials.size).toBe(2);

    // Check that both material combinations are in the Set
    expect(harpiePetDragon.materials.has("Dragon:Harpie Lady")).toBe(true);
    expect(harpiePetDragon.materials.has("Dragon:Harpie Lady 1")).toBe(true);

    // Check attack and defense
    expect(harpiePetDragon.attack).toBe(3000);
    expect(harpiePetDragon.defense).toBe(3500);

    // Check the Stardust Dragon fusion
    const stardustDragon = result.fusions.find((f) => f.name === "Stardust Dragon");
    expect(stardustDragon).toBeDefined();

    if (!stardustDragon) throw new Error("Stardust Dragon fusion not found");

    // Should have 1 material pair in the Set
    expect(stardustDragon.materials.size).toBe(1);
    expect(stardustDragon.materials.has("Dragon:WingedBeast")).toBe(true);
  });

  it("should deduplicate materials", () => {
    const csvContent = `Fusionmaterial 1	Fusionmaterial 2		Result Fusion 1	Attack	Defense		Fusionmaterial 3		Result Fusion 2	Attack	Defense		Fusionmaterial 4		Result Fusion 3	Attack	Defense		Fusionmaterial 5		Result Fusion 4	Attack	Defense

	Dragon	WingedBeast		Stardust Dragon	2500	2000
	Dragon	WingedBeast		Stardust Dragon	2500	2000`;
    const result = parseFusionCsv(csvContent);

    expect(result.fusions).toHaveLength(1);
    expect(result.fusions[0]?.materials.size).toBe(1);
  });

  it("more complex line", () => {
    const csvContent = `Fusionmaterial 1	Fusionmaterial 2		Result Fusion 1	Attack	Defense		Fusionmaterial 3		Result Fusion 2	Attack	Defense		Fusionmaterial 4		Result Fusion 3	Attack	Defense		Fusionmaterial 5		Result Fusion 4	Attack	Defense

	Dragon	WingedBeast		Stardust Dragon	2500	2000		Roaring Ocean Snake / Levia Dragon Daedalus / Venom Boa / [Blue] Reptile		Rainbow Dragon	4500	0		Time Wizard		Rainbow Overdragon	5000	0
								Kaiser Dragon		Feathered Stardust Dragon	3000	2500		[Yellow] Dragon / [Orange] Dragon / [Red] Dragon		Cosmic Blazar Dragon	4000	4000
								Dragon / Time Wizard						Thunder / Time Wizard		Cosmic Blazar Dragon	4000	4000
														Roaring Ocean Snake / Levia Dragon Daedalus / Venom Boa / [Blue] Reptile		Rainbow Dragon	4500	0		Plant		Black Rose Dragon	4900	4400
																				Time Wizard		Rainbow Overdragon	5000	0`;
    const result = parseFusionCsv(csvContent);

    expect(result.fusions).toHaveLength(6);
    expect(result.fusions.find((f) => f.name === "Stardust Dragon")?.materials.size).toBe(1);
    // Color-encoded keys: [blue]Reptile is distinct from Reptile, so more unique material pairs
    expect(result.fusions.find((f) => f.name === "Rainbow Dragon")?.materials.size).toBe(8);
    expect(result.fusions.find((f) => f.name === "Feathered Stardust Dragon")?.materials.size).toBe(
      3,
    );
    expect(result.fusions.find((f) => f.name === "Rainbow Overdragon")?.materials.size).toBe(1);
    expect(result.fusions.find((f) => f.name === "Cosmic Blazar Dragon")?.materials.size).toBe(5);
    expect(result.fusions.find((f) => f.name === "Black Rose Dragon")?.materials.size).toBe(1);
  });
});

// // Test util, if need to debug:
// function printFusion(fusions: FusionMaterials[]) {
//   for (const fusion of fusions) {
//     console.log(
//       fusion.name,
//       '\t<=\t',
//       Array.from(fusion.materials)
//         .map(materialKey => materialKey.split(':').join(' + '))
//         .join(' OR '),
//     );
//   }
// }
