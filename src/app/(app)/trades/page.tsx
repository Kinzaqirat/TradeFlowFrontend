"use client";
import { useState, useEffect, useCallback } from "react";
import { Trade, TradeListResponse } from "@/types/trade";
import { getTrades, deleteTrade, exportCSV } from "@/services/tradeService";
import { formatCurrency, formatDatetime } from "@/utils/formatters";
import QuickAddModal from "@/components/trades/QuickAddModal";
import {
  Plus,
  Download,
  Search,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  History,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

const RESULT_FILTERS = [
  { key: "", label: "All" },
  { key: "WIN", label: "Wins" },
  { key: "LOSS", label: "Losses" },
  { key: "BREAKEVEN", label: "B/E" },
] as const;

const thStyle = {
  padding: "12px 16px",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.4)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  background: "transparent",
};

const tdStyle = {
  padding: "14px 16px",
  verticalAlign: "middle" as const,
};

const iconBtnStyle = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "rgba(255,255,255,0.35)",
  transition: "all 0.12s",
};

// ── Result Badge ──

function ResultBadge({ result }: { result: string }) {
  if (result === "WIN") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 12px",
          borderRadius: 9999,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          background: "rgba(52,211,153,0.1)",
          border: "1px solid rgba(52,211,153,0.3)",
          color: "#34d399",
        }}
      >
        <TrendingUp className="w-3 h-3" />
        {result}
      </span>
    );
  }
  if (result === "LOSS") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 12px",
          borderRadius: 9999,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          background: "rgba(248,113,113,0.1)",
          border: "1px solid rgba(248,113,113,0.3)",
          color: "#f87171",
        }}
      >
        <TrendingDown className="w-3 h-3" />
        {result}
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 12px",
        borderRadius: 9999,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.4)",
      }}
    >
      <X className="w-3 h-3" />
      B/E
    </span>
  );
}

// ── Direction Chip ──

function DirectionChip({ direction }: { direction: string }) {
  const isLong = direction === "LONG";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: 8,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        background: isLong ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
        border: `1px solid ${isLong ? "rgba(52,211,153,0.35)" : "rgba(248,113,113,0.35)"}`,
        color: isLong ? "#34d399" : "#f87171",
      }}
    >
      {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {direction}
    </span>
  );
}

