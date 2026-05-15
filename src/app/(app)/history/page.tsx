"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  Download,
  History,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";
import { deleteTrade, exportCSV, getTrades } from "@/services/tradeService";
import { Trade } from "@/types/trade";
import TradeTable from "@/components/trades/TradeTable";
import { useRouter } from "next/navigation";

function money(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

export default function HistoryPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "WIN" | "LOSS" | "BREAKEVEN">("ALL");
  const router = useRouter();

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTrades();
      setTrades(res.data);
    } catch {
      setError("Failed to load trade history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => loadTrades(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteTrade(id);
      setTrades((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    } catch (err) {
      console.error("Failed to delete trade", err);
    }
  };

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchesSearch =
        !query ||
        trade.symbol.toLowerCase().includes(query.toLowerCase()) ||
        trade.direction.toLowerCase().includes(query.toLowerCase()) ||
        trade.result.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        activeFilter === "ALL" || trade.result === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, query, trades]);

  const stats = useMemo(() => {
    const totalPnl = trades.reduce(
      (sum, trade) => sum + Number(trade.pnl || 0),
      0
    );
    const wins = trades.filter((t) => t.result === "WIN").length;
    const losses = trades.filter((t) => t.result === "LOSS").length;
    const winRate = trades.length ? (wins / trades.length) * 100 : 0;
    const lastTrade = trades[0]?.exit_datetime;
    return { totalPnl, wins, losses, winRate, lastTrade, total: trades.length };
  }, [trades]);

  const metricCards = [
    {
      label: "Total PnL",
      value: money(stats.totalPnl),
      sub: `${stats.total} journal entries`,
      icon: stats.totalPnl >= 0 ? ArrowUpRight : ArrowDownRight,
      accent: stats.totalPnl >= 0 ? "#00e5b3" : "#ff4d6a",
    },
    {
      label: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      sub: `${stats.wins} wins / ${stats.losses} losses`,
      icon: Target,
      accent: "#22d3ee",
    },
    {
      label: "Audit Range",
      value: stats.lastTrade
        ? new Date(stats.lastTrade).toLocaleDateString()
        : "No data",
      sub: "Most recent exit",
      icon: CalendarRange,
      accent: "#f59e0b",
    },
    {
      label: "Filtered",
      value: filteredTrades.length.toString(),
      sub:
        activeFilter === "ALL"
          ? "Visible records"
          : `${activeFilter.toLowerCase()} records`,
      icon: ShieldCheck,
      accent: "#00e5b3",
    },
  ];

  return (
    <>
      <style>{`
        /* ── Reset / Base ── */
        *, *::before, *::after { box-sizing: border-box; }

        .history-root {
          --teal:   #00e5b3;
          --cyan:   #22d3ee;
          --red:    #ff4d6a;
          --amber:  #f59e0b;
          --border: rgba(255,255,255,0.065);
          --border-hover: rgba(255,255,255,0.12);

          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          min-width: 0;          /* allow shrinking inside flex parents */
        }

        /* ────────────────────────────────────────
           PAGE HEADER
        ──────────────────────────────────────── */
        .history-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .history-header-text {
          flex: 1 1 200px;
          min-width: 0;
        }

        .history-kicker {
          color: rgba(0,229,179,0.7);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .history-title {
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: clamp(20px, 5vw, 32px);
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1;
          margin: 0 0 7px;
          /* graceful truncation if container is very narrow */
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .history-subtitle {
          color: rgba(255,255,255,0.36);
          font-size: 12.5px;
          line-height: 1.55;
          max-width: 480px;
        }

        .history-export {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 42px;
          padding: 0 18px;
          background: linear-gradient(135deg, #00e5b3 0%, #00c9a7 100%);
          border: 0;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,229,179,0.2), inset 0 1px 0 rgba(255,255,255,0.16);
          color: #06131f;
          cursor: pointer;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 0;
          transition: filter 0.18s, transform 0.18s;
        }
        .history-export:hover  { filter: brightness(1.08); }
        .history-export:active { transform: scale(0.98); }

        /* ────────────────────────────────────────
           METRIC CARDS
        ──────────────────────────────────────── */
        .history-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .history-metric {
          position: relative;
          background: rgba(255,255,255,0.032);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px;
          min-height: 136px;
          overflow: hidden;
        }

        .history-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .history-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .history-metric-value {
          font-family: 'Syne', sans-serif;
          font-size: clamp(17px, 2.5vw, 25px);
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .history-metric-label {
          color: rgba(255,255,255,0.28);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .history-metric-sub {
          color: rgba(255,255,255,0.34);
          font-size: 11px;
          font-weight: 700;
          line-height: 1.4;
        }

        /* ────────────────────────────────────────
           GLASS CARD (TABLE WRAPPER)
        ──────────────────────────────────────── */
        .history-glass {
          position: relative;
          background: linear-gradient(140deg, rgba(14,20,34,0.86) 0%, rgba(10,18,32,0.94) 100%);
          border: 1px solid var(--border);
          border-radius: 20px;
          backdrop-filter: blur(16px);
          /* Critical: contain overflow without inheriting it onto the card itself */
          overflow: hidden;
          min-width: 0;
        }

        .history-glass::before {
          content: '';
          position: absolute;
          inset: 0 0 auto;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
        }

        /* ── Toolbar ── */
        .history-toolbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 18px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-wrap: wrap;
        }

        .history-search {
          position: relative;
          flex: 1 1 180px;
          min-width: 0;
        }

        .history-search svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.28);
          pointer-events: none;
          flex-shrink: 0;
        }

        .history-search input {
          width: 100%;
          height: 42px;
          padding: 0 14px 0 42px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          outline: none;
          transition: border-color 0.18s;
        }
        .history-search input::placeholder { color: rgba(255,255,255,0.25); font-weight: 500; }
        .history-search input:focus       { border-color: rgba(0,229,179,0.35); }

        /* Filter pill group — scrollable on very narrow screens */
        .history-filter {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 3px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 10px;
          flex-shrink: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .history-filter::-webkit-scrollbar { display: none; }

        .history-filter button {
          flex-shrink: 0;
          padding: 7px 13px;
          background: transparent;
          border: 0;
          border-radius: 7px;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
          transition: color 0.15s, background 0.15s;
        }
        .history-filter button:hover:not(.active) {
          color: rgba(255,255,255,0.75);
          background: rgba(255,255,255,0.05);
        }
        .history-filter button.active {
          background: var(--teal);
          color: #08111f;
        }

        /* ── Table section ── */
        .history-table-section {
          min-height: 500px;
          /* Horizontal scroll so the inner table never busts the card width */
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* ── States ── */
        .history-empty,
        .history-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          min-height: 430px;
          padding: 0 16px;
          text-align: center;
        }

        .history-empty { color: rgba(255,255,255,0.36); }

        .history-loader-ring {
          width: 36px;
          height: 36px;
          border: 2px solid rgba(0,229,179,0.15);
          border-top-color: var(--teal);
          border-radius: 999px;
          animation: history-spin 0.8s linear infinite;
        }

        .history-count {
          padding: 10px 18px 14px;
          border-top: 1px solid rgba(255,255,255,0.04);
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-align: right;
        }
        .history-count span { color: rgba(255,255,255,0.5); font-weight: 600; }

        @keyframes history-spin { to { transform: rotate(360deg); } }

        /* ════════════════════════════════════════
           BREAKPOINTS
        ════════════════════════════════════════ */

        /* ── ≤ 1120 px  →  2-column metric grid ── */
        @media (max-width: 1120px) {
          .history-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* ── ≤ 860 px  →  stack toolbar ── */
        @media (max-width: 860px) {
          .history-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .history-search { flex: none; width: 100%; }

          /* Filter stretches full width; pills share the space equally */
          .history-filter {
            width: 100%;
          }
          .history-filter button {
            flex: 1;
            text-align: center;
          }
        }

        /* ── ≤ 640 px  →  mobile layout ── */
        @media (max-width: 640px) {
          .history-root { gap: 16px; }

          .history-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }

          /* Export button fills the row */
          .history-export {
            width: 100%;
            justify-content: center;
          }

          .history-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .history-metric {
            padding: 14px;
            min-height: 110px;
          }

          .history-metric-top { margin-bottom: 14px; }

          .history-icon { width: 30px; height: 30px; }

          .history-glass   { border-radius: 14px; }
          .history-toolbar { padding: 14px 14px 12px; }

          .history-table-section { min-height: 380px; }
          .history-empty,
          .history-loader        { min-height: 340px; }
        }

        /* ── ≤ 400 px  →  single-column metric cards ── */
        @media (max-width: 400px) {
          .history-metrics {
            grid-template-columns: 1fr;
          }

          .history-metric { min-height: auto; }

          /* On very tight screens let the title wrap instead of clipping */
          .history-title {
            white-space: normal;
            font-size: 22px;
          }
        }
      `}</style>

      <div className="history-root">
        {/* ── Page Header ── */}
        <div className="history-header">
          <div className="history-header-text">
            <div className="history-kicker">Journal Archive</div>
            <h2 className="history-title">Trade History.</h2>
            <p className="history-subtitle">
              Review historical trades, audit outcomes, and export your
              performance log.
            </p>
          </div>
          <button
            className="history-export"
            onClick={() => exportCSV()}
            type="button"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* ── Metric Cards ── */}
        <section className="history-metrics">
          {metricCards.map((item) => {
            const Icon = item.icon;
            return (
              <div className="history-metric" key={item.label}>
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse at 84% 18%, ${item.accent}18 0%, transparent 68%)`,
                  }}
                />
                <div style={{ position: "relative" }}>
                  <div className="history-metric-top">
                    <span
                      className="history-icon"
                      style={{ background: `${item.accent}14`, color: item.accent }}
                    >
                      <Icon size={18} />
                    </span>
                    <History color="rgba(255,255,255,0.14)" size={18} />
                  </div>
                  <div className="history-metric-value" style={{ color: item.accent }}>
                    {item.value}
                  </div>
                  <div className="history-metric-label">{item.label}</div>
                  <div className="history-metric-sub">{item.sub}</div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Table Glass Card ── */}
        <section className="history-glass">
          {/* Toolbar */}
          <div className="history-toolbar">
            <div className="history-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search symbol, direction, or result…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="history-filter" aria-label="Trade result filter">
              {(["ALL", "WIN", "LOSS", "BREAKEVEN"] as const).map((f) => (
                <button
                  key={f}
                  className={activeFilter === f ? "active" : ""}
                  onClick={() => setActiveFilter(f)}
                  type="button"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="history-table-section">
            {loading ? (
              <div className="history-loader">
                <div className="history-loader-ring" />
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.3)",
                    margin: 0,
                  }}
                >
                  Loading history
                </p>
              </div>
            ) : error ? (
              <div className="history-empty">
                <p style={{ fontWeight: 700, color: "#ff4d6a", margin: 0 }}>{error}</p>
                <button className="history-export" onClick={loadTrades} type="button">
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <TradeTable trades={filteredTrades} onDelete={handleDelete} />
                {filteredTrades.length > 0 && (
                  <div className="history-count">
                    Showing <span>{filteredTrades.length}</span> of{" "}
                    <span>{trades.length}</span> trades
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}