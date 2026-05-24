import type { BridgeCard } from "../../../engine/worker/messages.ts";
import type { BattleTarget, BridgeState } from "../../lib/bridge-message-processor.ts";
import type { FieldCard } from "../../lib/bridge-state-interpreter.ts";

export type BattleOutcome = "win" | "bothDestroyed" | "lose";

export type BattlePrediction = {
  outcome: BattleOutcome;
  attackerAtk: number;
  defenderValue: number;
  defenderPosition: "attack" | "defense";
};

type BattleCard = {
  card: BridgeCard;
  field: FieldCard;
};

export function predictFocusedBattle(bridge: BridgeState): BattlePrediction | null {
  const target = bridge.battleTarget;
  if (!bridge.inDuel || !target || !bridge.gameData) return null;

  const attacker = battleCardForTarget(bridge.gameData.cards, bridge.field, target.attacker);
  const defender = battleCardForTarget(
    bridge.gameData.cards,
    bridge.opponentField,
    target.defender,
  );
  if (!attacker || !defender) return null;

  return predictBattleOutcome(attacker, defender);
}

export function predictBattleOutcome(
  attacker: BattleCard,
  defender: BattleCard,
): BattlePrediction | null {
  if (attacker.card.atk <= 0 || defender.card.atk <= 0) return null;

  const guardian = guardianBattleBonus(attacker.card, defender.card);
  const attackerStats = effectiveBattleStats(attacker, guardian.attacker);
  const defenderStats = effectiveBattleStats(defender, guardian.defender);
  const defenderPosition = isAttackPosition(defender.field.status) ? "attack" : "defense";
  const defenderValue = defenderPosition === "attack" ? defenderStats.atk : defenderStats.def;

  return {
    outcome: battleOutcome(attackerStats.atk, defenderValue, defenderPosition),
    attackerAtk: attackerStats.atk,
    defenderValue,
    defenderPosition,
  };
}

function battleCardForTarget(
  cards: BridgeCard[],
  field: FieldCard[],
  target: BattleTarget["attacker"],
): BattleCard | null {
  const card = cards.find((c) => c.id === target.cardId);
  const fieldCard =
    field.find((fc, i) => fc.cardId === target.cardId && (fc.slotIndex ?? i) === target.index) ??
    field.find((fc) => fc.cardId === target.cardId);
  return card && fieldCard ? { card, field: fieldCard } : null;
}

function effectiveBattleStats(
  battleCard: BattleCard,
  guardianBonus: number,
): { atk: number; def: number } {
  return {
    atk: Math.max(0, battleCard.field.atk + guardianBonus),
    def: Math.max(0, battleCard.field.def + guardianBonus),
  };
}

function battleOutcome(
  attackerAtk: number,
  defenderValue: number,
  defenderPosition: "attack" | "defense",
): BattleOutcome {
  if (attackerAtk > defenderValue) return "win";
  if (defenderPosition === "attack" && attackerAtk === defenderValue) return "bothDestroyed";
  return "lose";
}

function guardianBattleBonus(
  attacker: BridgeCard,
  defender: BridgeCard,
): { attacker: number; defender: number } {
  const attackerStar = selectedGuardianStar(attacker);
  const defenderStar = selectedGuardianStar(defender);
  if (hasGuardianAdvantage(attackerStar, defenderStar)) return { attacker: 500, defender: 0 };
  if (hasGuardianAdvantage(defenderStar, attackerStar)) return { attacker: 0, defender: 500 };
  return { attacker: 0, defender: 0 };
}

function selectedGuardianStar(card: BridgeCard): string {
  return card.gs1 || "None";
}

function hasGuardianAdvantage(attackerStar: string, defenderStar: string): boolean {
  return GUARDIAN_ADVANTAGE[attackerStar] === defenderStar;
}

function isAttackPosition(status: number | undefined): boolean {
  return status != null && ATTACK_POSITION_STATUSES.has(status);
}

const GUARDIAN_ADVANTAGE: Readonly<Record<string, string>> = {
  Mars: "Jupiter",
  Jupiter: "Saturn",
  Saturn: "Uranus",
  Uranus: "Pluto",
  Pluto: "Neptune",
  Neptune: "Mars",
  Mercury: "Sun",
  Sun: "Moon",
  Moon: "Venus",
  Venus: "Mercury",
};

const ATTACK_POSITION_STATUSES = new Set([0x04, 0x82, 0x84, 0x86, 0x94, 0xc4, 0xc6]);
