"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi } from "@/services/authService";
import { useAuth } from "@/store/authContext";
import Link from "next/link";

/* ── Google Icon ──────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ── Apple Icon ───────────────────────────────────────────────────── */
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.53-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.53 8.7 9.28c1.23.07 2.08.72 2.8.75.99-.2 1.93-.89 3-.76 1.27.16 2.23.73 2.87 1.79-2.63 1.57-2.01 5.02.37 5.99-.49 1.28-.93 2.54-1.7 3.23zM12.03 9.16c-.13-2.4 1.82-4.42 4.06-4.62.29 2.67-2.38 4.66-4.06 4.62z" />
    </svg>
  );
}

/* ── Mail Icon ────────────────────────────────────────────────────── */
function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/* ── Lock Icon ────────────────────────────────────────────────────── */
function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ── Eye Icons ────────────────────────────────────────────────────── */
function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   LOGIN PAGE
   ═════════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginApi({ email, password });
      login(data.access_token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Google Fonts ─────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .login-root {
          font-family: 'DM Sans', sans-serif;
        }

        .login-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 26px;
          letter-spacing: -0.5px;
          color: #ffffff;
          margin: 0 0 4px;
        }

        .login-input {
          width: 100%;
          box-sizing: border-box;
          background: #040c0e;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 11px;
          padding: 11px 12px 11px 42px;
          font-size: 13px;
          color: #e8eaed;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.22); }
        .login-input:focus {
          border-color: rgba(0, 229, 179, 0.45);
          box-shadow: 0 0 0 3px rgba(0, 229, 179, 0.07);
        }

        .login-submit-btn {
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
        .login-submit-btn:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 14px 34px rgba(20, 184, 166, 0.36);
        }
        .login-submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .login-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-social-btn {
          width: 46px; height: 46px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(12, 20, 32, 0.7);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .login-social-btn:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(12, 20, 32, 0.95);
        }

        .login-pw-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.28);
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .login-pw-toggle:hover { color: rgba(255, 255, 255, 0.55); }

        @keyframes login-spin {
          to { transform: rotate(360deg); }
        }
        .login-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(8, 17, 31, 0.35);
          border-top-color: #08111f;
          border-radius: 50%;
          animation: login-spin 0.7s linear infinite;
          vertical-align: -3px;
          margin-right: 6px;
        }
      `}</style>

      <div
        className="login-root"
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
          {/* Night sky gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "#040c0e",
            }}
          />
          {/* Teal city glow */}
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              left: "5%",
              width: 420,
              height: 260,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(0,210,160,0.07) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "15%",
              right: "5%",
              width: 320,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(0,170,220,0.05) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "8%",
              right: "18%",
              width: 260,
              height: 180,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(0,200,180,0.04) 0%, transparent 70%)",
            }}
          />
          {/* City lights dots */}
          <div
            style={{
              position: "absolute",
              bottom: "22%",
              left: 0,
              right: 0,
              height: "12%",
              opacity: 0.18,
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
            }}
          />
        </div>

        {/* ── Card ───────────────────────────────────────────────── */}
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 390 }}>
          <div
            style={{
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "2rem",
              background:
                "linear-gradient(145deg, rgba(12,18,28,0.92) 0%, rgba(9,20,38,0.95) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Heading */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h1 className="login-heading">Welcome Back.</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>
                Log in to your account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(220,60,60,0.1)",
                  border: "1px solid rgba(220,60,60,0.25)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: "1.1rem",
                  fontSize: 12.5,
                  color: "#f08080",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#f08080",
                    flexShrink: 0,
                  }}
                />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: 6,
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <MailIcon />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johndoe@email.com"
                    className="login-input"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <label
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#00e5b3")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color =
                        "rgba(255,255,255,0.35)")
                    }
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <LockIcon />
                  </span>
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="login-input"
                    style={{ paddingRight: 42 }}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    onClick={() => setShowPw(!showPw)}
                    className="login-pw-toggle"
                  >
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="login-submit-btn"
                style={{ marginTop: 4 }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span className="login-spinner" />
                    Logging in...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "1.25rem 0",
              }}
            >
              <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                Or login with
              </span>
              <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Social Buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
              <button
                id="login-google"
                type="button"
                className="login-social-btn"
                aria-label="Continue with Google"
              >
                <GoogleIcon />
              </button>
              <button
                id="login-apple"
                type="button"
                className="login-social-btn"
                aria-label="Continue with Apple"
              >
                <AppleIcon />
              </button>
            </div>
          </div>

          {/* Bottom link */}
          <p
            style={{
              textAlign: "center",
              marginTop: "1.25rem",
              fontSize: 12.5,
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{
                color: "#00e5b3",
                textDecoration: "none",
                fontWeight: 500,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#ffffff")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "#00e5b3")
              }
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
