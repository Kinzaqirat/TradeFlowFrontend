/**
 * Client-side P/L calculation for real-time form preview.
 * Mirrors the backend pnl_calculator.py logic exactly.
 */

export function calculatePnL(
  direction: "LONG" | "SHORT",
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  fees: number = 0
): number {
  let rawPnL: number;
  if (direction === "LONG") {
    rawPnL = (exitPrice - entryPrice) * quantity;
  } else {
    rawPnL = (entryPrice - exitPrice) * quantity;
  }
  return parseFloat((rawPnL - fees).toFixed(4));
}

export function calculatePnLPercent(
  pnl: number,
  entryPrice: number,
  quantity: number
): number {
  const invested = entryPrice * quantity;
  if (invested === 0) return 0;
  return parseFloat(((pnl / invested) * 100).toFixed(4));
}

export function classifyResult(pnl: number): "WIN" | "LOSS" | "BREAKEVEN" {
  if (pnl > 0) return "WIN";
  if (pnl < 0) return "LOSS";
  return "BREAKEVEN";
}