// ── Empty State ──

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div style={{ padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <History className="w-6 h-6" style={{ color: "rgba(255,255,255,0.15)" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>
          {hasFilters ? "No trades match" : "No trades yet"}
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
          {hasFilters ? "Try adjusting your search or filter" : "Start by logging your first trade"}
        </p>
      </div>
    </div>
  );
}

// ── Loading State ──

function LoadingState() {
  return (
    <div style={{ padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div
        className="animate-spin"
        style={{
          width: 28,
          height: 28,
          border: "2px solid rgba(255,255,255,0.06)",
          borderTopColor: "#388bfd",
          borderRadius: "50%",
        }}
      />
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)" }}>
        Loading
      </span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═════════════════════════════════════════════════════════════════════

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadTrades = useCallback(async () => {
    try {
      setLoading(true);
      const res: TradeListResponse = await getTrades();
      setTrades(res.data);
    } catch {
      console.error("Failed to load trades");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteTrade(id);
      setTrades((t) => t.filter((x) => x.id !== id));
      setConfirmingId(null);
      router.refresh();
    } catch {
      setError("Failed to delete trade. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = trades.filter((t) => {
    const matchSearch = !search || t.symbol.toLowerCase().includes(search.toLowerCase());
    const matchResult = !filterResult || t.result === filterResult;
    return matchSearch && matchResult;
  });

  const winCount = trades.filter((t) => t.result === "WIN").length;
  const lossCount = trades.filter((t) => t.result === "LOSS").length;
  const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Error Banner */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 12,
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "#f87171",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              padding: 0,
              display: "flex",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Header Card ── */}
      <div
        style={{
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 24,
        }}
      >
        {/* Title Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(56,139,253,0.08)",
                border: "1px solid rgba(56,139,253,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <History className="w-5 h-5" style={{ color: "#388bfd" }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.3px" }}>
                Trades
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "1px 0 0" }}>
                Log and review your trading activity
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => exportCSV()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 12,
                background: "rgba(56,139,253,0.9)",
                border: "1px solid rgba(56,139,253,0.4)",
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(56,139,253,1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(56,139,253,0.9)";
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Trade
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && trades.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              borderRadius: 12,
              overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ padding: "16px 20px", background: "#0d1117", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>
                Total Trades
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#ffffff", lineHeight: 1 }}>
                {trades.length}
              </span>
            </div>
            <div style={{ padding: "16px 20px", background: "#0d1117", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>
                Win / Loss
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                <span style={{ color: "#34d399" }}>{winCount}</span>
                <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 16 }}> / </span>
                <span style={{ color: "#f87171" }}>{lossCount}</span>
              </span>
            </div>
            <div style={{ padding: "16px 20px", background: "#0d1117", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>
                Net P&amp;L
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1,
                  color: totalPnl > 0 ? "#34d399" : totalPnl < 0 ? "#f87171" : "rgba(255,255,255,0.3)",
                }}
              >
                {totalPnl > 0 ? "+" : ""}
                {formatCurrency(totalPnl)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Search + Filters ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 180 }}>
          <Search
            className="absolute"
            style={{
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              width: 15,
              height: 15,
              color: "rgba(255,255,255,0.25)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#0d1117",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "10px 14px 10px 40px",
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              color: "#ffffff",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {RESULT_FILTERS.map((f) => {
            const active = filterResult === f.key;
            const activeStyle =
              f.key === ""
                ? { background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.18)", color: "#ffffff" }
                : f.key === "WIN"
                  ? { background: "rgba(52,211,153,0.1)", borderColor: "rgba(52,211,153,0.3)", color: "#34d399" }
                  : f.key === "LOSS"
                    ? { background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }
                    : { background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)" };
            return (
              <button
                key={f.key}
                onClick={() => setFilterResult(f.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: active ? activeStyle.background : "transparent",
                  border: `1px solid ${active ? activeStyle.borderColor : "transparent"}`,
                  color: active ? activeStyle.color : "rgba(255,255,255,0.4)",
                  fontSize: 10.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                    e.currentTarget.style.borderColor = "transparent";
                  }
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div
        style={{
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={!!search || !!filterResult} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Symbol</th>
                  <th style={thStyle}>Entry</th>
                  <th style={thStyle}>Exit</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Price</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>P / L</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Result</th>
                  <th style={{ ...thStyle, width: 80 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((trade) => {
                  const isDeleting = deletingId === trade.id;
                  const isConfirming = confirmingId === trade.id;
                  const pnl = Number(trade.pnl);
                  const isProfit = pnl > 0;
                  const isLoss = pnl < 0;
                  const pnlColor = isProfit ? "#34d399" : isLoss ? "#f87171" : "rgba(255,255,255,0.3)";

                  return (
                    <tr
                      key={trade.id}
                      className="group"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.12s",
                        opacity: isDeleting ? 0.4 : 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {/* Symbol + Direction */}
                      <td style={tdStyle}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>{trade.symbol}</div>
                        <DirectionChip direction={trade.direction} />
                      </td>

                      {/* Entry */}
                      <td style={tdStyle}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>
                          {formatDatetime(trade.entry_datetime)}
                        </div>
                      </td>

                      {/* Exit */}
                      <td style={tdStyle}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                          {formatDatetime(trade.exit_datetime)}
                        </div>
                      </td>

                      {/* Prices */}
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "#ffffff" }}>
                          {formatCurrency(trade.entry_price)}
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                          &rarr; {formatCurrency(trade.exit_price)}
                        </div>
                      </td>

                      {/* P&L */}
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: pnlColor }}>
                          {isProfit ? "+" : ""}
                          {formatCurrency(pnl)}
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: pnlColor, opacity: 0.6, marginTop: 2 }}>
                          {Number(trade.pnl_percent) > 0 ? "+" : ""}
                          {Number(trade.pnl_percent).toFixed(2)}%
                        </div>
                      </td>

                      {/* Result */}
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <ResultBadge result={trade.result} />
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {isConfirming ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>
                              Sure?
                            </span>
                            <button
                              onClick={() => handleDelete(trade.id)}
                              disabled={isDeleting}
                              style={iconBtnStyle}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "rgba(52,211,153,0.35)";
                                e.currentTarget.style.background = "rgba(52,211,153,0.08)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                              }}
                            >
                              <Check className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
                            </button>
                            <button
                              onClick={() => setConfirmingId(null)}
                              style={iconBtnStyle}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "rgba(248,113,113,0.35)";
                                e.currentTarget.style.color = "#f87171";
                                e.currentTarget.style.background = "rgba(248,113,113,0.08)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="opacity-0 group-hover:opacity-100"
                            style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, transition: "opacity 0.15s" }}
                          >
                            <button style={iconBtnStyle} title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmingId(trade.id)}
                              style={iconBtnStyle}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "rgba(248,113,113,0.35)";
                                e.currentTarget.style.color = "#f87171";
                                e.currentTarget.style.background = "rgba(248,113,113,0.08)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                              }}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Count */}
      {!loading && filtered.length > 0 && (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "right", margin: 0 }}>
          Showing{" "}
          <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{filtered.length}</span> of{" "}
          <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{trades.length}</span> trades
        </p>
      )}

      {/* Quick Add Modal */}
      {showModal && (
        <QuickAddModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadTrades();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
