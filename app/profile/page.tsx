"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, updateProfile, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, User as UserIcon } from "lucide-react";
import Logo from "../components/Logo";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
  background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(25,40,55,0.1)",
  borderRadius: 10, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err: any) {
      setError("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = displayName
    ? displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--color-login-bg)" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(115,66,226,0.2)", borderTopColor: "#7342E2", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)" }}>
      {/* Header */}
      <header style={{ background: "rgba(242,242,238,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(25,40,55,0.08)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/dashboard">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(25,40,55,0.06)", border: "none", cursor: "pointer", padding: "7px 12px", borderRadius: 50, color: "var(--color-text)", fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 500 }}
            >
              <ArrowLeft size={14} /> Dashboard
            </motion.button>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={22} color="#192837" />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "var(--color-text)", letterSpacing: "-0.02em" }}>Profile</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 520, margin: "40px auto", padding: "0 24px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(25,40,55,0.08)", borderRadius: 24, padding: 32, boxShadow: "0 8px 40px rgba(25,40,55,0.06)" }}
        >
          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32, paddingBottom: 28, borderBottom: "1px solid rgba(25,40,55,0.06)" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, #7342E2, #42A5E2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14, boxShadow: "0 8px 24px rgba(115,66,226,0.25)",
            }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "#fff", letterSpacing: "-0.01em" }}>{initials}</span>
            </div>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--color-text)", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
              {displayName || "Your Name"}
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-text)", opacity: 0.4, margin: 0 }}>
              {user?.email}
            </p>
          </div>

          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--color-text)", margin: "0 0 20px", letterSpacing: "-0.01em" }}>Account Settings</h2>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#DC2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ ...inputStyle, background: "rgba(25,40,55,0.03)", color: "rgba(25,40,55,0.4)", cursor: "not-allowed", display: "flex", alignItems: "center" }}>
                {user?.email}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>
                Display Name
              </label>
              <div style={{ position: "relative" }}>
                <UserIcon size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(25,40,55,0.3)", pointerEvents: "none" }} />
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name"
                  style={{ ...inputStyle, paddingLeft: 38 }}
                  onFocus={e => { e.target.style.borderColor = "#7342E2"; e.target.style.boxShadow = "0 0 0 3px rgba(115,66,226,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02, filter: "brightness(1.08)" }} whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: saved ? "#0D9488" : saving ? "rgba(115,66,226,0.6)" : "#7342E2",
                  color: "#fff", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 600,
                  padding: "13px 20px", borderRadius: 50, border: "none", cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: saved ? "0 4px 16px rgba(13,148,136,0.2)" : "0 4px 16px rgba(115,66,226,0.2)",
                  transition: "background 0.3s, box-shadow 0.3s",
                }}
              >
                {saved ? <><Check size={15} /> Saved!</> : saving ? "Saving…" : "Save Changes"}
              </motion.button>
              <Link href="/dashboard" style={{ flex: 1 }}>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", background: "rgba(25,40,55,0.05)", border: "1.5px solid rgba(25,40,55,0.1)",
                    color: "var(--color-text)", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 500,
                    padding: "13px 20px", borderRadius: 50, cursor: "pointer",
                  }}
                >
                  Back
                </motion.button>
              </Link>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
