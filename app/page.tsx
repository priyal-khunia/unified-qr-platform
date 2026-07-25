"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, QrCode, Sparkles, Zap, Shield } from "lucide-react";
import Logo from "./components/Logo";

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 2.2 + i * 0.1, duration: 0.7, ease: "easeOut" },
  }),
};

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", position: "relative", overflowX: "hidden" }}>
      {/* --- MAIN LANDING PAGE --- */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Navigation */}
        <header style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
          padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={28} color="#192837" />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--color-text)", letterSpacing: "-0.02em" }}>
              QRcraft
            </span>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href="/login" style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text)", textDecoration: "none" }}>
              Sign In
            </Link>
            <Link href="/signup">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{
                  background: "#192837", color: "#F2F2EE", padding: "10px 20px",
                  borderRadius: 50, border: "none", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 600,
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(25,40,55,0.15)",
                }}
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main style={{
          paddingTop: 160, paddingBottom: 100, display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", paddingLeft: 24, paddingRight: 24,
        }}>
          {/* Animated decorative blobs */}
          <div style={{
            position: "absolute", top: -150, left: "10%", width: 500, height: 500,
            background: "radial-gradient(circle, rgba(115,66,226,0.12) 0%, transparent 60%)",
            borderRadius: "50%", pointerEvents: "none", zIndex: -1,
          }} />
          <div style={{
            position: "absolute", top: 100, right: "5%", width: 400, height: 400,
            background: "radial-gradient(circle, rgba(66,165,226,0.1) 0%, transparent 60%)",
            borderRadius: "50%", pointerEvents: "none", zIndex: -1,
          }} />

          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(115,66,226,0.1)", border: "1px solid rgba(115,66,226,0.2)",
              borderRadius: 50, padding: "8px 16px", marginBottom: 32,
            }}
          >
            <Sparkles size={14} color="#7342E2" />
            <span style={{ fontFamily: "var(--font-body)", color: "#7342E2", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              The Next-Gen QR Platform
            </span>
          </motion.div>

          <motion.h1 custom={2} initial="hidden" animate="visible" variants={fadeUp}
            style={{
              fontFamily: "var(--font-heading)", fontSize: "clamp(3rem, 6vw, 5rem)",
              color: "var(--color-text)", lineHeight: 1.05, letterSpacing: "-0.03em",
              maxWidth: 900, margin: "0 0 24px",
            }}
          >
            Create beautifully smart<br />
            <span style={{ color: "#7342E2" }}>QR Codes</span> in seconds.
          </motion.h1>

          <motion.p custom={3} initial="hidden" animate="visible" variants={fadeUp}
            style={{
              fontFamily: "var(--font-body)", fontSize: "1.15rem", lineHeight: 1.6,
              color: "var(--color-text)", opacity: 0.6, maxWidth: 600, margin: "0 0 48px",
            }}
          >
            The ultimate tool to generate, customize, and track dynamic QR codes for your links, business cards, WhatsApp, and more.
          </motion.p>

          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
            style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}
          >
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.03, filter: "brightness(1.1)" }} whileTap={{ scale: 0.97 }}
                style={{
                  background: "#7342E2", color: "#fff", padding: "16px 32px",
                  borderRadius: 50, border: "none", fontFamily: "var(--font-body)", fontSize: "1.05rem",
                  fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  boxShadow: "0 8px 32px rgba(115,66,226,0.3)",
                }}
              >
                Start Creating Free <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  background: "rgba(25,40,55,0.05)", color: "var(--color-text)", padding: "16px 32px",
                  borderRadius: 50, border: "1.5px solid rgba(25,40,55,0.1)",
                  fontFamily: "var(--font-body)", fontSize: "1.05rem", fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                }}
              >
                Sign In to Dashboard
              </motion.button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}
            style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24, maxWidth: 1000, width: "100%", marginTop: 80, padding: "0 24px",
            }}
          >
            {[
              { icon: QrCode, title: "9+ QR Types", desc: "URLs, WhatsApp, UPI, Business Cards, Files & more." },
              { icon: Zap, title: "Real-time Analytics", desc: "Track every scan instantly in your personal dashboard." },
              { icon: Shield, title: "Ironclad Security", desc: "Your data and files are safely stored and encrypted." },
            ].map((feat, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(25,40,55,0.08)", borderRadius: 24,
                padding: 32, textAlign: "left",
                boxShadow: "0 8px 32px rgba(25,40,55,0.04)",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: "rgba(115,66,226,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
                }}>
                  <feat.icon size={24} color="#7342E2" />
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--color-text)", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
                  {feat.title}
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "var(--color-text)", opacity: 0.6, margin: 0, lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
