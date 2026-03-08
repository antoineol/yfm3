import { mulberry32 } from "../mulberry32.ts";
import type { OptBuffers } from "../types/buffers.ts";
import type { IDeltaEvaluator, IOptimizer, IScorer } from "../types/interfaces.ts";
import { createBiasedSelector } from "./biased-selection.ts";
import { createTabuList } from "./tabu-list.ts";

/** Temperature below which SA becomes fully greedy (no bad-move acceptance). */
const TEMP_FLOOR = 0.1;
/** Conservative estimate: ~500 swaps/s → ~2ms per swap. */
const MS_PER_SWAP = 2;
/** Recompute biased-selection weights every N accepted swaps. */
const REWEIGHT_INTERVAL = 100;
/** Only call performance.now() every N iterations (amortize syscall cost). */
const TIME_CHECK_INTERVAL = 64;
/** Minimum interval between onProgress callbacks (ms). */
const PROGRESS_INTERVAL = 500;
/** Number of trial swaps used to measure typical delta magnitude at startup. */
const CALIBRATION_SWAPS = 50;

/**
 * Simulated Annealing deck optimizer.
 *
 * Each iteration:
 *   1. Pick a random deck slot and a biased replacement card (§biased-selection)
 *   2. Skip if tabu (recently rejected in this slot)
 *   3. Tentatively swap the card, measure score delta across ~1,875 affected hands
 *   4. Accept if delta > 0 (always) or with probability exp(delta/temp) if delta < 0
 *   5. On reject: revert swap, mark card as tabu for this slot
 *   6. Cool temperature (temp *= coolingRate)
 *
 * The temperature starts high (calibrated so ~50% of bad swaps are accepted)
 * and decays to TEMP_FLOOR by the deadline, transitioning from exploration
 * (accept bad moves to escape local optima) to exploitation (greedy polishing).
 *
 * Tracks the best deck ever seen. On exit, restores it (SA may have drifted
 * downhill from the best). This guarantees monotonicity: returned score >= input.
 */
export class SAOptimizer implements IOptimizer {
  readonly seed: number;
  /** Number of iterations completed in the last run() call. */
  iterations = 0;

  constructor(seed: number = 42) {
    this.seed = seed;
  }

  run(
    buf: OptBuffers,
    scorer: IScorer,
    deltaEvaluator: IDeltaEvaluator,
    deadline: number,
    onProgress?: (bestScore: number, bestDeck: Int16Array) => void,
  ): number {
    const rand = mulberry32(this.seed);
    const tabu = createTabuList(buf.deck.length);
    const selector = createBiasedSelector();
    const bestDeck = new Int16Array(buf.deck.length);

    let totalScore = sumScores(buf);
    let bestScore = totalScore;
    bestDeck.set(buf.deck);

    selector.recomputeWeights(buf);

    // Calibrate starting temperature against actual delta magnitudes
    let temp = calibrateTemp(buf, scorer, deltaEvaluator, selector, rand);

    // Compute cooling rate so temperature reaches TEMP_FLOOR by deadline.
    // Conservative estimate: ~500 swaps/s. If actual throughput is higher,
    // temp hits the floor early and remaining iterations are greedy (fine).
    const remainingMs = Math.max(deadline - performance.now(), 1);
    const expectedIterations = Math.max(remainingMs / MS_PER_SWAP, 1);
    const coolingRate = Math.exp(Math.log(TEMP_FLOOR / temp) / expectedIterations);

    let acceptedSinceReweight = 0;
    let iteration = 0;
    let lastProgressAt = performance.now();

    // Check deadline every 64 iterations to amortize performance.now() cost.
    // On iteration 0, (0 % 64 === 0) so we always check time on the first pass.
    while (true) {
      if (iteration % TIME_CHECK_INTERVAL === 0) {
        const now = performance.now();
        if (now >= deadline) break;
        if (onProgress && now - lastProgressAt >= PROGRESS_INTERVAL) {
          lastProgressAt = now;
          this.iterations = iteration;
          onProgress(bestScore, bestDeck);
        }
      }
      // 1. Pick a random slot and a biased replacement card
      const slot = (rand() * buf.deck.length) | 0;
      const oldCard = buf.deck[slot] ?? 0;
      const newCard = selector.selectCandidate(buf, oldCard, rand);
      if (newCard === -1) {
        iteration++;
        temp *= coolingRate;
        continue;
      }
      if (tabu.isTabu(slot, newCard)) {
        iteration++;
        temp *= coolingRate;
        continue;
      }

      // 2. Tentatively apply the swap and measure score change
      buf.deck[slot] = newCard;
      buf.cardCounts[oldCard] = (buf.cardCounts[oldCard] ?? 0) - 1;
      buf.cardCounts[newCard] = (buf.cardCounts[newCard] ?? 0) + 1;

      const delta = deltaEvaluator.computeDelta(slot, buf, scorer);

      // 3. SA acceptance: always accept improvements, probabilistically accept worsening
      const accept = delta > 0 || (temp > TEMP_FLOOR && rand() < Math.exp(delta / temp));

      if (accept) {
        // Commit the new hand scores (were staged by computeDelta)
        deltaEvaluator.commitDelta(buf.handScores);
        totalScore += delta;
        acceptedSinceReweight++;

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestDeck.set(buf.deck);
        }

        // Lazily refresh selection weights as deck composition drifts
        if (acceptedSinceReweight >= REWEIGHT_INTERVAL) {
          selector.recomputeWeights(buf);
          acceptedSinceReweight = 0;
        }
      } else {
        // 4. Revert swap and mark this card as tabu for this slot
        buf.deck[slot] = oldCard;
        buf.cardCounts[oldCard] = (buf.cardCounts[oldCard] ?? 0) + 1;
        buf.cardCounts[newCard] = (buf.cardCounts[newCard] ?? 0) - 1;
        tabu.addTabu(slot, newCard);
      }

      iteration++;
      temp *= coolingRate;
    }

