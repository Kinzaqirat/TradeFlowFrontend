/** Formatting utilities for currency, dates, and percentages. */

export function formatCurrency(value: number | string | null | undefined): string {
  if (value == null) return "$0.00";
  const num = Number(value);
  const formatted = Math.abs(num).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
  return num < 0 ? `-${formatted}` : formatted;
}

export function formatPercent(value: number | string | null | undefined): string {
  if (value == null) return "0.00%";
  const num = Number(value);
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDatetime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getPnLColor(pnl: number): string {
  if (pnl > 0) return "text-emerald-400";
  if (pnl < 0) return "text-red-400";
  return "text-gray-400";
}

export function getResultColor(result: string): string {
  if (result === "WIN") return "text-emerald-400";
  if (result === "LOSS") return "text-red-400";
  return "text-gray-400";
}
