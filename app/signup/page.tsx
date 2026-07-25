"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import Logo from "../components/Logo";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const perks = [
  "9 QR code types — URL, UPI, WhatsApp & more",
  "Real-time scan analytics & history",
  "Custom colors, logos & branding",
  "Unlimited QR codes, free forever",
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
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
        <div style={{
          position: "absolute", top: -100, right: -60,
          width: 350, height: 350, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(115,66,226,0.2) 0%, transparent 70%)",
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
          <h2 style={{
            fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
            color: "#F2F2EE", lineHeight: 1.1, letterSpacing: "-0.025em",
            margin: "0 0 16px",
          }}>
            Everything you need<br />to go QR-first.
          </h2>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: 1.65,
            color: "rgba(242,242,238,0.55)", maxWidth: 300, margin: "0 0 32px",
          }}>
            Join thousands of creators and businesses using QRcraft every day.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {perks.map((perk) => (
              <li key={perk} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "rgba(115,66,226,0.25)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Sparkles size={11} color="#A47EEB" />
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "rgba(242,242,238,0.7)" }}>
                  {perk}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(242,242,238,0.3)", margin: 0, position: "relative", zIndex: 1 }}>
          No credit card required. Free forever.
        </p>
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
              Create your account
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text)", opacity: 0.5, margin: "0 0 32px" }}>
              Free forever. No credit card needed.
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

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                  placeholder="Min. 6 characters"
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
                  boxShadow: "0 4px 20px rgba(115,66,226,0.25)", transition: "background 0.2s",
                }}
              >
                {loading ? "Creating account…" : <>Get Started Free <ArrowRight size={16} /></>}
              </motion.button>
            </motion.div>
          </form>

          <motion.p custom={4} initial="hidden" animate="visible" variants={fadeUp}
            style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text)", opacity: 0.5, textAlign: "center", marginTop: 24 }}
          >
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#7342E2", fontWeight: 600, textDecoration: "none" }}>
              Sign in →
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}