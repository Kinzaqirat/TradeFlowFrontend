"use client";
import { useAuth } from "@/store/authContext";
import AuthGuard from "@/components/layout/AuthGuard";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, ReceiptText, Settings, LineChart, History,
  PieChart, LogOut, User as UserIcon, Bell, Zap, Plus,
  ChevronLeft
} from "lucide-react";
import ChatbotButton from "@/components/chatbot/ChatbotButton";
import QuickAddModal from "@/components/trades/QuickAddModal";
import { useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard",  href: "/dashboard", icon: LayoutDashboard },
    { name: "My Trades",  href: "/trades",    icon: ReceiptText     },
    { name: "Charts",     href: "/charts",    icon: LineChart        },
    { name: "Analytics",  href: "/analytics", icon: PieChart         },
    { name: "History",    href: "/history",   icon: History          },
    { name: "Settings",   href: "/settings",  icon: Settings         },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.href === pathname);
    return item ? item.name : "Dashboard";
  };

  return (
    <AuthGuard>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,700&family=Space+Mono:wght@400;700&display=swap');

        .app-root { font-family: 'DM Sans', sans-serif; }

        /* Sidebar slide transition */
        .sidebar { transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1); }

        /* Nav item hover shimmer */
        .nav-item::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: linear-gradient(90deg, rgba(45,212,191,0.08) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 250ms ease;
        }
        .nav-item:hover::before { opacity: 1; }

        /* Active glow pulse */
        @keyframes dot-pulse {
          0%, 100% { box-shadow: 0 0 6px 1px rgba(45,212,191,0.7); }
          50%       { box-shadow: 0 0 14px 3px rgba(45,212,191,0.4); }
        }
        .active-dot { animation: dot-pulse 2.4s ease-in-out infinite; }

        /* Page fade-in */
        @keyframes page-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .page-animate { animation: page-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        /* Header ADD TRADE button shimmer */
        .add-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: skewX(-15deg);
          transition: left 600ms ease;
        }
        .add-btn:hover::after { left: 150%; }

        /* Tooltip */
        .tooltip {
          position: absolute;
          left: calc(100% + 16px);
          top: 50%;
          transform: translateY(-50%);
          background: #1a2233;
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 5px 12px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 180ms ease;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          z-index: 100;
        }
        .tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: rgba(255,255,255,0.08);
        }
        .nav-item:hover .tooltip { opacity: 1; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(45,212,191,0.2); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(45,212,191,0.4); }
      `}</style>

      <div className="app-root min-h-screen flex bg-[#070c10] text-zinc-100 relative overflow-visible">

        {/* ── Ambient glows ── */}
        <div className="pointer-events-none fixed top-[-20%] left-[-8%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 70%)' }} />
        <div className="pointer-events-none fixed bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }} />

        {/* ══════════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════════ */}
        <aside
          className="sidebar flex flex-col z-50 relative"
          style={{
            width: collapsed ? '80px' : '260px',
            background: 'linear-gradient(180deg, rgba(15,22,32,0.97) 0%, rgba(10,16,24,0.99) 100%)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Subtle inner-left glow strip */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-[1px]"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(45,212,191,0.15) 40%, rgba(45,212,191,0.08) 70%, transparent)' }} />

          {/* ── Brand ── */}
          <div
            className="flex items-center shrink-0 overflow-hidden"
            style={{
              height: 72,
              padding: collapsed ? '0 0 0 20px' : '0 24px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {/* Logo mark */}
            <div
              className="shrink-0 flex items-center justify-center rounded-xl"
              style={{
                width: 40, height: 40,
                background: 'linear-gradient(135deg, rgba(45,212,191,0.15) 0%, rgba(45,212,191,0.05) 100%)',
                border: '1px solid rgba(45,212,191,0.25)',
                boxShadow: '0 0 20px rgba(45,212,191,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <Zap size={18} style={{ color: '#2dd4bf', fill: '#2dd4bf' }} />
            </div>

            {/* Wordmark — hidden when collapsed */}
            <div
              className="overflow-hidden"
              style={{
                maxWidth: collapsed ? 0 : 200,
                opacity: collapsed ? 0 : 1,
                transition: 'max-width 400ms cubic-bezier(0.4,0,0.2,1), opacity 250ms ease',
                marginLeft: 14,
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: '-0.04em', fontStyle: 'italic' }}>
                Trade<span style={{ color: '#2dd4bf' }}>Flow</span>
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.22)', fontWeight: 700, marginTop: -1 }}>
                JOURNAL
              </div>
            </div>
          </div>

          {/* ── Nav ── */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: '20px 12px', scrollbarWidth: 'none' }}>
            {!collapsed && (
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', padding: '0 10px', marginBottom: 14 }}>
                Navigation
              </div>
            )}

            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="nav-item relative flex items-center rounded-[14px] group overflow-hidden"
                    style={{
                      height: 46,
                      padding: collapsed ? '0' : '0 14px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      gap: collapsed ? 0 : 12,
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(45,212,191,0.12) 0%, rgba(45,212,191,0.04) 100%)'
                        : 'transparent',
                      border: isActive
                        ? '1px solid rgba(45,212,191,0.15)'
                        : '1px solid transparent',
                      boxShadow: isActive ? '0 2px 12px rgba(45,212,191,0.06), inset 0 1px 0 rgba(45,212,191,0.08)' : 'none',
                      transition: 'background 250ms ease, border-color 250ms ease, box-shadow 250ms ease',
                    }}
                  >
                    {/* Active left accent */}
                    {isActive && (
                      <div className="absolute left-0 top-[20%] bottom-[20%] rounded-r-full"
                        style={{ width: 3, background: 'linear-gradient(180deg, #2dd4bf, #06b6d4)', boxShadow: '0 0 10px rgba(45,212,191,0.6)' }} />
                    )}

                    <Icon
                      size={18}
                      style={{
                        color: isActive ? '#2dd4bf' : 'rgba(255,255,255,0.32)',
                        flexShrink: 0,
                        transition: 'color 250ms ease',
                        filter: isActive ? 'drop-shadow(0 0 6px rgba(45,212,191,0.5))' : 'none',
                      }}
                      className="group-hover:[color:rgba(255,255,255,0.75)]"
                    />

                    {/* Label */}
                    <span
                      className="overflow-hidden whitespace-nowrap"
                      style={{
                        maxWidth: collapsed ? 0 : 160,
                        opacity: collapsed ? 0 : 1,
                        fontSize: 13.5,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.45)',
                        letterSpacing: '-0.01em',
                        transition: 'max-width 400ms cubic-bezier(0.4,0,0.2,1), opacity 250ms ease, color 250ms ease',
                      }}
                    >
                      {item.name}
                    </span>

                    {/* Active pulse dot */}
                    {isActive && !collapsed && (
                      <div className="active-dot ml-auto rounded-full"
                        style={{ width: 6, height: 6, background: '#2dd4bf', flexShrink: 0 }} />
                    )}

                    {/* Tooltip (collapsed only) */}
                    {collapsed && <span className="tooltip">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* ── Footer ── */}
          <div
            style={{
              padding: '14px 12px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            {/* User card */}
            <div
              className="overflow-hidden"
              style={{
                maxHeight: collapsed ? 0 : 60,
                opacity: collapsed ? 0 : 1,
                marginBottom: collapsed ? 0 : 12,
                transition: 'max-height 400ms cubic-bezier(0.4,0,0.2,1), opacity 250ms ease, margin 300ms ease',
              }}
            >
              <div
                className="flex items-center gap-3 rounded-[14px]"
                style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: 34, height: 34,
                    background: 'linear-gradient(135deg, rgba(45,212,191,0.3), rgba(6,182,212,0.15))',
                    border: '1.5px solid rgba(45,212,191,0.3)',
                    boxShadow: '0 0 12px rgba(45,212,191,0.12)',
                  }}
                >
                  <UserIcon size={14} style={{ color: '#2dd4bf' }} />
                </div>
                <div className="min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.username || "Trader"}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", fontWeight: 700, color: 'rgba(45,212,191,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Pro Member
                  </div>
                </div>
              </div>
            </div>

            {/* Actions row */}
            <div className="flex items-center" style={{ gap: 8, justifyContent: collapsed ? 'center' : 'space-between', flexDirection: collapsed ? 'column' : 'row' }}>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  width: 36, height: 36,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.3)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#2dd4bf'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(45,212,191,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 400ms cubic-bezier(0.4,0,0.2,1)' }} />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  width: 36, height: 36,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.3)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 relative">

          {/* ── Top Header ── */}
          <header
            className="shrink-0 flex items-center justify-between sticky top-0 z-40"
            style={{
              height: 72,
              padding: '0 32px',
              background: 'rgba(7,12,16,0.75)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', lineHeight: 1.1 }}>
                {getPageTitle()}
              </h1>
              <p style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
                Welcome back, <span style={{ color: '#2dd4bf' }}>{user?.username?.split(' ')[0] || "Trader"}</span>
              </p>
            </div>

            <div className="flex items-center" style={{ gap: 16 }}>
              {/* Bell */}
              <button
                className="relative flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  width: 42, height: 42,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.4)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                <Bell size={18} />
                <span
                  className="absolute rounded-full"
                  style={{ top: 10, right: 10, width: 7, height: 7, background: '#ef4444', border: '2px solid #070c10', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }}
                />
              </button>

              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />

              {/* Add Trade CTA */}
              <button
                onClick={() => setShowQuickAdd(true)}
                className="add-btn relative overflow-hidden flex items-center rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  gap: 8,
                  padding: '0 20px',
                  height: 42,
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                  boxShadow: '0 4px 20px rgba(45,212,191,0.25), 0 1px 0 rgba(255,255,255,0.15) inset',
                  color: '#042f2e',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} strokeWidth={3} />
                Add Trade
              </button>
            </div>
          </header>

          {/* ── Page Content ── */}
          <main className="flex-1 overflow-y-auto">
            <div className="page-animate" style={{ padding: '32px', maxWidth: 1600, margin: '0 auto' }}>
              {children}
            </div>
          </main>
        </div>

        {/* ── Modals ── */}
        {showQuickAdd && (
          <QuickAddModal
            onClose={() => setShowQuickAdd(false)}
            onSuccess={() => { setShowQuickAdd(false); router.refresh(); }}
          />
        )}
        <ChatbotButton />
      </div>
    </AuthGuard>
  );
}