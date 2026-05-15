"use client";

import Link from "next/link";
import { ArrowRight, LogIn, TrendingUp, BarChart2, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative h-screen flex items-center justify-center bg-[#040c0e] px-6 overflow-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        body { font-family: 'Syne', sans-serif; }

        @keyframes orb-drift {
          0%   { transform: translate(0, 0)       scale(1);    }
          100% { transform: translate(30px, -20px) scale(1.05); }
        }
        @keyframes grid-fade {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.75; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0   rgba(45,212,191,0.45); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 8px rgba(45,212,191,0);    }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0   rgba(45,212,191,0);    }
        }
        @keyframes ticker {
          0%   { transform: translateX(0);    }
          100% { transform: translateX(-50%); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1;   }
        }

        .fade-up-1 { animation: fade-up 0.6s ease forwards; animation-delay: 0.10s; opacity: 0; }
        .fade-up-2 { animation: fade-up 0.6s ease forwards; animation-delay: 0.25s; opacity: 0; }
        .fade-up-3 { animation: fade-up 0.6s ease forwards; animation-delay: 0.40s; opacity: 0; }
        .fade-up-4 { animation: fade-up 0.6s ease forwards; animation-delay: 0.55s; opacity: 0; }
        .fade-up-5 { animation: fade-up 0.6s ease forwards; animation-delay: 0.70s; opacity: 0; }

        .btn-primary { position: relative; overflow: hidden; }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }

        .logo-glow {
          animation: pulse-ring 2.5s cubic-bezier(0.455,0.03,0.515,0.955) infinite;
        }

        .stat-card { transition: border-color 0.2s ease, background 0.2s ease; }
        .stat-card:hover {
          border-color: rgba(45,212,191,0.28) !important;
          background:   rgba(45,212,191,0.07) !important;
        }

        .ticker-wrap {
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
        }
        .ticker-track {
          display: flex;
          gap: 32px;
          width: max-content;
          animation: ticker 20s linear infinite;
        }

        .top-glow { animation: glow-breathe 3s ease-in-out infinite; }
      `}</style>

      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(45,212,191,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45,212,191,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          animation: "grid-fade 6s ease-in-out infinite",
        }}
      />

      {/* Orb 1 — teal top-left */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 440, height: 440,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,212,191,0.13) 0%, transparent 70%)",
          top: "3%", left: "3%",
          filter: "blur(72px)",
          animation: "orb-drift 8s ease-in-out infinite alternate",
        }}
      />

      {/* Orb 2 — cyan bottom-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 340, height: 340,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)",
          bottom: "8%", right: "6%",
          filter: "blur(64px)",
          animation: "orb-drift 10s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* Orb 3 — deep teal accent */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 260, height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)",
          bottom: "28%", left: "12%",
          filter: "blur(60px)",
          animation: "orb-drift 12s ease-in-out infinite alternate",
        }}
      />

      {/* Ticker Bar */}
      <div className="absolute top-0 left-0 right-0 border-b border-white/[0.04] py-2 ticker-wrap">
        <div className="ticker-track">
          {[
            { sym: "BTC/USD", val: "+2.41%", pos: true  },
            { sym: "ETH/USD", val: "-0.87%", pos: false },
            { sym: "SPY",     val: "+0.63%", pos: true  },
            { sym: "AAPL",    val: "+1.12%", pos: true  },
            { sym: "TSLA",    val: "-3.24%", pos: false },
            { sym: "NVDA",    val: "+4.58%", pos: true  },
            { sym: "GOLD",    val: "+0.21%", pos: true  },
            { sym: "BTC/USD", val: "+2.41%", pos: true  },
            { sym: "ETH/USD", val: "-0.87%", pos: false },
            { sym: "SPY",     val: "+0.63%", pos: true  },
            { sym: "AAPL",    val: "+1.12%", pos: true  },
            { sym: "TSLA",    val: "-3.24%", pos: false },
            { sym: "NVDA",    val: "+4.58%", pos: true  },
            { sym: "GOLD",    val: "+0.21%", pos: true  },
          ].map((t, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.05em",
                color: t.pos ? "rgba(45,212,191,0.8)" : "rgba(255,90,90,0.75)",
                whiteSpace: "nowrap",
              }}
            >
              {t.sym}{" "}
              <span style={{ color: t.pos ? "rgba(20,184,166,0.6)" : "rgba(255,90,90,0.5)" }}>
                {t.val}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div
        className="relative w-full"
        style={{
          maxWidth: 428,
          borderRadius: 32,
          border: "1px solid rgba(45,212,191,0.1)",
          background: "linear-gradient(160deg, rgba(45,212,191,0.05) 0%, rgba(4,14,16,0.96) 65%)",
          backdropFilter: "blur(48px)",
          padding: "40px 36px 36px",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(45,212,191,0.05), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Top edge glow line */}
        <div
          className="top-glow pointer-events-none absolute left-8 right-8 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(45,212,191,0.5), transparent)",
          }}
        />

        {/* Top-right corner glow */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: 150, height: 150,
            borderRadius: "0 32px 0 0",
            background: "radial-gradient(circle at top right, rgba(45,212,191,0.08), transparent 70%)",
          }}
        />

        {/* Bottom-left corner glow */}
        <div
          className="absolute bottom-0 left-0 pointer-events-none"
          style={{
            width: 110, height: 110,
            borderRadius: "0 0 0 32px",
            background: "radial-gradient(circle at bottom left, rgba(6,182,212,0.06), transparent 70%)",
          }}
        />

        {/* ── Top row: Logo + Live badge ── */}
        <div className="fade-up-1 flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="logo-glow flex items-center justify-center"
              style={{
                width: 52, height: 52,
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(45,212,191,0.22), rgba(45,212,191,0.06))",
                border: "1px solid rgba(45,212,191,0.3)",
                fontFamily: "'DM Serif Display', serif",
                fontSize: 26,
                fontStyle: "italic",
                color: "#2dd4bf",
              }}
            >
              T
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                Trade<span style={{ color: "#2dd4bf" }}>Flow</span>
              </h1>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.3em",
                  color: "rgba(255,255,255,0.28)",
                  marginTop: 5,
                  textTransform: "uppercase",
                }}
              >
                Journal & Analytics
              </p>
            </div>
          </div>

          {/* Live badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(45,212,191,0.07)",
              border: "1px solid rgba(45,212,191,0.18)",
            }}
          >
            <div
              style={{
                width: 6, height: 6,
                borderRadius: "50%",
                background: "#2dd4bf",
                boxShadow: "0 0 8px #2dd4bf",
                animation: "pulse-ring 2s infinite",
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "rgba(45,212,191,0.85)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Live
            </span>
          </div>
        </div>

        {/* ── Headline ── */}
        <div className="fade-up-2" style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 32,
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              marginBottom: 12,
            }}
          >
            Track every trade.{" "}
            <span style={{ color: "#2dd4bf", fontStyle: "italic" }}>
              Master
            </span>{" "}
            every market.
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.38)",
              lineHeight: 1.75,
              fontWeight: 400,
            }}
          >
            High-performance analytics and journaling built for serious traders.
            Sign in to monitor your equity flow and sharpen your edge.
          </p>
        </div>

        {/* ── Stats Row ── */}
        <div
          className="fade-up-3"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 28,
          }}
        >
          {[
            { icon: <TrendingUp size={14} />, label: "Win Rate", value: "68.4%" },
            { icon: <BarChart2  size={14} />, label: "Avg R:R",  value: "2.3x"  },
            { icon: <Shield     size={14} />, label: "Max DD",   value: "4.1%"  },
          ].map((stat, i) => (
            <div
              key={i}
              className="stat-card"
              style={{
                borderRadius: 14,
                border: "1px solid rgba(45,212,191,0.08)",
                background: "rgba(45,212,191,0.03)",
                padding: "12px 10px",
                textAlign: "center",
                cursor: "default",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  color: "rgba(45,212,191,0.65)",
                  marginBottom: 6,
                }}
              >
                {stat.icon}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#fff",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.28)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div
          className="fade-up-3"
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(45,212,191,0.14), transparent)",
            marginBottom: 28,
          }}
        />

        {/* ── Action Buttons ── */}
        <div
          className="fade-up-4"
          style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}
        >
          <Link
            href="/login"
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: 14,
              background: "linear-gradient(135deg, #2dd4bf, #06b6d4)",
              padding: "15px 24px",
              fontSize: 14,
              fontWeight: 700,
              color: "#021a18",
              letterSpacing: "0.01em",
              textDecoration: "none",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              boxShadow:
                "0 8px 32px rgba(45,212,191,0.28), 0 2px 8px rgba(45,212,191,0.14)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 12px 40px rgba(45,212,191,0.42), 0 4px 12px rgba(45,212,191,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 8px 32px rgba(45,212,191,0.28), 0 2px 8px rgba(45,212,191,0.14)";
            }}
          >
            <LogIn size={16} />
            Login to Dashboard
          </Link>

          <Link
            href="/register"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: 14,
              border: "1px solid rgba(45,212,191,0.12)",
              background: "rgba(45,212,191,0.04)",
              padding: "15px 24px",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.01em",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(45,212,191,0.09)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,212,191,0.28)";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(45,212,191,0.04)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,212,191,0.12)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
            }}
          >
            Create Free Account
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* ── Footer note ── */}
        <div
          className="fade-up-5"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Shield size={11} style={{ color: "rgba(45,212,191,0.3)" }} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.18)",
              letterSpacing: "0.08em",
            }}
          >
            256-bit encrypted · No card required
          </span>
        </div>
      </div>

      {/* Bottom version tag */}
      <div
        className="absolute bottom-5"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.13)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        V 1.2 — Stable Build
      </div>
    </div>
  );
}