"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { register as registerApi } from "@/services/authService";
import { useAuth } from "@/store/authContext";
import Link from "next/link";

/* ── Password Strength ────────────────────────────────────────────── */
function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "#ff4d6a" };
  if (score <= 2) return { score: 2, label: "Fair", color: "#f59e0b" };
  if (score <= 3) return { score: 3, label: "Good", color: "#22d3ee" };
  return { score: 4, label: "Strong", color: "#00e5b3" };
}

/* ── Inline SVG Icons ─────────────────────────────────────────────── */
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ── Reusable Input Field ─────────────────────────────────────────── */
interface InputFieldProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
  rightSlot?: React.ReactNode;
}

function InputField({
  id, type, value, onChange, placeholder, icon, required, rightSlot,
}: InputFieldProps) {
  return (
    <div style={{ position: "relative" }}>
      <span
        style={{
          position: "absolute", left: 13, top: "50%",
          transform: "translateY(-50%)",
          color: "rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {icon}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        suppressHydrationWarning
        className="reg-input"
        style={{ paddingRight: rightSlot ? 42 : 14 }}
      />
      {rightSlot && (
        <span
          style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)",
            display: "flex", alignItems: "center",
          }}
        >
          {rightSlot}
        </span>
      )}
    </div>
  );
}

/* ── Custom Checkbox ──────────────────────────────────────────────── */
interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}

