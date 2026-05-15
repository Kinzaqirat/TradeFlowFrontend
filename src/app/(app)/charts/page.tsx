"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CandlestickChart,
  Gauge,
  Loader2,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react";
import { getSymbolChartData } from "@/services/chartService";
import PriceLineChart from "@/components/chart/PriceLineChart";

interface PricePoint {
  date: string;
  close: number;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

function formatPrice(value: number) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: value > 100 ? 2 : 4,
  })}`;
}

function getErrorMessage(error: unknown) {
  const apiError = error as ApiError;
  return apiError.response?.data?.detail || "Failed to load chart data";
}

export default function ChartsPage() {
  const [symbol, setSymbol] = useState("BTC");
  const [searchInput, setSearchInput] = useState("BTC");
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState("1D");

  const fetchChart = async (sym: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSymbolChartData(sym);
      setChartData(data.prices || []);
      setSymbol(sym);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchChart("BTC");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const first = chartData[0]?.close || 0;
    const last = chartData[chartData.length - 1]?.close || 0;
    const high = chartData.reduce((max, point) => Math.max(max, Number(point.close || 0)), 0);
    const low = chartData.reduce(
      (min, point) => (min === 0 ? Number(point.close || 0) : Math.min(min, Number(point.close || 0))),
      0
    );
    const change = last - first;
    const changePct = first ? (change / first) * 100 : 0;

    return { first, last, high, low, change, changePct };
  }, [chartData]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const nextSymbol = searchInput.trim().toUpperCase();
    if (nextSymbol) fetchChart(nextSymbol);
  };

  const watchlist = ["BTC", "ETH", "AAPL", "TSLA", "EURUSD", "GOLD"];
  const isPositive = stats.change >= 0;
  const DirectionIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <>
      <style>{`
        .charts-root {
          --teal: #00e5b3;
          --cyan: #22d3ee;
          --red: #ff4d6a;
          --amber: #f59e0b;
          --border: rgba(255, 255, 255, 0.065);
          --border-hover: rgba(255, 255, 255, 0.12);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .charts-header {
          align-items: flex-end;
          display: flex;
          gap: 20px;
          justify-content: space-between;
        }

        .charts-kicker {
          color: rgba(0, 229, 179, 0.7);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          margin-bottom: 7px;
          text-transform: uppercase;
        }

        .charts-title {
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1;
          margin: 0 0 7px;
        }

        .charts-subtitle {
          color: rgba(255, 255, 255, 0.36);
          font-size: 12.5px;
        }

        .charts-search {
          min-width: 340px;
          position: relative;
        }

        .charts-search svg {
          color: rgba(255, 255, 255, 0.22);
          left: 15px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        .charts-search input {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 13px;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          height: 44px;
          outline: none;
          padding: 0 14px 0 44px;
          transition: border-color 0.18s;
          width: 100%;
        }

        .charts-search input:focus {
          border-color: rgba(0, 229, 179, 0.36);
        }

        .charts-glass {
          background: linear-gradient(140deg, rgba(14, 20, 34, 0.86) 0%, rgba(10, 18, 32, 0.94) 100%);
          border: 1px solid var(--border);
          border-radius: 20px;
          backdrop-filter: blur(16px);
          overflow: hidden;
          position: relative;
        }

        .charts-glass::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
          content: '';
          height: 1px;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
        }

        .charts-market-strip {
          display: grid;
          gap: 14px;
          grid-template-columns: 1.2fr repeat(3, minmax(0, 1fr));
        }

        .charts-market-card {
          background: rgba(255, 255, 255, 0.032);
          border: 1px solid var(--border);
          border-radius: 16px;
          min-height: 126px;
          overflow: hidden;
          padding: 18px;
          position: relative;
        }

        .charts-market-main {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.7px;
          line-height: 1;
          margin: 18px 0 8px;
        }

        .charts-card-label {
          color: rgba(255, 255, 255, 0.28);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .charts-card-value {
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 18px;
          font-weight: 800;
          margin-top: 18px;
        }

        .charts-card-sub {
          color: rgba(255, 255, 255, 0.34);
          font-size: 11px;
          font-weight: 700;
          margin-top: 7px;
        }

        .charts-toolbar {
          align-items: center;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          padding: 20px 22px;
        }

        .charts-panel-title {
          color: rgba(255, 255, 255, 0.74);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .charts-panel-sub {
          color: rgba(255, 255, 255, 0.27);
          font-size: 11px;
          margin-top: 4px;
        }

        .charts-range {
          align-items: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex;
          gap: 2px;
          padding: 3px;
        }

        .charts-range button {
          appearance: none;
          background: transparent;
          border: 0;
          border-radius: 7px;
          color: rgba(255, 255, 255, 0.34);
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 7px 11px;
          text-transform: uppercase;
        }

        .charts-range button.active {
          background: var(--teal);
          color: #08111f;
        }

        .charts-chart-body {
          min-height: 520px;
          padding: 28px;
          position: relative;
        }

        .charts-chart-body > * {
          min-height: 460px;
        }

        .charts-overlay {
          align-items: center;
          background: rgba(7, 12, 16, 0.44);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          gap: 14px;
          inset: 0;
          justify-content: center;
          position: absolute;
          z-index: 10;
        }

        .charts-state {
          align-items: center;
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          flex-direction: column;
          gap: 14px;
          justify-content: center;
          min-height: 450px;
          text-align: center;
        }

        .charts-retry {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          padding: 10px 16px;
        }

        .charts-watchlist {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(6, minmax(0, 1fr));
        }

        .charts-watch {
          align-items: center;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid var(--border);
          border-radius: 14px;
          color: rgba(255, 255, 255, 0.55);
          display: flex;
          gap: 10px;
          justify-content: space-between;
          min-height: 58px;
          padding: 0 14px;
          transition: border-color 0.18s, background 0.18s, color 0.18s;
        }

        .charts-watch:hover,
        .charts-watch.active {
          background: rgba(0, 229, 179, 0.08);
          border-color: rgba(0, 229, 179, 0.24);
          color: var(--teal);
        }

        .charts-watch span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 800;
        }

        @media (max-width: 1180px) {
          .charts-market-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .charts-watchlist {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .charts-header,
          .charts-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .charts-search {
            min-width: 0;
            width: 100%;
          }

          .charts-market-strip,
          .charts-watchlist {
            grid-template-columns: 1fr;
          }

          .charts-chart-body {
            padding: 22px;
          }

          .charts-range {
            overflow-x: auto;
          }

          .charts-range button {
            flex: 1;
          }
        }
      `}</style>

      <div className="charts-root">
        <div className="charts-header">
          <div>
            <div className="charts-kicker">Market Terminal</div>
            <h2 className="charts-title">Market Charts.</h2>
            <p className="charts-subtitle">Analyze symbol price action, daily close structure, and market momentum.</p>
          </div>

          <form className="charts-search" onSubmit={handleSearch}>
            <Search size={17} />
            <input
              type="text"
              placeholder="Search symbol (BTC, AAPL, GOLD)"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </form>
        </div>

        <section className="charts-market-strip">
          <div className="charts-market-card">
            <div
              aria-hidden="true"
              style={{
                background: `radial-gradient(ellipse at 84% 18%, ${isPositive ? "#00e5b3" : "#ff4d6a"}1c 0%, transparent 68%)`,
                inset: 0,
                position: "absolute",
              }}
            />
            <div style={{ position: "relative" }}>
              <div className="charts-card-label">Active Symbol</div>
              <div className="charts-market-main">{symbol}</div>
              <div style={{ alignItems: "center", color: isPositive ? "#00e5b3" : "#ff4d6a", display: "flex", gap: 5, fontSize: 12, fontWeight: 800 }}>
                <DirectionIcon size={14} />
                {stats.changePct.toFixed(2)}% over loaded history
              </div>
            </div>
          </div>

          {[
            { label: "Last Close", value: formatPrice(stats.last), sub: "Latest candle", icon: CandlestickChart, accent: "#00e5b3" },
            { label: "Range High", value: formatPrice(stats.high), sub: `${chartData.length} data points`, icon: BarChart3, accent: "#22d3ee" },
            { label: "Range Low", value: formatPrice(stats.low), sub: "Loaded window", icon: Gauge, accent: "#f59e0b" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div className="charts-market-card" key={item.label}>
                <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
                  <div className="charts-card-label">{item.label}</div>
                  <Icon color={item.accent} size={18} />
                </div>
                <div className="charts-card-value" style={{ color: item.accent }}>{item.value}</div>
                <div className="charts-card-sub">{item.sub}</div>
              </div>
            );
          })}
        </section>

        <section className="charts-glass">
          <div className="charts-toolbar">
            <div>
              <div className="charts-panel-title">{symbol} Price Action</div>
              <div className="charts-panel-sub">Daily close history and directional momentum</div>
            </div>
            <div className="charts-range" aria-label="Chart range">
              {["1D", "1W", "1M", "3M", "All"].map((range) => (
                <button
                  className={activeRange === range ? "active" : ""}
                  key={range}
                  onClick={() => setActiveRange(range)}
                  type="button"
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="charts-chart-body">
            {loading && (
              <div className="charts-overlay">
                <Loader2 className="animate-spin" color="#00e5b3" size={34} />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Fetching price data</p>
              </div>
            )}

            {error ? (
              <div className="charts-state">
                <div className="rounded-2xl border border-[#ff4d6a]/20 bg-[#ff4d6a]/10 p-4">
                  <Activity color="#ff4d6a" size={32} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Analysis failed</p>
                  <p className="mt-1 max-w-sm text-sm text-white/35">{error}</p>
                </div>
                <button className="charts-retry" onClick={() => fetchChart(symbol)} type="button">
                  Retry Analysis
                </button>
              </div>
            ) : chartData.length > 0 ? (
              <PriceLineChart data={chartData} symbol={symbol} />
            ) : (
              <div className="charts-state">
                <TrendingUp color="rgba(0,229,179,0.72)" size={34} />
                <p className="font-bold text-white">Search for a symbol to load the chart.</p>
              </div>
            )}
          </div>
        </section>

        <section className="charts-watchlist">
          {watchlist.map((item) => (
            <button
              className={`charts-watch${item === symbol ? " active" : ""}`}
              key={item}
              onClick={() => {
                setSearchInput(item);
                fetchChart(item);
              }}
              type="button"
            >
              <span>{item}</span>
              {item === symbol ? <Zap size={15} /> : <ArrowUpRight size={15} />}
            </button>
          ))}
        </section>
      </div>
    </>
  );
}
