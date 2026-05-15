"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart2,
  Edit2,
  Minus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Trade } from "@/types/trade";
import { formatCurrency, formatDatetime, formatPercent } from "@/utils/formatters";

interface TradeTableProps {
  trades: Trade[];
  onDelete: (id: string) => Promise<void>;
}

type SortField = "symbol" | "entry_datetime" | "entry_price" | "pnl";
type SortDir = "asc" | "desc";

export default function TradeTable({ trades, onDelete }: TradeTableProps) {
  const [sortField, setSortField] = useState<SortField>("entry_datetime");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDir("desc");
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      let valA: string | number = a[sortField as keyof Trade] as string | number;
      let valB: string | number = b[sortField as keyof Trade] as string | number;

      if (sortField === "entry_datetime") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (sortField === "entry_price" || sortField === "pnl") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [trades, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }

    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-[var(--accent-blue)]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[var(--accent-blue)]" />
    );
  };

  const ResultBadge = ({ result }: { result: string }) => {
    const styles: Record<string, string> = {
      WIN: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      LOSS: "bg-red-500/10 border-red-500/30 text-red-400",
      BREAKEVEN: "bg-gray-500/10 border-gray-500/30 text-gray-400",
    };
    const icons: Record<string, ReactNode> = {
      WIN: <TrendingUp className="w-3 h-3" />,
      LOSS: <TrendingDown className="w-3 h-3" />,
      BREAKEVEN: <Minus className="w-3 h-3" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
          styles[result] ?? styles.BREAKEVEN
        }`}
      >
        {icons[result]}
        {result === "BREAKEVEN" ? "B/E" : result}
      </span>
    );
  };

  const renderSortButton = (field: SortField, label: string, alignRight = false) => (
    <button
      onClick={() => handleSort(field)}
      className={`table-sort-btn flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-white transition-colors ${
        alignRight ? "ml-auto" : ""
      }`}
      type="button"
    >
      {label} <SortIcon field={field} />
    </button>
  );

  return (
    <div className="trade-table flex flex-col gap-0">
      <style>{`
        .trade-table button {
          appearance: none;
          background: transparent;
          border: 0;
          color: inherit;
          font: inherit;
          padding: 0;
        }
      `}</style>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="text-left">
              <th className="px-5 py-3">
                {renderSortButton("symbol", "Symbol")}
              </th>
              <th className="px-5 py-3">
                {renderSortButton("entry_datetime", "Entry")}
              </th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Exit
              </th>
              <th className="px-5 py-3">
                {renderSortButton("entry_price", "Price")}
              </th>
              <th className="px-5 py-3 text-right">
                {renderSortButton("pnl", "P / L", true)}
              </th>
              <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Result
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade) => {
              const pnl = Number(trade.pnl);
              const pnlColor =
                pnl > 0
                  ? "text-emerald-400"
                  : pnl < 0
                    ? "text-red-400"
                    : "text-[var(--text-secondary)]";

              return (
                <tr
                  key={trade.id}
                  className="border-t border-[var(--border-muted)] hover:bg-[var(--bg-surface)] transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-sm tracking-wide">{trade.symbol}</div>
                    <div
                      className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        trade.direction === "LONG"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {trade.direction === "LONG" ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      {trade.direction}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="text-xs text-[var(--text-primary)]">
                      {formatDatetime(trade.entry_datetime)}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="text-xs text-[var(--text-secondary)]">
                      {formatDatetime(trade.exit_datetime)}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="font-mono text-xs text-[var(--text-primary)]">
                      {formatCurrency(trade.entry_price)}
                    </div>
                    <div className="font-mono text-xs text-[var(--text-muted)] mt-0.5">
                      -&gt; {formatCurrency(trade.exit_price)}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className={`font-mono font-bold text-sm ${pnlColor}`}>
                      {pnl >= 0 ? "+" : ""}
                      {formatCurrency(trade.pnl)}
                    </div>
                    <div className={`font-mono text-[10px] mt-0.5 ${pnlColor} opacity-70`}>
                      {pnl >= 0 ? "+" : ""}
                      {formatPercent(trade.pnl_percent)}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <ResultBadge result={trade.result} />
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/trades/${trade.id}/edit`}
                        title="Edit"
                        className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[var(--accent-blue)]/10 hover:text-[var(--accent-blue)] text-[var(--text-muted)] transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/trades/${trade.id}/chart`}
                        title="Chart"
                        className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 text-[var(--text-muted)] transition-all"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(trade.id)}
                        disabled={deletingId === trade.id}
                        title="Delete"
                        className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-[var(--text-muted)] transition-all disabled:opacity-40"
                        type="button"
                      >
                        {deletingId === trade.id ? (
                          <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin block" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedTrades.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-4">
              <BarChart2 className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
              No trades yet
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Start by logging a new trade
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
