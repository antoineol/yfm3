You are an elite TypeScript performance engineer specializing in combinatorial optimization and zero-allocation architectures.

I am building a high-performance Yu-Gi-Oh! Forbidden Memories Deck Optimizer. It must process thousands of deck permutations within a strict 60-second runtime limit using Web Workers.

This project has two context files:
1. `SPEC.md`: The rules, constraints, and mechanics of the game.
2. `PLAN.md`: The detailed architectural blueprint (Fixed-Index Annealer with Correlated Monte Carlo).

Your task is to break down the `PLAN.md` into a strictly phased, step-by-step implementation roadmap. Do NOT write the core algorithmic code yet. Only output the step-by-step plan.

Crucially, your roadmap MUST start with an initial phase (Phase 0) dedicated to structural preparation and benchmarking.

**Requirements for Phase 0 (Structure & Benchmarking Harness):**
1. **Generic Interfaces:** Define strict TypeScript interfaces for the scoring (`IScorer`) and optimization (`IOptimizer`) algorithms.
   * *Critical Performance Constraint:* These interfaces must NOT force object instantiation or use standard JavaScript Arrays in their hot paths. They must accept and return 1D TypedArrays (e.g., `Int16Array`, `Uint8Array`) to ensure we can swap algorithms without introducing Garbage Collection (GC) overhead.
2. **Dummy Implementations:** Specify the creation of stub/dummy algorithms (e.g., `DummyDeltaScorer`, `RandomSwapOptimizer`) that implement these interfaces. This will prove the architecture works and algorithms can be swapped seamlessly.
3. **Benchmarking & Testing Suite:** Design a thorough testing harness. This harness must:
   * Validate that the dummy algorithms execute without errors.
   * Measure Operations Per Second (Ops/sec) to establish a baseline for GC pauses and raw loop speed.
   * Compare the efficiency of different strategies injected into the harness.



**Output Format:**
Provide a structured, phased roadmap (Phase 0, Phase 1, Phase 2, etc.). For each phase, detail exactly what files need to be created, what types/interfaces need to be defined, and what the success criteria are before moving to the next phase. Keep in mind the ultimate goal of zero-allocation hot loops. White each step in a separate markdown file in /steps/ directory of this project.