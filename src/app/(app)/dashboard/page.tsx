"use client";
import { useEffect, useState } from "react";
import KPICard from "@/components/dashboard/KPICard";
import PnLChart from "@/components/dashboard/PnLChart";
import TradeDistributionChart from "@/components/dashboard/TradeDistributionChart";
import ActiveTradesTable from "@/components/dashboard/ActiveTradesTable";
import { getStats } from "@/services/dashboardService";
import { getTrades } from "@/services/tradeService";
import Link from "next/link";
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  ChevronRight,
  BarChart2,
  Shield,
} from "lucide-react";
import { Trade } from "@/types/trade";
import { useRouter } from "next/navigation";
import QuickAddModal from "@/components/trades/QuickAddModal";
import WinRateDonut from "@/components/dashboard/WinRateDonut";

interface BackendStats {
  summary: {
    total_trades: number;
    total_pnl: number;
    win_rate: number;
    avg_win: number;
    avg_loss: number;
    profit_factor: number;
    max_drawdown: number;
  };
  streaks: Record<string, any>;
  pnl_by_day: Array<{ date: string; pnl: number; trades: number }>;
  pnl_by_symbol: Array<{ symbol: string; pnl: number; trades: number }>;
  result_distribution: Record<string, number>;
}

/* ── Sparkline mini SVG ─────────────────────────────────────────────── */
function Sparkline({ positive = true }: { positive?: boolean }) {
  const points = positive
    ? "0,20 8,16 16,18 24,12 32,14 40,8 48,10 56,4 64,6"
    : "0,6 8,10 16,8 24,14 32,12 40,18 48,16 56,20 64,18";
  return (
    <svg viewBox="0 0 64 24" width="64" height="24" fill="none">
      <polyline
        points={points}
        stroke={positive ? "#00e5b3" : "#ff4d6a"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Metric Card ────────────────────────────────────────────────────── */
interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  icon: React.ReactNode;
  accent?: string;
  sparkline?: boolean;
}
function MetricCard({ label, value, sub, positive, icon, accent = "#00e5b3", sparkline }: MetricCardProps) {
  return (
    <div className="dash-metric-card" style={{ "--accent": accent } as any}>
      <div className="dash-metric-top">
        <span className="dash-metric-icon" style={{ color: accent, background: `${accent}14` }}>
          {icon}
        </span>
        {sparkline !== undefined && <Sparkline positive={positive} />}
      </div>
      <div className="dash-metric-value" style={{ color: positive === false ? "#ff4d6a" : positive === true ? "#00e5b3" : "#fff" }}>
        {value}
      </div>
      <div className="dash-metric-label">{label}</div>
      {sub && (
        <div className="dash-metric-sub" style={{ color: positive === false ? "#ff4d6a" : "#00e5b3" }}>
          {positive !== undefined && (positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />)}
          {sub}
        </div>
      )}
      <div className="dash-metric-glow" style={{ background: `radial-gradient(ellipse at 80% 20%, ${accent}18 0%, transparent 70%)` }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [stats, setStats] = useState<BackendStats | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTimeframe, setActiveTimeframe] = useState("1M");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tradesData] = await Promise.all([
          getStats(),
          getTrades({ page: 1, sort_order: "desc" }),
        ]);
        setStats(statsData);
        setTrades(tradesData.data || []);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="dash-loader">
          <div className="dash-loader-ring" />
          <span className="dash-loader-text">Loading metrics…</span>
        </div>
      </div>
    );
  }

  const summary = stats?.summary ?? {
    total_trades: 0,
    total_pnl: 0,
    win_rate: 0,
    avg_win: 0,
    avg_loss: 0,
    profit_factor: 1,
    max_drawdown: 0,
  };
  const pnlHistory = stats?.pnl_by_day || [];
  const distribution = stats?.result_distribution || {};

  const winRate = (summary.win_rate || 0) / 100;
  const avgWin = summary.avg_win || 0;
  const avgLoss = Math.abs(summary.avg_loss || 0);
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;

  const groupTrades = () => {
    const now = new Date();
    const groups: Record<string, Trade[]> = { Today: [], Yesterday: [], Recent: [] };
    trades.forEach((t) => {
      const date = new Date(t.exit_datetime);
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 0) groups["Today"].push(t);
      else if (diffDays === 1) groups["Yesterday"].push(t);
      else groups["Recent"].push(t);
    });
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  };

  const filteredGroups = groupTrades()
    .map(([label, items]) => [
      label,
      items.filter(
        (t) => !searchQuery || t.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    ] as [string, Trade[]])
    .filter(([, items]) => items.length > 0);

  return (
    <>
      {/* ── Scoped Styles ──────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

        .dash-root {
          font-family: 'DM Sans', sans-serif;
          --teal: #00e5b3;
          --red: #ff4d6a;
          --amber: #f59e0b;
          --cyan: #22d3ee;
          --surface: rgba(12,18,30,0.6);
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(255,255,255,0.12);
        }

        /* ── Glass card ── */
        .dash-glass {
          background: linear-gradient(140deg, rgba(14,20,34,0.85) 0%, rgba(10,18,32,0.92) 100%);
          border: 1px solid var(--border);
          border-radius: 20px;
          backdrop-filter: blur(16px);
          position: relative;
          overflow: hidden;
        }
        .dash-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
        }

        /* ── Main scroll area ── */
        .dash-main {
          flex: 1;
          overflow-y: auto;
          min-width: 0; /* prevent flex blowout */
        }
        .dash-main::-webkit-scrollbar { width: 3px; }
        .dash-main::-webkit-scrollbar-track { background: transparent; }
        .dash-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }

        .dash-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 36px 36px 60px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* ── Page header ── */
        .dash-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .dash-page-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px, 4vw, 30px);
          font-weight: 900;
          letter-spacing: -1px;
          color: #fff;
          margin: 0 0 4px;
        }
        .dash-page-sub {
          font-size: 12.5px;
          color: rgba(255,255,255,0.35);
          font-weight: 400;
        }
        .dash-live-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 10px;
          background: rgba(0,229,179,0.08);
          border: 1px solid rgba(0,229,179,0.18);
          font-size: 10.5px;
          font-weight: 700;
          color: var(--teal);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .dash-live-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--teal);
          animation: live-pulse 1.8s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        /* ── Hero row ── */
        .dash-hero-row {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 20px;
        }

        /* ── Equity card ── */
        .dash-equity-card {
          padding: 36px 36px 32px;
          position: relative;
          overflow: hidden;
        }
        .dash-equity-bg-icon {
          position: absolute;
          right: -20px;
          top: -10px;
          opacity: 0.03;
          pointer-events: none;
        }
        .dash-equity-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.28);
          margin-bottom: 10px;
        }
        .dash-equity-amount {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 900;
          letter-spacing: -2px;
          color: #fff;
          line-height: 1;
          margin-bottom: 8px;
          /* prevent overflow on very small screens */
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dash-equity-change {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          color: var(--teal);
          background: rgba(0,229,179,0.1);
          padding: 4px 10px;
          border-radius: 99px;
        }
        .dash-equity-divider {
          height: 1px;
          background: var(--border);
          margin: 24px 0;
        }
        .dash-equity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .dash-equity-stat-label {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.22);
          margin-bottom: 5px;
        }
        .dash-equity-stat-value {
          font-family: 'Syne', sans-serif;
          font-size: clamp(16px, 2.5vw, 22px);
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        /* ── Strategy card ── */
        .dash-strategy-card {
          padding: 28px 28px 26px;
        }
        .dash-card-heading {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.7);
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .dash-card-tag {
          font-size: 9.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 7px;
          padding: 3px 9px;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .dash-strategy-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0 24px;
          align-items: center;
        }
        .dash-strategy-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px 24px;
        }
        .dash-metric-item-label {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.22);
          margin-bottom: 4px;
        }
        .dash-metric-item-value {
          font-family: 'Syne', sans-serif;
          font-size: clamp(15px, 2vw, 20px);
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        /* ── KPI strip ── */
        .dash-kpi-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .dash-metric-card {
          padding: 20px 20px 18px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: linear-gradient(140deg, rgba(14,20,34,0.8) 0%, rgba(10,18,32,0.88) 100%);
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
          min-width: 0;
        }
        .dash-metric-card:hover { border-color: var(--border-hover); }
        .dash-metric-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .dash-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .dash-metric-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dash-metric-value {
          font-family: 'Syne', sans-serif;
          font-size: clamp(18px, 2.5vw, 26px);
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dash-metric-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.28);
          margin-bottom: 6px;
        }
        .dash-metric-sub {
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        /* ── Chart card ── */
        .dash-chart-card { padding: 28px 28px 24px; }
        .dash-chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 22px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .dash-chart-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.7);
        }
        .dash-chart-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          margin-top: 3px;
        }
        .dash-timeframe-group {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 3px;
          flex-shrink: 0;
          /* scrollable if it gets too tight */
          overflow-x: auto;
          scrollbar-width: none;
        }
        .dash-timeframe-group::-webkit-scrollbar { display: none; }
        .dash-tf-btn {
          padding: 5px 12px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border: none;
          cursor: pointer;
          transition: all 0.18s;
          background: transparent;
          color: rgba(255,255,255,0.35);
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dash-tf-btn:hover { color: rgba(255,255,255,0.7); }
        .dash-tf-btn.active { background: var(--teal); color: #08111f; }

        /* ── Bottom grid ── */
        .dash-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
        }

        .dash-asset-card { padding: 26px; }
        .dash-asset-legend {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 18px;
        }
        .dash-asset-legend-item {
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
        }
        .dash-asset-legend-name {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.22);
          margin-bottom: 3px;
        }
        .dash-asset-legend-count {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
        }

        .dash-activity-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .dash-activity-header {
          padding: 22px 24px 18px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.01);
          flex-wrap: wrap;
          gap: 10px;
        }
        .dash-activity-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: #fff;
        }
        .dash-activity-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          margin-top: 1px;
        }
        .dash-view-all {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--teal);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.18s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dash-view-all:hover { color: #fff; }

        /* ── Loader ── */
        .dash-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .dash-loader-ring {
          width: 36px; height: 36px;
          border: 2px solid rgba(0,229,179,0.15);
          border-top-color: #00e5b3;
          border-radius: 50%;
          animation: reg-spin 0.8s linear infinite;
        }
        @keyframes reg-spin { to { transform: rotate(360deg); } }
        .dash-loader-text {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          font-weight: 500;
          letter-spacing: 0.06em;
        }

        .dash-sep { height: 1px; background: var(--border); }

        /* ─────────────────────────────────────────
           BREAKPOINTS
        ───────────────────────────────────────── */

        /* Large tablet: hero → single column, KPI → 2×2, bottom → stacked */
        @media (max-width: 1024px) {
          .dash-hero-row {
            grid-template-columns: 1fr;
          }

          .dash-kpi-strip {
            grid-template-columns: repeat(2, 1fr);
          }

          .dash-bottom-grid {
            grid-template-columns: 1fr;
          }

          /* Strategy grid: stack donut above metrics */
          .dash-strategy-grid {
            grid-template-columns: 1fr;
            justify-items: center;
            gap: 20px 0;
          }
        }

        /* Tablet: tighten inner padding */
        @media (max-width: 860px) {
          .dash-inner {
            padding: 24px 20px 48px;
            gap: 20px;
          }

          .dash-equity-card {
            padding: 28px 24px 24px;
          }

          .dash-chart-card,
          .dash-strategy-card,
          .dash-asset-card {
            padding: 22px 20px 20px;
          }

          .dash-activity-header {
            padding: 16px 18px 14px;
          }
        }

        /* Mobile: single column KPI strip, minimal padding */
        @media (max-width: 640px) {
          .dash-inner {
            padding: 16px 14px 40px;
            gap: 16px;
          }

          .dash-kpi-strip {
            grid-template-columns: 1fr 1fr; /* 2-col keeps cards readable */
            gap: 10px;
          }

          .dash-metric-card {
            padding: 14px 14px 12px;
          }

          .dash-metric-icon {
            width: 30px;
            height: 30px;
          }

          .dash-equity-card {
            padding: 20px 18px 18px;
          }

          .dash-equity-divider {
            margin: 16px 0;
          }

          .dash-glass {
            border-radius: 14px;
          }

          /* Hide background icon on mobile to avoid clutter */
          .dash-equity-bg-icon {
            display: none;
          }

          .dash-chart-card {
            padding: 18px 14px 16px;
          }

          .dash-asset-legend {
            grid-template-columns: 1fr 1fr;
          }

          /* Timeframe pills scroll horizontally */
          .dash-timeframe-group {
            width: 100%;
          }

          .dash-chart-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        /* Very small phones: full-width single column KPI */
        @media (max-width: 400px) {
          .dash-kpi-strip {
            grid-template-columns: 1fr;
          }

          .dash-equity-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .dash-strategy-metrics {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div
        className="dash-root"
        style={{
          display: "flex",
          height: "calc(100vh - 5rem)",
          overflow: "hidden",
          margin: "-2.5rem",
        }}
      >
        {/* ═══ Main Content ═════════════════════════════════════════ */}
        <main className="dash-main">
          <div className="dash-inner">

            {/* ── Page Header ── */}
            <div className="dash-page-header">
              <div>
                <h1 className="dash-page-title">Performance Hub.</h1>
                <p className="dash-page-sub">Your trading activity and metrics at a glance.</p>
              </div>
              <div className="dash-live-badge">
                <span className="dash-live-dot" />
                Live Market Data
              </div>
            </div>

            {/* ── Top Hero Row ── */}
            <div className="dash-hero-row">

              {/* Equity card */}
              <div className="dash-glass dash-equity-card">
                <div className="dash-equity-bg-icon">
                  <TrendingUp size={220} color="white" />
                </div>
                <div className="dash-equity-label">Account Equity</div>
                <div className="dash-equity-amount">
                  ${(summary.total_pnl || 0).toLocaleString()}
                </div>
                <div>
                  <span className="dash-equity-change">
                    <ArrowUpRight size={13} />
                    +12.4% this month
                  </span>
                </div>
                <div className="dash-equity-divider" />
                <div className="dash-equity-grid">
                  <div>
                    <div className="dash-equity-stat-label">Net Profit</div>
                    <div className="dash-equity-stat-value" style={{ color: "#00e5b3" }}>
                      +${(summary.total_pnl || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="dash-equity-stat-label">Daily Goal</div>
                    <div className="dash-equity-stat-value" style={{ color: "rgba(255,255,255,0.55)" }}>
                      84%
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategy card */}
              <div className="dash-glass dash-strategy-card">
                <div className="dash-card-heading">
                  Strategy Metrics
                  <span className="dash-card-tag">Last 30 Days</span>
                </div>
                <div className="dash-strategy-grid">
                  <WinRateDonut value={summary.win_rate || 0} />
                  <div className="dash-strategy-metrics">
                    <div>
                      <div className="dash-metric-item-label">Profit Factor</div>
                      <div className="dash-metric-item-value">
                        {(summary.profit_factor || 1).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="dash-metric-item-label">Expectancy</div>
                      <div className="dash-metric-item-value" style={{ color: "#00e5b3" }}>
                        ${expectancy.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="dash-metric-item-label">Max Drawdown</div>
                      <div className="dash-metric-item-value" style={{ color: "#ff4d6a" }}>
                        ${Math.abs(summary.max_drawdown || 0).toFixed(0)}
                      </div>
                    </div>
                    <div>
                      <div className="dash-metric-item-label">Total Trades</div>
                      <div className="dash-metric-item-value">
                        {summary.total_trades || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── KPI Strip ── */}
            <div className="dash-kpi-strip">
              <MetricCard
                label="Win Rate"
                value={`${(summary.win_rate || 0).toFixed(1)}%`}
                sub="+3.2% vs last month"
                positive={true}
                icon={<Target size={17} />}
                sparkline={true}
              />
              <MetricCard
                label="Avg Win"
                value={`$${(summary.avg_win || 0).toFixed(0)}`}
                sub="Per winning trade"
                positive={true}
                icon={<TrendingUp size={17} />}
                sparkline={true}
              />
              <MetricCard
                label="Avg Loss"
                value={`$${Math.abs(summary.avg_loss || 0).toFixed(0)}`}
                sub="Per losing trade"
                positive={false}
                icon={<TrendingDown size={17} />}
                accent="#ff4d6a"
                sparkline={false}
              />
              <MetricCard
                label="Expectancy"
                value={`$${expectancy.toFixed(2)}`}
                sub="Edge per trade"
                positive={expectancy >= 0}
                icon={<Zap size={17} />}
                accent="#22d3ee"
              />
            </div>

            {/* ── Equity Chart ── */}
            <div className="dash-glass dash-chart-card">
              <div className="dash-chart-header">
                <div>
                  <div className="dash-chart-title">Growth Analytics</div>
                  <div className="dash-chart-sub">Historical equity curve and drawdown analysis</div>
                </div>
                <div className="dash-timeframe-group">
                  {["1W", "1M", "3M", "All"].map((t) => (
                    <button
                      key={t}
                      className={`dash-tf-btn${activeTimeframe === t ? " active" : ""}`}
                      onClick={() => setActiveTimeframe(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <PnLChart data={pnlHistory} />
            </div>

            {/* ── Bottom Grid ── */}
            <div className="dash-bottom-grid">

              {/* Asset Mix */}
              <div className="dash-glass dash-asset-card">
                <div className="dash-card-heading" style={{ marginBottom: 18 }}>Asset Mix</div>
                <TradeDistributionChart distribution={distribution} />
                <div className="dash-asset-legend">
                  {Object.entries(distribution).slice(0, 4).map(([asset, count]) => (
                    <div key={asset} className="dash-asset-legend-item">
                      <div className="dash-asset-legend-name">{asset}</div>
                      <div className="dash-asset-legend-count">{count as number} Trades</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="dash-glass dash-activity-card">
                <div className="dash-activity-header">
                  <div>
                    <div className="dash-activity-title">Recent Activity.</div>
                    <div className="dash-activity-sub">Your latest journal entries</div>
                  </div>
                  <Link href="/trades" className="dash-view-all">
                    View All <ChevronRight size={12} />
                  </Link>
                </div>
                <div style={{ flex: 1 }}>
                  <ActiveTradesTable trades={trades} />
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ── Quick Add Modal ── */}
      {showQuickAdd && (
        <QuickAddModal
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => {
            setShowQuickAdd(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}