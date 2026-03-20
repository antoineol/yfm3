import { Button } from "../../components/Button.tsx";
import { useOptimize } from "./use-optimize.ts";

export function OptimizeButton() {
  const { optimize, isOptimizing, canOptimize } = useOptimize();

  return (
    <Button disabled={!canOptimize} glowing={isOptimizing} onClick={optimize} size="lg">
      {isOptimizing ? "Optimizing\u2026" : "Optimize Deck"}
    </Button>
  );
}