    // Restore the best deck ever seen (current deck may have drifted downhill).
    // Note: handScores is NOT rebuilt here — it still reflects the last iteration's
    // deck, not bestDeck. Callers must not rely on buf.handScores after run().
    // The exact scorer (Phase 5) recomputes from scratch, so this is safe.
    buf.deck.set(bestDeck);
    buf.cardCounts.fill(0);
    for (let i = 0; i < buf.deck.length; i++) {
      buf.cardCounts[buf.deck[i] ?? 0] = (buf.cardCounts[buf.deck[i] ?? 0] ?? 0) + 1;
    }
    this.iterations = iteration;
    return bestScore;
  }
}

/**
 * Determine the starting temperature by measuring how big score changes
 * actually are for this deck. Runs CALIBRATION_SWAPS trial swaps (all reverted),
 * computes average |delta|, and sets T0 = avg|delta| / ln(2).
 *
 * This makes exp(-avg|delta| / T0) = 0.5, meaning a typical bad swap has
 * ~50% acceptance probability at the start — enough exploration without
 * being a pure random walk.
 */
function calibrateTemp(
  buf: OptBuffers,
  scorer: IScorer,
  deltaEvaluator: IDeltaEvaluator,
  selector: ReturnType<typeof createBiasedSelector>,
  rand: () => number,
): number {
  let sumAbsDelta = 0;
  let samples = 0;

  for (let i = 0; i < CALIBRATION_SWAPS; i++) {
    const slot = (rand() * buf.deck.length) | 0;
    const oldCard = buf.deck[slot] ?? 0;
    const newCard = selector.selectCandidate(buf, oldCard, rand);
    if (newCard === -1) continue;

    buf.deck[slot] = newCard;
    buf.cardCounts[oldCard] = (buf.cardCounts[oldCard] ?? 0) - 1;
    buf.cardCounts[newCard] = (buf.cardCounts[newCard] ?? 0) + 1;

    const delta = deltaEvaluator.computeDelta(slot, buf, scorer);
    sumAbsDelta += Math.abs(delta);
    samples++;

    // Always revert — calibration only, no permanent changes
    buf.deck[slot] = oldCard;
    buf.cardCounts[oldCard] = (buf.cardCounts[oldCard] ?? 0) + 1;
    buf.cardCounts[newCard] = (buf.cardCounts[newCard] ?? 0) - 1;
  }

  if (samples === 0) return 500;
  const avgAbsDelta = sumAbsDelta / samples;
  return avgAbsDelta / Math.LN2;
}

function sumScores(buf: OptBuffers): number {
  let total = 0;
  for (let i = 0; i < buf.handScores.length; i++) {
    total += buf.handScores[i] ?? 0;
  }
  return total;
}
