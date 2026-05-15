"use client";
import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Eye,
  KeyRound,
  Loader2,
  Monitor,
  Save,
  Settings,
  Shield,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { useAuth } from "@/store/authContext";
import { updateProfile } from "@/services/authService";

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

function getErrorMessage(error: unknown) {
  const apiError = error as ApiError;
  return apiError.response?.data?.detail || "Failed to update profile";
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!user) return;
      setUsername(user.username);
      setEmail(user.email);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const updatedUser = await updateProfile({ username, email, password });
      setUser(updatedUser);
      setMessage({ type: "success", text: "Profile updated successfully" });
      setPassword("");
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User, desc: "Identity, email, and password" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Alerts and journal reminders" },
    { id: "security", label: "Security", icon: Shield, desc: "Privacy and session protection" },
    { id: "trading", label: "Trading", icon: Wallet, desc: "Broker and risk preferences" },
    { id: "display", label: "Display", icon: Monitor, desc: "Workspace and chart appearance" },
  ];

  const preferenceCards = [
    { label: "Trade Alerts", value: "Enabled", icon: Bell, accent: "#00e5b3" },
    { label: "Session Lock", value: "Standard", icon: Shield, accent: "#22d3ee" },
    { label: "Chart Theme", value: "Terminal", icon: Monitor, accent: "#f59e0b" },
  ];

  return (
    <>
      <style>{`
        .settings-root {
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

        .settings-header {
          align-items: flex-end;
          display: flex;
          gap: 20px;
          justify-content: space-between;
        }

        .settings-kicker {
          color: rgba(0, 229, 179, 0.7);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          margin-bottom: 7px;
          text-transform: uppercase;
        }

        .settings-title {
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1;
          margin: 0 0 7px;
        }

        .settings-subtitle {
          color: rgba(255, 255, 255, 0.36);
          font-size: 12.5px;
        }

        .settings-status {
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

        .settings-status-dot {
          animation: settings-pulse 1.8s ease-in-out infinite;
          background: var(--teal);
          border-radius: 999px;
          height: 7px;
          width: 7px;
        }

        @keyframes settings-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.86); }
        }

        .settings-glass {
          background: linear-gradient(140deg, rgba(14, 20, 34, 0.86) 0%, rgba(10, 18, 32, 0.94) 100%);
          border: 1px solid var(--border);
          border-radius: 20px;
          backdrop-filter: blur(16px);
          overflow: hidden;
          position: relative;
        }

        .settings-glass::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
          content: '';
          height: 1px;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
        }

        .settings-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: 330px minmax(0, 1fr);
        }

        .settings-rail {
          padding: 16px;
        }

        .settings-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .settings-nav button {
          align-items: flex-start;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 14px;
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          gap: 13px;
          padding: 14px;
          text-align: left;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
          width: 100%;
        }

        .settings-nav button:hover,
        .settings-nav button.active {
          background: rgba(0, 229, 179, 0.08);
          border-color: rgba(0, 229, 179, 0.18);
          color: var(--teal);
        }

        .settings-nav-title {
          color: inherit;
          font-size: 13px;
          font-weight: 900;
        }

        .settings-nav-desc {
          color: rgba(255, 255, 255, 0.28);
          font-size: 11px;
          line-height: 1.35;
          margin-top: 2px;
        }

        .settings-profile-card {
          min-height: 560px;
          padding: 28px;
        }

        .settings-panel-head {
          align-items: flex-start;
          display: flex;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .settings-panel-title {
          color: rgba(255, 255, 255, 0.76);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .settings-panel-sub {
          color: rgba(255, 255, 255, 0.27);
          font-size: 11px;
          margin-top: 4px;
        }

        .settings-avatar {
          align-items: center;
          background: linear-gradient(135deg, rgba(0, 229, 179, 0.2), rgba(34, 211, 238, 0.1));
          border: 1px solid rgba(0, 229, 179, 0.26);
          border-radius: 18px;
          box-shadow: 0 0 24px rgba(0, 229, 179, 0.09);
          color: var(--teal);
          display: flex;
          height: 54px;
          justify-content: center;
          width: 54px;
        }

        .settings-form {
          display: grid;
          gap: 18px;
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .settings-field label {
          color: rgba(219, 212, 212, 0.32);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .settings-input-wrap {
          position: relative;
        }

        .settings-input-wrap svg {
          color: rgba(255, 255, 255, 0.24);
          left: 14px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        .settings-input {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 13px;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          height: 48px;
          outline: none;
          padding: 0 15px 0 44px;
          transition: border-color 0.18s, background 0.18s;
          width: 100%;
        }

        .settings-input:focus {
          background: rgba(255, 255, 255, 0.055);
          border-color: rgba(0, 229, 179, 0.36);
        }

        .settings-message {
          align-items: center;
          border-radius: 12px;
          display: flex;
          font-size: 13px;
          font-weight: 800;
          gap: 10px;
          padding: 13px 14px;
        }

        .settings-message.success {
          background: rgba(0, 229, 179, 0.08);
          border: 1px solid rgba(0, 229, 179, 0.2);
          color: var(--teal);
        }

        .settings-message.error {
          background: rgba(255, 77, 106, 0.08);
          border: 1px solid rgba(255, 77, 106, 0.22);
          color: var(--red);
        }

        .settings-save-row {
          align-items: center;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          padding-top: 22px;
        }

        .settings-save-note {
          color: rgba(255, 255, 255, 0.3);
          font-size: 11px;
          max-width: 310px;
        }

        .settings-save {
          align-items: center;
          background: linear-gradient(135deg, #00e5b3 0%, #00c9a7 100%);
          border: 0;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 229, 179, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.16);
          color: #06131f;
          display: flex;
          font-size: 12px;
          font-weight: 900;
          gap: 8px;
          height: 42px;
          letter-spacing: 0.06em;
          padding: 0 18px;
          text-transform: uppercase;
        }

        .settings-save:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .settings-preferences {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .settings-pref {
          background: rgba(255, 255, 255, 0.032);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 17px;
        }

        .settings-pref-top {
          align-items: center;
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .settings-pref-icon {
          align-items: center;
          border-radius: 12px;
          display: flex;
          height: 36px;
          justify-content: center;
          width: 36px;
        }

        .settings-pref-label {
          color: rgba(255, 255, 255, 0.28);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .settings-pref-value {
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: 800;
          margin-top: 7px;
        }

        @media (max-width: 1120px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }

          .settings-preferences {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .settings-header,
          .settings-panel-head,
          .settings-save-row {
            align-items: stretch;
            flex-direction: column;
          }

          .settings-save {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>

      <div className="settings-root">
        <div className="settings-header">
          <div>
            <div className="settings-kicker">Workspace Control</div>
            <h2 className="settings-title">System Settings.</h2>
            <p className="settings-subtitle">Tune account details, security posture, and trading workspace preferences.</p>
          </div>
          <div className="settings-status">
            <span className="settings-status-dot" />
            Profile Synced
          </div>
        </div>

        <div className="settings-grid">
          <aside className="settings-glass settings-rail">
            <nav className="settings-nav" aria-label="Settings sections">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    className={activeSection === section.id ? "active" : ""}
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    type="button"
                  >
                    <Icon size={19} />
                    <span>
                      <span className="settings-nav-title">{section.label}</span>
                      <span className="settings-nav-desc">{section.desc}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="settings-glass settings-profile-card">
            <div className="settings-panel-head">
              <div style={{ display: "flex", gap: 15 }}>
                <div className="settings-avatar">
                  <User size={22} />
                </div>
                <div>
                  <div className="settings-panel-title">Profile Settings</div>
                  <div className="settings-panel-sub">Manage the identity used across your journal and reports</div>
                </div>
              </div>
              <Settings color="rgba(255,255,255,0.18)" size={20} />
            </div>

            <div className="settings-form">
              {message && (
                <div className={`settings-message ${message.type}`}>
                  {message.type === "success" ? <CheckCircle2 size={17} /> : <Shield size={17} />}
                  {message.text}
                </div>
              )}

              <div className="settings-field">
                <label htmlFor="settings-username">Username</label>
                <div className="settings-input-wrap">
                  <User size={16} />
                  <input
                    className="settings-input"
                    id="settings-username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="settings-email">Email Address</label>
                <div className="settings-input-wrap">
                  <Eye size={16} />
                  <input
                    className="settings-input"
                    id="settings-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="settings-password">Update Password</label>
                <div className="settings-input-wrap">
                  <KeyRound size={16} />
                  <input
                    className="settings-input"
                    id="settings-password"
                    type="password"
                    value={password}
                    placeholder="Leave blank to keep current"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>

              <div className="settings-save-row">
                <p className="settings-save-note">
                  Changes are applied to your TradeFlow account profile. Password remains unchanged when the field is empty.
                </p>
                <button className="settings-save" disabled={loading} onClick={handleSave} type="button">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {loading ? "Saving" : "Save Changes"}
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className="settings-preferences">
          {preferenceCards.map((item) => {
            const Icon = item.icon;
            return (
              <div className="settings-pref" key={item.label}>
                <div className="settings-pref-top">
                  <span className="settings-pref-icon" style={{ background: `${item.accent}14`, color: item.accent }}>
                    <Icon size={18} />
                  </span>
                  <Zap color="rgba(255,255,255,0.14)" size={16} />
                </div>
                <div className="settings-pref-label">{item.label}</div>
                <div className="settings-pref-value" style={{ color: item.accent }}>{item.value}</div>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
