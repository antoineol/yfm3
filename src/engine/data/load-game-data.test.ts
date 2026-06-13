import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBuffers } from "../types/buffers.ts";
import { MAX_CARD_ID } from "../types/constants.ts";
import type { BridgeCard } from "../worker/messages.ts";
import { loadGameData, loadGameDataFromStrings } from "./load-game-data.ts";
import { loadGameDataWithBridgeTables } from "./load-game-data-core.ts";

const DATA_DIR = path.resolve(import.meta.dirname, "../../../public/data/rp");

describe("loadGameDataFromStrings", () => {
  it("produces identical buffers and cards as loadGameData", () => {
    const buf1 = createBuffers();
    const cards1 = loadGameData(buf1, "rp");

    const cardsCsv = fs.readFileSync(path.join(DATA_DIR, "cards.csv"), "utf-8");
    const fusionsCsv = fs.readFileSync(path.join(DATA_DIR, "fusions.csv"), "utf-8");
    const equipsCsv = fs.readFileSync(path.join(DATA_DIR, "equips.csv"), "utf-8");

    const buf2 = createBuffers();
    const cards2 = loadGameDataFromStrings(buf2, cardsCsv, fusionsCsv, equipsCsv);

    expect(cards2.map((c) => c.id)).toEqual(cards1.map((c) => c.id));
    expect(cards2.map((c) => c.attack)).toEqual(cards1.map((c) => c.attack));
    expectTypedArrayEqual(buf2.cardAtk, buf1.cardAtk);
    expectTypedArrayEqual(buf2.fusionTable, buf1.fusionTable);
    expectTypedArrayEqual(buf2.equipCompat, buf1.equipCompat);
  });

  it("loads all 722 cards and populates cardAtk", () => {
    const buf = createBuffers();
    const cards = loadGameData(buf, "rp");

    expect(cards.length).toBe(722);
    // Card 1: Baby Dragon, ATK=1200 (from binary CSV)
    expect(buf.cardAtk[1]).toBe(1200);
    // Card 2: ATK=1400
    expect(buf.cardAtk[2]).toBe(1400);
  });

  it("parses card names from CSV", () => {
    const buf = createBuffers();
    const cards = loadGameData(buf, "rp");

    const card1 = cards.find((c) => c.id === 1);
    expect(card1?.name).toBe("Baby Dragon");

    const card11 = cards.find((c) => c.id === 11);
    expect(card11?.name).toBe("Lord Of D.");
  });

  it("parses card names containing commas", () => {
    const buf = createBuffers();
    const cards = loadGameData(buf, "rp");

    const card192 = cards.find((c) => c.id === 192);
    expect(card192).toBeDefined();
    expect(card192?.name).toBe("Gandora, The Destroyer");
    expect(card192?.attack).toBe(3000);

    const card41 = cards.find((c) => c.id === 41);
    expect(card41?.name).toBe("Dan, The Man");
  });

  it("parses card color from CSV rows", () => {
    const buf = createBuffers();
    const cards = loadGameDataFromStrings(
      buf,
      [
        "id,name,atk,def,guardian_star_1,guardian_star_2,type,color,level,attribute,starchip_cost,password,description",
        '1,"Blue Frame",1000,1000,Mars,Jupiter,Dragon,blue,4,Light,0,,""',
      ].join("\n"),
      "material1_id,material2_id,result_id,result_atk\n",
      "equip_id,monster_id\n",
    );

    expect(cards[0]?.color).toBe("blue");
  });

  it("parses label color separately from frame color in CSV rows", () => {
    const buf = createBuffers();
    const cards = loadGameDataFromStrings(
      buf,
      [
        "id,name,atk,def,guardian_star_1,guardian_star_2,type,color,level,attribute,starchip_cost,password,description,label_color",
        '1,"Blue Label",1000,1000,Mars,Jupiter,Magic,green,4,Light,0,,"",blue',
      ].join("\n"),
      "material1_id,material2_id,result_id,result_atk\n",
      "equip_id,monster_id\n",
    );

    expect(cards[0]?.color).toBe("green");
    expect(cards[0]?.labelColor).toBe("blue");
  });

  it("parses card type labels from CSV rows", () => {
    const buf = createBuffers();
    const cards = loadGameDataFromStrings(
      buf,
      [
        "id,name,atk,def,guardian_star_1,guardian_star_2,type,color,level,attribute,starchip_cost,password,description,label_color,type_label",
        '1,"Localized",1000,1000,Mars,Jupiter,Magic,green,4,Light,0,,"",blue,Magie',
      ].join("\n"),
      "material1_id,material2_id,result_id,result_atk\n",
      "equip_id,monster_id\n",
    );

    expect(cards[0]?.cardType).toBe("Magic");
    expect(cards[0]?.cardTypeLabel).toBe("Magie");
  });

  it("parses card color from bridge rows", () => {
    const buf = createBuffers();
    const card: BridgeCard = {
      id: 1,
      name: "Purple Frame",
      atk: 1000,
      def: 1000,
      gs1: "Mars",
      gs2: "Jupiter",
      type: "Dragon",
      typeLabel: "Dragon local",
      color: "purple",
      labelColor: "red",
      level: 4,
      attribute: "Dark",
      description: "",
      starchipCost: 0,
      password: "",
    };

    const cards = loadGameDataWithBridgeTables(buf, [card], [], [], null);

    expect(cards[0]?.color).toBe("purple");
    expect(cards[0]?.labelColor).toBe("red");
    expect(cards[0]?.cardTypeLabel).toBe("Dragon local");
  });

  it("populates fusion table with known binary fusions", () => {
    const buf = createBuffers();
    loadGameData(buf, "rp");

    // Binary: material1=1, material2=156, result=186 (symmetric)
    expect(buf.fusionTable[1 * MAX_CARD_ID + 156]).toBe(186);
    expect(buf.fusionTable[156 * MAX_CARD_ID + 1]).toBe(186);
  });
});

function expectTypedArrayEqual(actual: ArrayBufferView, expected: ArrayBufferView): void {
  expect(actual.constructor).toBe(expected.constructor);
  expect(actual.byteLength).toBe(expected.byteLength);
  expect(Buffer.compare(viewBytes(actual), viewBytes(expected))).toBe(0);
}

function viewBytes(view: ArrayBufferView): Buffer {
  return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
}
