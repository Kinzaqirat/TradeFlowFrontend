"use client";
import { useAuth } from "@/store/authContext";
import AuthGuard from "@/components/layout/AuthGuard";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  Settings,
  LineChart,
  History,
  PieChart,
  LogOut,
  User as UserIcon,
  Bell,
  Zap,
  Plus,
  ChevronRight,
} from "lucide-react";
import ChatbotButton from "@/components/chatbot/ChatbotButton";
import QuickAddModal from "@/components/trades/QuickAddModal";
import { useState } from "react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Trades", href: "/trades", icon: ReceiptText },
  { name: "Charts", href: "/charts", icon: LineChart },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getPageTitle = () => {
    const item = NAV_ITEMS.find(
      (i) => pathname === i.href || pathname.startsWith(`${i.href}/`)
    );
    return item?.name ?? "Dashboard";
  };

  const firstName = user?.username?.split(" ")[0] || "Trader";

  return (
    <AuthGuard>
      <>
        {/* ── Global styles ─────────────────────────────────────── */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');

          .layout-root {
            font-family: 'DM Sans', sans-serif;
            --teal: #00e5b3;
            --red: #ff4d6a;
            --border: rgba(255,255,255,0.06);
            --border-hover: rgba(255,255,255,0.12);
            --surface: rgba(12,18,30,0.6);
          }

          /* ── Background ────────────────────── */
          .layout-bg {
            position: fixed;
            inset: 0;
            background: linear-gradient(175deg, #08111f 0%, #0c1a2e 50%, #091622 100%);
            z-index: 0;
          }
          .layout-bg-glow {
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
          }

          /* ── Sidebar ───────────────────────── */
          .layout-sidebar {
            width: 230px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            background: linear-gradient(180deg, rgba(10,16,28,0.96) 0%, rgba(8,14,24,0.98) 100%);
            border-right: 1px solid var(--border);
            position: relative;
            z-index: 50;
          }

          .layout-logo-wrap {
            padding: 24px 20px 20px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .layout-logo-icon {
            width: 36px; height: 36px;
            border-radius: 10px;
            background: linear-gradient(135deg, #00e5b3, #00c9a7);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 18px rgba(0,229,179,0.28);
            flex-shrink: 0;
          }
          .layout-logo-name {
            font-family: 'Syne', sans-serif;
            font-size: 17px;
            font-weight: 900;
            letter-spacing: -0.4px;
            color: #fff;
            line-height: 1;
          }
          .layout-logo-sub {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.22em;
            color: var(--teal);
            margin-top: 1px;
          }

          .layout-nav {
            flex: 1;
            padding: 16px 12px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow-y: auto;
          }
          .layout-nav::-webkit-scrollbar { width: 0; }

          .layout-nav-section-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: rgba(255,255,255,0.18);
            padding: 0 8px;
            margin: 8px 0 6px;
          }

          .layout-nav-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 9px 12px;
            border-radius: 11px;
            font-size: 13px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.16s;
            position: relative;
            color: rgba(255,255,255,0.38);
            border: 1px solid transparent;
          }
          .layout-nav-link:hover {
            color: rgba(255,255,255,0.75);
            background: rgba(255,255,255,0.04);
          }
          .layout-nav-link.active {
            color: var(--teal);
            background: rgba(0,229,179,0.07);
            border-color: rgba(0,229,179,0.14);
            font-weight: 600;
          }
          .layout-nav-left {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          /* ── User card ─────────────────────── */
          .layout-user-wrap {
            padding: 14px 12px;
            border-top: 1px solid var(--border);
          }
          .layout-user-card {
            padding: 12px 14px;
            border-radius: 14px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
          }
          .layout-user-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 11px;
          }
          .layout-user-avatar {
            width: 34px; height: 34px;
            border-radius: 50%;
            background: rgba(251,146,60,0.15);
            border: 1px solid rgba(251,146,60,0.25);
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
          }
          .layout-user-name {
            font-size: 12.5px;
            font-weight: 700;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .layout-user-email {
            font-size: 10px;
            color: rgba(255,255,255,0.28);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .layout-logout-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 8px;
            border-radius: 9px;
            border: none;
            background: transparent;
            font-family: 'DM Sans', sans-serif;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: rgba(255,255,255,0.3);
            cursor: pointer;
            transition: all 0.16s;
          }
          .layout-logout-btn:hover {
            color: var(--red);
            background: rgba(255,77,106,0.08);
          }

          /* ── Main area ─────────────────────── */
          .layout-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
            position: relative;
            z-index: 10;
          }

          /* ── Top header ────────────────────── */
          .layout-header {
            height: 68px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 32px;
            position: sticky;
            top: 0;
            z-index: 40;
            background: rgba(8,14,24,0.65);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
            flex-shrink: 0;
          }
          .layout-header-left { display: flex; flex-direction: column; }
          .layout-header-title {
            font-family: 'Syne', sans-serif;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #fff;
            line-height: 1;
          }
          .layout-header-greeting {
            font-size: 11px;
            color: rgba(255,255,255,0.28);
            margin-top: 2px;
            font-weight: 400;
          }
          .layout-header-right {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .layout-notif-btn {
            position: relative;
            width: 38px; height: 38px;
            border-radius: 10px;
            border: 1px solid var(--border);
            background: rgba(255,255,255,0.03);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            color: rgba(255,255,255,0.4);
            transition: all 0.16s;
          }
          .layout-notif-btn:hover {
            border-color: var(--border-hover);
            color: rgba(255,255,255,0.7);
          }
          .layout-notif-dot {
            position: absolute;
            top: 9px; right: 9px;
            width: 6px; height: 6px;
            border-radius: 50%;
            background: var(--red);
            border: 1.5px solid #08111f;
          }
          .layout-divider {
            width: 1px;
            height: 28px;
            background: var(--border);
          }
          .layout-add-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 20px;
            border-radius: 11px;
            border: none;
            background: linear-gradient(90deg, #00e5b3, #00c9a7);
            color: #08111f;
            font-family: 'Syne', sans-serif;
            font-size: 12.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            cursor: pointer;
            box-shadow: 0 4px 18px rgba(0,229,179,0.22);
            transition: filter 0.18s, transform 0.15s;
          }
          .layout-add-btn:hover { filter: brightness(1.08); }
          .layout-add-btn:active { transform: scale(0.97); }

          /* ── Content area ──────────────────── */
          .layout-content {
            flex: 1;
            overflow-y: auto;
          }
          .layout-content::-webkit-scrollbar { width: 4px; }
          .layout-content::-webkit-scrollbar-track { background: transparent; }
          .layout-content::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.07);
            border-radius: 99px;
          }
          .layout-content-inner {
            padding: 32px 32px 64px;
            max-width: 1600px;
            margin: 0 auto;
          }

          @keyframes layout-fade-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .layout-animate {
            animation: layout-fade-in 0.4s ease-out both;
          }
        `}</style>

        <div
          className="layout-root"
          style={{
            minHeight: "100vh",
            display: "flex",
            position: "relative",
            overflow: "hidden",
            color: "#fff",
          }}
        >
          {/* ── Background ─────────────────────────────────────── */}
          <div className="layout-bg" />
          <div
            className="layout-bg-glow"
            style={{
              bottom: "5%", left: "-8%",
              width: 500, height: 300,
              background: "radial-gradient(ellipse, rgba(0,210,160,0.06) 0%, transparent 70%)",
            }}
          />
          <div
            className="layout-bg-glow"
            style={{
              top: "2%", right: "-12%",
              width: 400, height: 280,
              background: "radial-gradient(ellipse, rgba(0,170,220,0.04) 0%, transparent 70%)",
            }}
          />

          {/* ══ Sidebar ══════════════════════════════════════════ */}
          <aside className="layout-sidebar">
            {/* Logo */}
            <div className="layout-logo-wrap">
              <div className="layout-logo-icon">
                <Zap size={18} color="#08111f" fill="#08111f" />
              </div>
              <div>
                <div className="layout-logo-name">TradeFlow</div>
                <div className="layout-logo-sub">Journal</div>
              </div>
            </div>

            {/* Nav */}
            <nav className="layout-nav">
              <div className="layout-nav-section-label">Menu</div>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`layout-nav-link${isActive ? " active" : ""}`}
                  >
                    <span className="layout-nav-left">
                      <Icon
                        size={16}
                        color={
                          isActive
                            ? "var(--teal)"
                            : "rgba(255,255,255,0.25)"
                        }
                      />
                      {item.name}
                    </span>
                    {isActive && (
                      <ChevronRight size={12} color="var(--teal)" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User card */}
            <div className="layout-user-wrap">
              <div className="layout-user-card">
                <div className="layout-user-row">
                  <div className="layout-user-avatar">
                    <UserIcon size={15} color="rgb(251,146,60)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="layout-user-name">
                      {user?.username || "Trader"}
                    </div>
                    <div className="layout-user-email">{user?.email}</div>
                  </div>
                </div>
                <button className="layout-logout-btn" onClick={handleLogout}>
                  <LogOut size={12} />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* ══ Main Content ════════════════════════════════════ */}
          <div className="layout-main">
            {/* Header */}
            <header className="layout-header">
              <div className="layout-header-left">
                <div className="layout-header-title">{getPageTitle()}</div>
                <div className="layout-header-greeting">
                  Welcome back, {firstName}
                </div>
              </div>

              <div className="layout-header-right">
                <button
                  className="layout-notif-btn"
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label="Notifications"
                >
                  <Bell size={17} />
                  <span className="layout-notif-dot" />
                </button>

                <span className="layout-divider" />

                <button
                  className="layout-add-btn"
                  onClick={() => setShowQuickAdd(true)}
                >
                  <Plus size={15} strokeWidth={3} />
                  Add Trade
                </button>
              </div>
            </header>

            {/* Page content */}
            <main className="layout-content">
              <div className="layout-content-inner layout-animate">
                {children}
              </div>
            </main>
          </div>

          {/* ── Modals ───────────────────────────────────────── */}
          {showQuickAdd && (
            <QuickAddModal
              onClose={() => setShowQuickAdd(false)}
              onSuccess={() => {
                setShowQuickAdd(false);
                router.refresh();
              }}
            />
          )}
          <ChatbotButton />
        </div>
      </>
    </AuthGuard>
  );
}