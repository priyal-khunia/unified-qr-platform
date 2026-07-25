"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart2, Clock, TrendingUp } from "lucide-react";
import Logo from "../../../components/Logo";

interface Scan { id: string; scannedAt: any; }

export default function AnalyticsPage() {
  const [title, setTitle] = useState("");
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "qrcodes", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setTitle(docSnap.data().title || "Untitled QR");
      const scansQuery = query(collection(db, "scans"), where("qrId", "==", id));
      const scansSnapshot = await getDocs(scansQuery);
      const scansList = scansSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Scan[];
      scansList.sort((a, b) => (b.scannedAt?.seconds || 0) - (a.scannedAt?.seconds || 0));
      setScans(scansList);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const getToday = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    return scans.filter(s => s.scannedAt?.seconds && new Date(s.scannedAt.seconds * 1000).setHours(0, 0, 0, 0) === today).length;
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
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "var(--color-text)", letterSpacing: "-0.02em" }}>Analytics</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.3rem, 3vw, 1.7rem)", color: "var(--color-text)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            {title}
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)", opacity: 0.45, margin: "0 0 28px" }}>
            Scan analytics and history
          </p>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { icon: BarChart2, label: "Total Scans", value: scans.length, color: "#7342E2" },
            { icon: TrendingUp, label: "Today", value: getToday(), color: "#0D9488" },
            { icon: Clock, label: "Last Scan", value: scans[0]?.scannedAt?.seconds ? new Date(scans[0].scannedAt.seconds * 1000).toLocaleDateString() : "—", color: "#42A5E2" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.45 }}
              style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(25,40,55,0.08)", borderRadius: 16, padding: "18px 16px" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon size={16} color={color} />
              </div>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.03em" }}>{value}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--color-text)", opacity: 0.45, margin: 0 }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Scan history */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(25,40,55,0.08)", borderRadius: 20, padding: 24 }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--color-text)", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
            Scan History
          </h2>
          {scans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(115,66,226,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <BarChart2 size={20} color="#7342E2" style={{ opacity: 0.4 }} />
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)", opacity: 0.5 }}>No scans yet. Share your QR code to start collecting data.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {scans.map((scan, i) => (
                <motion.div key={scan.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.03, duration: 0.35 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 0", borderBottom: i < scans.length - 1 ? "1px solid rgba(25,40,55,0.06)" : "none",
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(115,66,226,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Clock size={12} color="#7342E2" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text)", margin: 0 }}>
                      {scan.scannedAt?.seconds
                        ? new Date(scan.scannedAt.seconds * 1000).toLocaleString()
                        : "Unknown time"}
                    </p>
                  </div>
                  <span style={{ marginLeft: "auto", fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--color-text)", opacity: 0.3 }}>#{i + 1}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
