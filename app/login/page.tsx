"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, QrCode } from "lucide-react";
import Logo from "../components/Logo";

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", "").replace(/\(auth.*\)\.?/, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex"
        style={{
          width: "45%",
          background: "linear-gradient(145deg, #192837 0%, #0f1c27 100%)",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gradient orb */}
        <div style={{
          position: "absolute", top: -120, right: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(115,66,226,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -60,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(115,66,226,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
          <Logo size={28} color="#F2F2EE" />
          <span style={{ fontFamily: "var(--font-heading)", color: "#F2F2EE", fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
            QRcraft
          </span>
        </div>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(115,66,226,0.2)", border: "1px solid rgba(115,66,226,0.3)",
            borderRadius: 50, padding: "6px 14px", marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#A47EEB", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-body)", color: "#A47EEB", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Smart QR Platform
            </span>
          </div>

          <h2 style={{
            fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            color: "#F2F2EE", lineHeight: 1.08, letterSpacing: "-0.025em",
            margin: "0 0 18px",
          }}>
            Generate. Track.<br />Grow.
          </h2>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "0.95rem", lineHeight: 1.65,
            color: "rgba(242,242,238,0.6)", maxWidth: 320, margin: 0,
          }}>
            Create unlimited QR codes for your links, WhatsApp, UPI, business cards and more — with real-time scan analytics.
          </p>

          {/* Floating QR preview card */}
          <div style={{
            marginTop: 36, background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16, padding: "18px 20px",
            display: "flex", alignItems: "center", gap: 14, maxWidth: 280,
          }}>
            <div style={{
              width: 44, height: 44, background: "rgba(115,66,226,0.2)",
              borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <QrCode size={22} color="#A47EEB" />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-heading)", color: "#F2F2EE", fontSize: "0.85rem", margin: "0 0 2px" }}>My Portfolio</p>
              <p style={{ fontFamily: "var(--font-body)", color: "rgba(242,242,238,0.45)", fontSize: "0.72rem", margin: 0 }}>247 scans · qrcraft.io/x7k2p</p>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div style={{ display: "flex", gap: 32, position: "relative", zIndex: 1 }}>
          {[["10K+", "QR Codes"], ["2M+", "Scans tracked"], ["9", "QR types"]].map(([num, label]) => (
            <div key={label}>
              <p style={{ fontFamily: "var(--font-heading)", color: "#F2F2EE", fontSize: "1.2rem", margin: "0 0 2px" }}>{num}</p>
              <p style={{ fontFamily: "var(--font-body)", color: "rgba(242,242,238,0.4)", fontSize: "0.72rem", margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "40px 24px", background: "var(--color-login-bg)",
      }}>
        {/* Mobile logo */}
        <div className="flex lg:hidden" style={{ alignItems: "center", gap: 8, marginBottom: 40 }}>
          <Logo size={24} color="#192837" />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", letterSpacing: "-0.02em" }}>QRcraft</span>
        </div>

        <div style={{ width: "100%", maxWidth: 400 }}>
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 4vw, 2rem)", color: "var(--color-text)", margin: "0 0 8px", letterSpacing: "-0.025em" }}>
              Welcome back
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text)", opacity: 0.5, margin: "0 0 32px" }}>
              Sign in to manage your QR codes
            </p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#DC2626",
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
              <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.7, marginBottom: 6 }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(25,40,55,0.35)", pointerEvents: "none" }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  style={{
                    width: "100%", paddingLeft: 42, paddingRight: 14, paddingTop: 13, paddingBottom: 13,
                    fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text)",
                    background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(25,40,55,0.1)",
                    borderRadius: 12, outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#7342E2"; e.target.style.boxShadow = "0 0 0 3px rgba(115,66,226,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </motion.div>

            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
              <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.7, marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(25,40,55,0.35)", pointerEvents: "none" }} />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="Your password"
                  style={{
                    width: "100%", paddingLeft: 42, paddingRight: 14, paddingTop: 13, paddingBottom: 13,
                    fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text)",
                    background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(25,40,55,0.1)",
                    borderRadius: 12, outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#7342E2"; e.target.style.boxShadow = "0 0 0 3px rgba(115,66,226,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} style={{ marginTop: 4 }}>
              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: 1.02, filter: "brightness(1.08)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "100%", padding: "14px 20px",
                  background: loading ? "rgba(115,66,226,0.6)" : "#7342E2",
                  color: "#fff", fontFamily: "var(--font-body)", fontSize: "0.95rem",
                  fontWeight: 600, borderRadius: 50, border: "none", cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 20px rgba(115,66,226,0.25)",
                  transition: "background 0.2s",
                }}
              >
                {loading ? "Signing in…" : <>Sign In <ArrowRight size={16} /></>}
              </motion.button>
            </motion.div>
          </form>

          <motion.p custom={4} initial="hidden" animate="visible" variants={fadeUp}
            style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text)", opacity: 0.5, textAlign: "center", marginTop: 24 }}
          >
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#7342E2", fontWeight: 600, textDecoration: "none" }}>
              Create one free →
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
