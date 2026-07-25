"use client";

import { useEffect, useState, use } from "react";
import { User } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db, SITE_URL } from "../../../lib/firebase";
import { QRCodeCanvas } from "qrcode.react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../../components/Toast";
import {
  Link2, MessageCircle, Phone, Mail, Shuffle, IndianRupee, MapPin, IdCard, Paperclip, Search, Plus, Edit2, BarChart2, Copy, Download, Trash2
} from "lucide-react";

interface QRCode {
  id: string;
  title: string;
  type: string;
  destination: string;
  shortCode?: string;
  scanCount?: number;
  fgColor?: string;
  bgColor?: string;
  logoUrl?: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  url: { label: "Website", color: "#7342E2" },
  whatsapp: { label: "WhatsApp", color: "#25D366" },
  phone: { label: "Phone", color: "#42A5E2" },
  email: { label: "Email", color: "#E27342" },
  multi_link: { label: "Multi-Link", color: "#E2A542" },
  upi: { label: "UPI", color: "#0D9488" },
  maps: { label: "Maps", color: "#E24242" },
  business_card: { label: "Business Card", color: "#6B7280" },
  file: { label: "File", color: "#8B5CF6" },
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, React.ElementType> = {
    url: Link2,
    whatsapp: MessageCircle,
    phone: Phone,
    email: Mail,
    multi_link: Shuffle,
    upi: IndianRupee,
    maps: MapPin,
    business_card: IdCard,
    file: Paperclip,
  };
  const Icon = icons[type] || Link2;
  return <Icon size={12} strokeWidth={2.5} />;
};

