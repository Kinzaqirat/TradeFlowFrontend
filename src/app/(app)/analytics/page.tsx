"use client";
import { useState, useEffect } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  CalendarRange,
  Gauge,
  PieChart,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { getStats } from "@/services/dashboardService";
import WinRateDonut from "@/components/dashboard/WinRateDonut";
import PnLChart from "@/components/dashboard/PnLChart";
import TradeDistributionChart from "@/components/dashboard/TradeDistributionChart";

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
  pnl_by_day: Array<{ date: string; pnl: number; trades: number }>;
  result_distribution: Record<string, number>;
}

function Sparkline({ positive = true }: { positive?: boolean }) {
  const points = positive
    ? "0,20 9,17 18,18 27,12 36,14 45,8 54,10 64,4"
    : "0,6 9,10 18,8 27,14 36,12 45,18 54,16 64,20";

  return (
    <svg viewBox="0 0 64 24" width="64" height="24" fill="none" aria-hidden="true">
      <polyline
        points={points}
        stroke={positive ? "#00e5b3" : "#ff4d6a"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function formatMoney(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<BackendStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState("30D");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getStats();
        setStats(data);
      } catch {
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Analyzing Data...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-400 font-medium mb-4">{error || "Data unavailable"}</p>
        <button onClick={() => window.location.reload()} className="text-emerald-400 text-sm font-bold hover:underline">Retry</button>
      </div>
    );
  }

  const { summary, pnl_by_day, result_distribution } = stats;
  const winRate = summary.win_rate || 0;
  const avgWin = summary.avg_win || 0;
  const avgLoss = Math.abs(summary.avg_loss || 0);
  const expectancy = (winRate / 100) * avgWin - (1 - winRate / 100) * avgLoss;
  const totalPnl = summary.total_pnl || 0;
  const profitFactor = summary.profit_factor || 0;
  const maxDrawdown = Math.abs(summary.max_drawdown || 0);
  const lossRate = Math.max(0, 100 - winRate);
  const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? avgWin : 0;
  const edgeScore = Math.max(
    0,
    Math.min(100, winRate * 0.45 + Math.min(profitFactor, 3) * 15 + Math.max(expectancy, 0) * 0.08)
  );
  const bestDay = pnl_by_day.reduce(
    (best, item) => (Number(item.pnl || 0) > best.pnl ? { date: item.date, pnl: Number(item.pnl || 0) } : best),
    { date: "", pnl: 0 }
  );
  const worstDay = pnl_by_day.reduce(
    (worst, item) => (Number(item.pnl || 0) < worst.pnl ? { date: item.date, pnl: Number(item.pnl || 0) } : worst),
    { date: "", pnl: 0 }
  );

  const metricCards = [
    {
      label: "Win Ratio",
      value: `${winRate.toFixed(1)}%`,
      sub: `${lossRate.toFixed(1)}% loss rate`,
      icon: Target,
      accent: "#00e5b3",
      positive: winRate >= 50,
    },
    {
      label: "Profit Factor",
      value: profitFactor.toFixed(2),
      sub: profitFactor >= 1.5 ? "Healthy edge" : "Needs review",
      icon: TrendingUp,
      accent: "#22d3ee",
      positive: profitFactor >= 1,
    },
    {
      label: "Expectancy",
      value: `$${expectancy.toFixed(2)}`,
      sub: "Average edge per trade",
      icon: Zap,
      accent: expectancy >= 0 ? "#00e5b3" : "#ff4d6a",
      positive: expectancy >= 0,
    },
    {
      label: "Total PnL",
      value: formatMoney(totalPnl),
      sub: `${summary.total_trades || 0} closed trades`,
      icon: Activity,
      accent: totalPnl >= 0 ? "#00e5b3" : "#ff4d6a",
      positive: totalPnl >= 0,
    },
  ];

  return (
    <>
      <style>{`
        .analytics-root {
          --teal: #00e5b3;
          --cyan: #22d3ee;
          --red: #ff4d6a;
          --amber: #f59e0b;
          --surface: rgba(12, 18, 30, 0.72);
          --border: rgba(255, 255, 255, 0.065);
          --border-hover: rgba(255, 255, 255, 0.12);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .analytics-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .analytics-kicker {
          color: rgba(0, 229, 179, 0.7);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          margin-bottom: 7px;
          text-transform: uppercase;
        }

        .analytics-title {
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1;
          margin: 0 0 7px;
        }

        .analytics-subtitle {
          color: rgba(255, 255, 255, 0.36);
          font-size: 12.5px;
        }

        .analytics-actions {
          align-items: center;
          display: flex;
          gap: 10px;
        }

        .analytics-live {
          align-items: center;
          background: rgba(0, 229, 179, 0.08);
          border: 1px solid rgba(0, 229, 179, 0.18);
          border-radius: 10px;
          color: var(--teal);
          display: flex;
          font-size: 10px;
          font-weight: 800;
          gap: 7px;
          letter-spacing: 0.1em;
          padding: 8px 13px;
          text-transform: uppercase;
        }

        .analytics-live-dot {
          animation: analytics-pulse 1.8s ease-in-out infinite;
          background: var(--teal);
          border-radius: 999px;
          height: 7px;
          width: 7px;
        }

        @keyframes analytics-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.86); }
        }

        .analytics-range {
          align-items: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex;
          gap: 2px;
          padding: 3px;
        }

        .analytics-range button {
          border: 0;
          border-radius: 7px;
          color: rgba(7, 3, 3, 0.34);
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 6px 11px;
          text-transform: uppercase;
          transition: background 0.18s, color 0.18s;
        }

        .analytics-range button:hover {
          color: rgba(255, 255, 255, 0.72);
        }

        .analytics-range button.active {
          background: var(--teal);
          color: #08111f;
        }

        .analytics-glass {
          background: linear-gradient(140deg, rgba(14, 20, 34, 0.86) 0%, rgba(10, 18, 32, 0.94) 100%);
          border: 1px solid var(--border);
          border-radius: 20px;
          backdrop-filter: blur(16px);
          overflow: hidden;
          position: relative;
        }

        .analytics-glass::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
          content: '';
          height: 1px;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
        }

        .analytics-hero {
          display: grid;
          gap: 20px;
          grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
        }

        .analytics-edge-card {
          min-height: 250px;
          padding: 30px;
        }

        .analytics-bg-icon {
          color: #fff;
          opacity: 0.03;
          pointer-events: none;
          position: absolute;
          right: -28px;
          top: -18px;
        }

        .analytics-eyebrow {
          color: rgba(255, 255, 255, 0.28);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.2em;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .analytics-edge-value {
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 58px;
          font-weight: 900;
          letter-spacing: -2px;
          line-height: 1;
        }

        .analytics-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 16px;
        }

        .analytics-chip {
          align-items: center;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid var(--border);
          border-radius: 999px;
          color: rgba(255, 255, 255, 0.5);
          display: inline-flex;
          font-size: 11px;
          font-weight: 700;
          gap: 6px;
          padding: 6px 10px;
        }

        .analytics-chip.good {
          background: rgba(0, 229, 179, 0.09);
          border-color: rgba(0, 229, 179, 0.18);
          color: var(--teal);
        }

        .analytics-edge-grid {
          border-top: 1px solid var(--border);
          display: grid;
          gap: 0;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 26px;
          padding-top: 22px;
        }

        .analytics-edge-stat {
          border-right: 1px solid var(--border);
          padding-right: 18px;
        }

        .analytics-edge-stat:last-child {
          border-right: 0;
          padding-left: 18px;
          padding-right: 0;
        }

        .analytics-stat-label {
          color: rgba(255, 255, 255, 0.23);
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.16em;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .analytics-stat-value {
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 17px;
          font-weight: 800;
        }

        .analytics-panel {
          padding: 26px;
        }

        .analytics-panel-head {
          align-items: flex-start;
          display: flex;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .analytics-panel-title {
          color: rgba(255, 255, 255, 0.74);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .analytics-panel-sub {
          color: rgba(255, 255, 255, 0.27);
          font-size: 11px;
          margin-top: 4px;
        }

        .analytics-tag {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 7px;
          color: rgba(255, 255, 255, 0.3);
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 4px 9px;
          text-transform: uppercase;
        }

        .analytics-score-wrap {
          align-items: center;
          display: grid;
          gap: 24px;
          grid-template-columns: auto 1fr;
        }

        .analytics-score-metrics {
          display: grid;
          gap: 10px;
        }

        .analytics-score-item {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid var(--border);
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          padding: 12px 14px;
        }

        .analytics-score-item span:first-child {
          color: rgba(255, 255, 255, 0.28);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .analytics-score-item span:last-child {
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 800;
        }

        .analytics-metrics {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .analytics-metric {
          background: rgba(255, 255, 255, 0.032);
          border: 1px solid var(--border);
          border-radius: 16px;
          min-height: 154px;
          overflow: hidden;
          padding: 18px;
          position: relative;
          transition: border-color 0.18s, transform 0.18s;
        }

        .analytics-metric:hover {
          border-color: var(--border-hover);
          transform: translateY(-2px);
        }

        .analytics-metric-top {
          align-items: center;
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .analytics-icon {
          align-items: center;
          border-radius: 12px;
          display: flex;
          height: 36px;
          justify-content: center;
          width: 36px;
        }

        .analytics-metric-value {
          font-family: 'Syne', sans-serif;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 7px;
        }

        .analytics-metric-label {
          color: rgba(255, 255, 255, 0.28);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .analytics-metric-sub {
          align-items: center;
          display: flex;
          font-size: 11px;
          font-weight: 700;
          gap: 4px;
        }

        .analytics-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
        }

        .analytics-chart {
          padding: 28px;
        }

        .analytics-chart-wrap {
          min-height: 350px;
        }

        .analytics-distribution-body {
          align-items: center;
          display: flex;
          justify-content: center;
          min-height: 330px;
        }

        .analytics-brief-grid {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-top: 18px;
        }

        .analytics-brief {
          background: rgba(255, 255, 255, 0.032);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 13px 14px;
        }

        @media (max-width: 1180px) {
          .analytics-hero,
          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .analytics-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .analytics-header {
            align-items: stretch;
            flex-direction: column;
          }

          .analytics-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .analytics-range {
            justify-content: space-between;
          }

          .analytics-range button {
            flex: 1;
          }

          .analytics-edge-card,
          .analytics-panel,
          .analytics-chart {
            padding: 22px;
          }

          .analytics-edge-value {
            font-size: 44px;
          }

          .analytics-edge-grid,
          .analytics-metrics,
          .analytics-brief-grid {
            grid-template-columns: 1fr;
          }

          .analytics-edge-stat,
          .analytics-edge-stat:last-child {
            border-right: 0;
            border-top: 1px solid var(--border);
            padding: 14px 0 0;
          }

          .analytics-edge-stat:first-child {
            border-top: 0;
            padding-top: 0;
          }

          .analytics-score-wrap {
            grid-template-columns: 1fr;
            justify-items: center;
          }
        }
      `}</style>

      <div className="analytics-root">
        <div className="analytics-header">
          <div>
            <div className="analytics-kicker">Performance Intelligence</div>
            <h2 className="analytics-title">Deep Analytics.</h2>
            <p className="analytics-subtitle">Statistical breakdown of trading performance, risk, and edge quality.</p>
          </div>

          <div className="analytics-actions">
            <div className="analytics-range" aria-label="Analytics time range">
              {["7D", "30D", "90D", "All"].map((range) => (
                <button
                  key={range}
                  className={activeRange === range ? "active" : ""}
                  onClick={() => setActiveRange(range)}
                  type="button"
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="analytics-live">
              <span className="analytics-live-dot" />
              Synced Metrics
            </div>
          </div>
        </div>

        <div className="analytics-hero">
          <section className="analytics-glass analytics-edge-card">
            <BarChart2 className="analytics-bg-icon" size={230} />
            <div className="analytics-eyebrow">Edge Score</div>
            <div className="analytics-edge-value">{edgeScore.toFixed(0)}%</div>
            <div className="analytics-chip-row">
              <span className={`analytics-chip${expectancy >= 0 ? " good" : ""}`}>
                {expectancy >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {expectancy >= 0 ? "Positive expectancy" : "Negative expectancy"}
              </span>
              <span className="analytics-chip">
                <CalendarRange size={13} />
                {activeRange} window
              </span>
              <span className="analytics-chip">
                <Shield size={13} />
                {summary.total_trades || 0} sample trades
              </span>
            </div>

            <div className="analytics-edge-grid">
              <div className="analytics-edge-stat">
                <div className="analytics-stat-label">Avg Win</div>
                <div className="analytics-stat-value" style={{ color: "#00e5b3" }}>
                  ${avgWin.toFixed(0)}
                </div>
              </div>
              <div className="analytics-edge-stat" style={{ paddingLeft: 18 }}>
                <div className="analytics-stat-label">Avg Loss</div>
                <div className="analytics-stat-value" style={{ color: "#ff4d6a" }}>
                  ${avgLoss.toFixed(0)}
                </div>
              </div>
              <div className="analytics-edge-stat">
                <div className="analytics-stat-label">Payoff Ratio</div>
                <div className="analytics-stat-value">{payoffRatio.toFixed(2)}x</div>
              </div>
            </div>
          </section>

          <section className="analytics-glass analytics-panel">
            <div className="analytics-panel-head">
              <div>
                <div className="analytics-panel-title">Strategy Health</div>
                <div className="analytics-panel-sub">Win rate, drawdown, and reward balance</div>
              </div>
              <span className="analytics-tag">Live</span>
            </div>
            <div className="analytics-score-wrap">
              <WinRateDonut value={winRate} />
              <div className="analytics-score-metrics">
                <div className="analytics-score-item">
                  <span>Max Drawdown</span>
                  <span style={{ color: "#ff4d6a" }}>${maxDrawdown.toFixed(0)}</span>
                </div>
                <div className="analytics-score-item">
                  <span>Profit Factor</span>
                  <span style={{ color: profitFactor >= 1 ? "#00e5b3" : "#ff4d6a" }}>{profitFactor.toFixed(2)}</span>
                </div>
                <div className="analytics-score-item">
                  <span>Expectancy</span>
                  <span style={{ color: expectancy >= 0 ? "#00e5b3" : "#ff4d6a" }}>${expectancy.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="analytics-metrics">
          {metricCards.map((item) => {
            const Icon = item.icon;
            const ValueIcon = item.positive ? ArrowUpRight : ArrowDownRight;
            return (
              <div className="analytics-metric" key={item.label}>
                <div
                  aria-hidden="true"
                  style={{
                    background: `radial-gradient(ellipse at 84% 18%, ${item.accent}18 0%, transparent 68%)`,
                    inset: 0,
                    position: "absolute",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <div className="analytics-metric-top">
                    <span className="analytics-icon" style={{ background: `${item.accent}14`, color: item.accent }}>
                      <Icon size={18} />
                    </span>
                    <Sparkline positive={item.positive} />
                  </div>
                  <div className="analytics-metric-value" style={{ color: item.accent }}>
                    {item.value}
                  </div>
                  <div className="analytics-metric-label">{item.label}</div>
                  <div className="analytics-metric-sub" style={{ color: item.positive ? "#00e5b3" : "#ff4d6a" }}>
                    <ValueIcon size={12} />
                    {item.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <div className="analytics-grid">
          <section className="analytics-glass analytics-panel">
            <div className="analytics-panel-head">
              <div>
                <div className="analytics-panel-title">Outcome Mix</div>
                <div className="analytics-panel-sub">Win, loss, and breakeven distribution</div>
              </div>
              <PieChart color="#00e5b3" size={18} />
            </div>
            <div className="analytics-distribution-body">
              <TradeDistributionChart distribution={result_distribution} />
            </div>
          </section>

          <section className="analytics-glass analytics-panel">
            <div className="analytics-panel-head">
              <div>
                <div className="analytics-panel-title">Risk Snapshot</div>
                <div className="analytics-panel-sub">Fast diagnostics from the current data set</div>
              </div>
              <Gauge color="#22d3ee" size={18} />
            </div>

            <div className="analytics-brief-grid">
              <div className="analytics-brief">
                <div className="analytics-stat-label">Best Day</div>
                <div className="analytics-stat-value" style={{ color: "#00e5b3" }}>
                  {formatMoney(bestDay.pnl)}
                </div>
                <div className="analytics-panel-sub">{bestDay.date || "No data yet"}</div>
              </div>
              <div className="analytics-brief">
                <div className="analytics-stat-label">Worst Day</div>
                <div className="analytics-stat-value" style={{ color: "#ff4d6a" }}>
                  {formatMoney(worstDay.pnl)}
                </div>
                <div className="analytics-panel-sub">{worstDay.date || "No data yet"}</div>
              </div>
              <div className="analytics-brief">
                <div className="analytics-stat-label">Risk Bias</div>
                <div className="analytics-stat-value">
                  {profitFactor >= 1.5 ? "Controlled" : profitFactor >= 1 ? "Neutral" : "Defensive"}
                </div>
                <div className="analytics-panel-sub">Based on profit factor</div>
              </div>
              <div className="analytics-brief">
                <div className="analytics-stat-label">Trend Quality</div>
                <div className="analytics-stat-value">
                  {edgeScore >= 70 ? "Strong" : edgeScore >= 45 ? "Developing" : "Weak"}
                </div>
                <div className="analytics-panel-sub">Composite analytics score</div>
              </div>
            </div>
          </section>
        </div>

        <section className="analytics-glass analytics-chart">
          <div className="analytics-panel-head">
            <div>
              <div className="analytics-panel-title">Equity Growth Curve</div>
              <div className="analytics-panel-sub">Cumulative PnL performance over time</div>
            </div>
            <span className="analytics-tag">
              <TrendingDown size={12} style={{ display: "inline", marginRight: 5 }} />
              Drawdown aware
            </span>
          </div>
          <div className="analytics-chart-wrap">
            <PnLChart data={pnl_by_day} />
          </div>
        </section>
      </div>
    </>
  );
}
