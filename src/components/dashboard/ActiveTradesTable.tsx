"use client";
import { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/formatters";
import { MoreVertical } from "lucide-react";

interface Props {
  trades: Trade[];
}

export default function ActiveTradesTable({ trades }: Props) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
        No trades yet. Add your first trade!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {["Symbol", "Entry Price", "Stop Loss", "Take Profit", "Notes", "Action"].map((h) => (
              <th key={h} className="text-left text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider pb-3 px-2 first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-muted)]">
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-[var(--bg-elevated)]/40 transition-colors group">
              <td className="py-3 px-2 first:pl-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-blue)]/15 flex items-center justify-center text-[9px] font-bold text-[var(--accent-blue)]">
                    {trade.symbol[0]}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{trade.symbol}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{trade.direction}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-2 font-mono text-xs text-[var(--text-primary)]">
                {formatCurrency(trade.entry_price)}
              </td>
              <td className="py-3 px-2 font-mono text-xs text-[var(--accent-red)]">
                {formatCurrency(Number(trade.entry_price) * 0.98)}
              </td>
              <td className="py-3 px-2 font-mono text-xs text-[var(--accent-green)]">
                {formatCurrency(Number(trade.entry_price) * 1.04)}
              </td>
              <td className="py-3 px-2 text-xs text-[var(--text-secondary)] max-w-[120px] truncate">
                {trade.notes || "—"}
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    trade.result === "WIN"
                      ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)]"
                      : trade.result === "LOSS"
                      ? "bg-[var(--accent-red)]/15 text-[var(--accent-red)]"
                      : "bg-gray-500/15 text-gray-400"
                  }`}>
                    {trade.result === "WIN" ? "WIN MSD" : trade.result === "LOSS" ? "LOSS" : "BE"}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