export default function TypeDashboardPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const { showToast } = useToast();
  const typeParam = resolvedParams.type;

  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
      fetchQRCodes(auth.currentUser.uid);
    }
  }, [typeParam]);

  const fetchQRCodes = async (uid: string) => {
    const q = query(collection(db, "qrcodes"), where("userId", "==", uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as QRCode[];
    const listWithCounts = await Promise.all(
      list.map(async (qr) => {
        const scansQuery = query(collection(db, "scans"), where("qrId", "==", qr.id));
        const scansSnapshot = await getDocs(scansQuery);
        return { ...qr, scanCount: scansSnapshot.size };
      })
    );
    setQrCodes(listWithCounts.filter(qr => qr.type === typeParam));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this QR code?")) return;
    await deleteDoc(doc(db, "qrcodes", id));
    if (user) await fetchQRCodes(user.uid);
  };

  const downloadQR = (id: string, title: string) => {
    const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${title || "qr-code"}.png`;
    link.click();
  };

  const copyLink = (shortCode: string | undefined) => {
    if (!shortCode) { showToast("This QR code doesn't have a shareable link.", "error"); return; }
    navigator.clipboard.writeText(`${SITE_URL}/r/${shortCode}`);
    showToast("Link copied to clipboard!");
    setCopyMsg(shortCode);
    setTimeout(() => setCopyMsg(null), 2000);
  };

  const filteredQRCodes = qrCodes.filter((qr) => {
    return qr.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scanCount ?? 0), 0);
  const typeInfo = typeLabels[typeParam] || { label: typeParam, color: "#7342E2" };

  return (
    <div className="w-full">
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", color: "var(--color-text)", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
              {typeInfo.label} QR Codes
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text)", opacity: 0.6, margin: 0 }}>
              {qrCodes.length} {qrCodes.length === 1 ? "code" : "codes"} • {totalScans} total scans
            </p>
          </div>
          <Link href="/dashboard/new" style={{ display: "flex", alignItems: "center" }}>
            <motion.button whileHover={{ scale: 1.03, filter: "brightness(1.08)" }} whileTap={{ scale: 0.97 }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#7342E2", color: "#fff",
                fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600,
                padding: "9px 18px", borderRadius: 50, border: "1.5px solid #7342E2", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(115,66,226,0.25)",
              }}
            >
              <Plus size={15} /> Create QR
            </motion.button>
          </Link>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 120 }}></div>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(25,40,55,0.35)", pointerEvents: "none" }} />
            <input
              type="text" placeholder="Search…" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text)",
                background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(25,40,55,0.1)",
                borderRadius: 50, outline: "none", width: 220,
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor = "#7342E2"; e.target.style.boxShadow = "0 0 0 3px rgba(115,66,226,0.08)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* Grid */}
        {filteredQRCodes.length === 0 ? (
          <div className="bg-white rounded-xl border border-hairline p-12 flex flex-col items-center text-center">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mb-4 opacity-30">
              <rect x="2" y="2" width="16" height="16" rx="2" stroke="#18181B" strokeWidth="3"/>
              <rect x="7" y="7" width="6" height="6" fill="#18181B"/>
              <rect x="38" y="2" width="16" height="16" rx="2" stroke="#18181B" strokeWidth="3"/>
              <rect x="43" y="7" width="6" height="6" fill="#18181B"/>
              <rect x="2" y="38" width="16" height="16" rx="2" stroke="#18181B" strokeWidth="3"/>
              <rect x="7" y="43" width="6" height="6" fill="#18181B"/>
            </svg>
            <p className="text-ink font-medium mb-1">
              {searchTerm ? "No QR codes match your search" : `No ${typeInfo.label} QR codes yet`}
            </p>
            <p className="text-muted text-sm">
              {searchTerm ? "Try a different keyword." : "Create your first QR code of this type."}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/new" className="mt-6">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{
                    background: "#7342E2", color: "#fff", fontFamily: "var(--font-body)", fontSize: "0.875rem",
                    fontWeight: 600, padding: "11px 24px", borderRadius: 50, border: "none", cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 6,
                    boxShadow: "0 4px 16px rgba(115,66,226,0.25)",
                  }}
                >
                  <Plus size={15} /> Create One
                </motion.button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredQRCodes.map((qr, index) => {
                const qrTypeInfo = typeLabels[qr.type] || { label: qr.type, color: "#6B7280" };
                return (
                  <div
                    key={qr.id}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className="bg-white rounded-xl border border-hairline p-5 flex flex-col items-center hover:shadow-lg hover:-translate-y-1 hover:border-gray-300 transition-all duration-200 animate-[fadeInUp_0.4s_ease-out_backwards]"
                  >
                    {/* Type badge */}
                    <div style={{ alignSelf: "flex-start", marginBottom: 14 }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4, background: `${qrTypeInfo.color}15`,
                        color: qrTypeInfo.color, fontFamily: "var(--font-body)",
                        fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.04em",
                        textTransform: "uppercase", padding: "3px 10px", borderRadius: 50,
                      }}>
                        {getTypeIcon(qr.type)} {qr.type.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    {/* QR Code */}
                    <div style={{
                      padding: 10, background: "#fff",
                      border: "1px solid rgba(25,40,55,0.06)", borderRadius: 12, marginBottom: 14,
                    }}>
                      <QRCodeCanvas
                        id={`qr-${qr.id}`}
                        value={qr.shortCode ? `${SITE_URL}/r/${qr.shortCode}` : qr.destination}
                        size={100}
                        fgColor={qr.fgColor || "#192837"}
                        bgColor={qr.bgColor || "#ffffff"}
                        imageSettings={qr.logoUrl ? { src: qr.logoUrl, height: 22, width: 22, excavate: true } : undefined}
                      />
                    </div>

                    <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.9rem", color: "var(--color-text)", margin: "0 0 4px", textAlign: "center", letterSpacing: "-0.01em" }}>
                      {qr.title}
                    </p>
                    {qr.destination && (
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--color-text)", opacity: 0.4, margin: "0 0 4px", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                        {qr.destination}
                      </p>
                    )}

                    {/* Scan count */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 5, marginBottom: 14,
                      background: "rgba(13,148,136,0.08)", borderRadius: 50, padding: "3px 10px",
                    }}>
                      <BarChart2 size={12} color="#0D9488" />
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 600, color: "#0D9488" }}>
                        {qr.scanCount ?? 0} scan{qr.scanCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: "flex", gap: 6, width: "100%",
                      paddingTop: 12, borderTop: "1px solid rgba(25,40,55,0.06)",
                      justifyContent: "center", flexWrap: "wrap",
                    }}>
                      {[
                        { icon: Edit2, label: "Edit", href: `/dashboard/edit/${qr.id}`, color: "rgba(25,40,55,0.5)" },
                        { icon: BarChart2, label: "Stats", href: `/dashboard/analytics/${qr.id}`, color: "rgba(25,40,55,0.5)" },
                      ].map(({ icon: Icon, label, href, color }) => (
                        <Link key={label} href={href}>
                          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                            style={{
                              display: "flex", alignItems: "center", gap: 4,
                              background: "rgba(25,40,55,0.05)", border: "none", cursor: "pointer",
                              padding: "6px 10px", borderRadius: 8, color,
                              fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 500,
                            }}
                          >
                            <Icon size={12} /> {label}
                          </motion.button>
                        </Link>
                      ))}
                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                        onClick={() => copyLink(qr.shortCode)}
                        style={{
                          display: "flex", alignItems: "center", gap: 4,
                          background: copyMsg === qr.shortCode ? "rgba(13,148,136,0.1)" : "rgba(25,40,55,0.05)",
                          border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 8,
                          color: copyMsg === qr.shortCode ? "#0D9488" : "rgba(25,40,55,0.5)",
                          fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 500,
                          transition: "background 0.2s, color 0.2s",
                        }}
                      >
                        <Copy size={12} /> {copyMsg === qr.shortCode ? "Copied!" : "Copy"}
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                        onClick={() => downloadQR(qr.id, qr.title)}
                        style={{
                          display: "flex", alignItems: "center", gap: 4,
                          background: "rgba(25,40,55,0.05)", border: "none", cursor: "pointer",
                          padding: "6px 10px", borderRadius: 8, color: "rgba(25,40,55,0.5)",
                          fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 500,
                        }}
                      >
                        <Download size={12} /> Save
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                        onClick={() => handleDelete(qr.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 4,
                          background: "rgba(239,68,68,0.06)", border: "none", cursor: "pointer",
                          padding: "6px 10px", borderRadius: 8, color: "#EF4444",
                          fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 500,
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </motion.button>
                    </div>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
