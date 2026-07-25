"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import Logo from "../../../components/Logo";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
  background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(25,40,55,0.1)",
  borderRadius: 10, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export default function EditQRPage() {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchQR = async () => {
      const docRef = doc(db, "qrcodes", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title || "");
        setDestination(data.destination || "");
      } else {
        setError("QR code not found.");
      }
      setLoading(false);
    };
    fetchQR();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) { setError("You must be logged in."); setSaving(false); return; }
      await updateDoc(doc(db, "qrcodes", id), { title, destination });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "var(--color-text)", letterSpacing: "-0.02em" }}>Edit QR Code</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: "40px auto", padding: "0 24px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(25,40,55,0.08)", borderRadius: 20, padding: 32, boxShadow: "0 8px 40px rgba(25,40,55,0.06)" }}
        >
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "var(--color-text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Edit QR Code</h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)", opacity: 0.45, margin: "0 0 28px" }}>Update the title or destination for this QR code.</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#DC2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#7342E2"; e.target.style.boxShadow = "0 0 0 3px rgba(115,66,226,0.08)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>Destination URL</label>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#7342E2"; e.target.style.boxShadow = "0 0 0 3px rgba(115,66,226,0.08)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
            </div>

            <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
              <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02, filter: "brightness(1.08)" }} whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: saving ? "rgba(115,66,226,0.6)" : "#7342E2", color: "#fff",
                  fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 600,
                  padding: "13px 20px", borderRadius: 50, border: "none", cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(115,66,226,0.2)",
                }}
              >
                <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
              </motion.button>
              <motion.button type="button" onClick={() => router.push("/dashboard")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, background: "rgba(25,40,55,0.05)", border: "1.5px solid rgba(25,40,55,0.1)",
                  color: "var(--color-text)", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 500,
                  padding: "13px 20px", borderRadius: 50, cursor: "pointer",
                }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