function Checkbox({ checked, onChange, children }: CheckboxProps) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
      <span
        onClick={() => onChange(!checked)}
        style={{
          flexShrink: 0,
          marginTop: 2,
          width: 18, height: 18,
          borderRadius: 5,
          border: checked ? "1px solid rgba(0,229,179,0.5)" : "1px solid rgba(255,255,255,0.14)",
          background: checked ? "rgba(0,229,179,0.12)" : "rgba(12,20,32,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.18s",
          cursor: "pointer",
        }}
      >
        {checked && (
          <span style={{ color: "#00e5b3", lineHeight: 0 }}>
            <CheckIcon />
          </span>
        )}
      </span>
      <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.42)", lineHeight: 1.5 }}>
        {children}
      </span>
    </label>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   REGISTER PAGE
   ═════════════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [ackRisk, setAckRisk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms || !ackRisk) {
      setError("You must agree to the terms and acknowledge the financial risk.");
      return;
    }

    setLoading(true);
    try {
      const data = await registerApi({ username: fullName, email, password });
      login(data.access_token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .reg-root { font-family: 'DM Sans', sans-serif; }

        .reg-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 26px;
          letter-spacing: -0.5px;
          color: #ffffff;
          margin: 0 0 4px;
        }

        .reg-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(12, 20, 32, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 11px;
          padding: 11px 14px 11px 42px;
          font-size: 13px;
          color: #e8eaed;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .reg-input::placeholder { color: rgba(255,255,255,0.22); }
        .reg-input:focus {
          border-color: rgba(0, 229, 179, 0.45);
          box-shadow: 0 0 0 3px rgba(0, 229, 179, 0.07);
        }

        .reg-submit-btn {
          width: 100%;
          padding: 13px;
          border-radius: 11px;
          border: none;
          background: linear-gradient(90deg, #14b8a6, #0d9488);
          color: #ffffff;
          font-family: 'Syne', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.02em;
          box-shadow: 0 12px 28px rgba(13, 148, 136, 0.28);
          transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .reg-submit-btn:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 14px 34px rgba(20, 184, 166, 0.36);
        }
        .reg-submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .reg-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .reg-pw-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.28);
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .reg-pw-toggle:hover { color: rgba(255,255,255,0.55); }

        @keyframes reg-spin { to { transform: rotate(360deg); } }
        .reg-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(8,17,31,0.35);
          border-top-color: #08111f;
          border-radius: 50%;
          animation: reg-spin 0.7s linear infinite;
          vertical-align: -3px;
          margin-right: 6px;
        }

        .reg-teal-link {
          color: #00e5b3;
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-color: rgba(0,229,179,0.3);
          cursor: pointer;
          transition: text-decoration-color 0.2s;
        }
        .reg-teal-link:hover { text-decoration-color: #00e5b3; }
      `}</style>

      <div
        className="reg-root"
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
          backgroundColor: "#040c0e",
        }}
      >
        {/* ── Background ─────────────────────────────────────────── */}
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "#040c0e",
          }} />
          <div style={{
            position: "absolute", bottom: "10%", left: "5%",
            width: 420, height: 260, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,210,160,0.07) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "15%", right: "5%",
            width: 320, height: 200, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,170,220,0.05) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", top: "8%", right: "18%",
            width: 260, height: 180, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,200,180,0.04) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "22%", left: 0, right: 0,
            height: "12%", opacity: 0.18,
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 8% 50%, #4dd0e1, transparent),
              radial-gradient(1px 1px at 20% 30%, #80deea, transparent),
              radial-gradient(1px 1px at 35% 65%, #4dd0e1, transparent),
              radial-gradient(1.5px 1.5px at 48% 40%, #00e5b3, transparent),
              radial-gradient(1px 1px at 62% 70%, #4dd0e1, transparent),
              radial-gradient(1px 1px at 75% 35%, #80deea, transparent),
              radial-gradient(1.5px 1.5px at 88% 55%, #4dd0e1, transparent),
              radial-gradient(1px 1px at 15% 65%, #b2ebf2, transparent),
              radial-gradient(1px 1px at 55% 25%, #00e5b3, transparent),
              radial-gradient(1.5px 1.5px at 92% 45%, #80deea, transparent)
            `,
          }} />
        </div>

        {/* ── Card ───────────────────────────────────────────────── */}
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 410 }}>

          {/* ── Logo ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "1.75rem" }}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40, filter: "drop-shadow(0 0 10px rgba(0,229,179,0.3))" }}>
              <path d="M24 4L6 12v10c0 11.1 7.7 21.5 18 24 10.3-2.5 18-12.9 18-24V12L24 4z"
                fill="url(#sg-r)" fillOpacity="0.15" stroke="url(#sg-r)" strokeWidth="2" />
              <path d="M14 28l4-8 4 5 4-10 6 13" stroke="url(#sg-r)"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <defs>
                <linearGradient id="sg-r" x1="6" y1="4" x2="42" y2="46">
                  <stop stopColor="#00e5b3" /><stop offset="1" stopColor="#00b8d4" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ lineHeight: 1 }}>
              <span style={{
                display: "block", fontSize: 11, fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.24em",
                background: "linear-gradient(90deg,#00e5b3,#00b8d4)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Trading</span>
              <span style={{
                display: "block", fontSize: 13, fontWeight: 900,
                textTransform: "uppercase", letterSpacing: "0.18em", color: "#fff",
                fontFamily: "'Syne', sans-serif",
              }}>Platform</span>
            </div>
          </div>

          {/* ── Glass Card ───────────────────────────────────────── */}
          <div style={{
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "1.85rem 2rem",
            background: "linear-gradient(145deg, rgba(12,18,28,0.92) 0%, rgba(9,20,38,0.95) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}>
            {/* Heading */}
            <div style={{ marginBottom: "1.4rem" }}>
              <h1 className="reg-heading">Create Your Account.</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>
                Start your trading journey
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(220,60,60,0.1)",
                border: "1px solid rgba(220,60,60,0.25)",
                borderRadius: 10, padding: "10px 14px",
                marginBottom: "1rem",
                fontSize: 12.5, color: "#f08080",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f08080", flexShrink: 0 }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

              {/* Full Name */}
              <InputField
                id="register-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                icon={<UserIcon />}
                required
              />

              {/* Email */}
              <InputField
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                icon={<MailIcon />}
                required
              />

              {/* Password */}
              <div>
                <InputField
                  id="register-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  icon={<LockIcon />}
                  required
                  rightSlot={
                    <button
                      type="button"
                      aria-label={showPw ? "Hide password" : "Show password"}
                      onClick={() => setShowPw(!showPw)}
                      className="reg-pw-toggle"
                    >
                      {showPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  }
                />
                {/* Strength bar */}
                {password.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                    <div style={{
                      flex: 1, height: 3, borderRadius: 99,
                      background: "rgba(255,255,255,0.06)", overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: 99,
                        width: `${(pwStrength.score / 4) * 100}%`,
                        background: pwStrength.color,
                        boxShadow: `0 0 8px ${pwStrength.color}55`,
                        transition: "width 0.4s ease, background 0.3s ease",
                      }} />
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      color: pwStrength.color, minWidth: 40,
                    }}>
                      {pwStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <InputField
                id="register-confirm-password"
                type={showConfirmPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                icon={<LockIcon />}
                required
                rightSlot={
                  <button
                    type="button"
                    aria-label={showConfirmPw ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="reg-pw-toggle"
                  >
                    {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              />

              {/* Checkboxes */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 2 }}>
                <Checkbox checked={agreeTerms} onChange={setAgreeTerms}>
                  I agree to the{" "}
                  <span className="reg-teal-link">Terms of Service</span>
                  {" "}&amp;{" "}
                  <span className="reg-teal-link">Privacy Policy</span>
                </Checkbox>

                <Checkbox checked={ackRisk} onChange={setAckRisk}>
                  I understand that trading involves financial risk
                </Checkbox>
              </div>

              {/* Submit */}
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="reg-submit-btn"
                style={{ marginTop: 6 }}
                suppressHydrationWarning
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span className="reg-spinner" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>

          {/* Bottom link */}
          <p style={{
            textAlign: "center", marginTop: "1.25rem",
            fontSize: 12.5, color: "rgba(255,255,255,0.35)",
          }}>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ color: "#00e5b3", textDecoration: "none", fontWeight: 500 }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#fff")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#00e5b3")}
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
