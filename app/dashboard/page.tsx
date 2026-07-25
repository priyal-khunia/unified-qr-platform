"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db, SITE_URL } from "../lib/firebase";
import { QRCodeCanvas } from "qrcode.react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../components/Toast";
import {
  Link2, MessageCircle, Phone, Mail, Shuffle, IndianRupee, MapPin, IdCard, Paperclip, Search, Filter, Plus, Pencil, BarChart3, Copy, Download, Trash2, Edit2, BarChart2
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

const fadeUp: any = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" },
  }),
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
      fetchQRCodes(auth.currentUser.uid);
    }
  }, []);

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
    setQrCodes(listWithCounts);
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
    const matchesSearch = qr.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || qr.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scanCount ?? 0), 0);

  return (
    <div className="w-full">

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats strip */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}
        >
          {[
            { label: "Total QR Codes", value: qrCodes.length, color: "#7342E2" },
            { label: "Total Scans", value: totalScans, color: "#42A5E2" },
            { label: "QR Types Used", value: new Set(qrCodes.map(q => q.type)).size, color: "#0D9488" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(25,40,55,0.08)", borderRadius: 16,
              padding: "18px 20px",
            }}>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: stat.color, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
                {stat.value}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-text)", opacity: 0.5, margin: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Toolbar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", color: "var(--color-text)", margin: 0, letterSpacing: "-0.02em", flex: 1, minWidth: 120 }}>
            Your QR Codes
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(25,40,55,0.35)", pointerEvents: "none" }} />
              <input
                type="text" placeholder="Search…" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                  fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text)",
                  background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(25,40,55,0.1)",
                  borderRadius: 50, outline: "none", width: 180,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={e => { e.target.style.borderColor = "#7342E2"; e.target.style.boxShadow = "0 0 0 3px rgba(115,66,226,0.08)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            {/* Filter */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Filter size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(25,40,55,0.35)", pointerEvents: "none" }} />
              <select
                value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  paddingLeft: 32, paddingRight: 28, paddingTop: 9, paddingBottom: 9,
                  fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text)",
                  background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(25,40,55,0.1)",
                  borderRadius: 50, outline: "none", appearance: "none", cursor: "pointer",
                }}
              >
                <option value="all">All Types</option>
                <option value="url">Website URL</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
                <option value="multi_link">Multi-Link</option>
                <option value="upi">UPI Payment</option>
                <option value="maps">Maps</option>
                <option value="business_card">Business Card</option>
                <option value="file">File</option>
              </select>
            </div>
            {/* Create */}
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
        </motion.div>

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
            <p className="text-ink font-medium mb-1">No QR codes match your search</p>
            <p className="text-muted text-sm">Try a different keyword, or create your first QR code.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(
              filteredQRCodes.reduce((groups: Record<string, typeof filteredQRCodes>, qr) => {
                const key = qr.type || "other";
                if (!groups[key]) groups[key] = [];
                groups[key].push(qr);
                return groups;
              }, {})
            ).map(([type, qrsInGroup]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                    {getTypeIcon(type)} {type.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="text-xs text-muted">({qrsInGroup.length})</span>
                  <div className="flex-1 h-px bg-hairline ml-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {qrsInGroup.map((qr, index) => {
                    const typeInfo = typeLabels[qr.type] || { label: qr.type, color: "#6B7280" };
                    return (
                      <div
                        key={qr.id}
                        style={{ animationDelay: `${index * 60}ms` }}
                        className="bg-white rounded-xl border border-hairline p-5 flex flex-col items-center hover:shadow-lg hover:-translate-y-1 hover:border-gray-300 transition-all duration-200 animate-[fadeInUp_0.4s_ease-out_backwards]"
                      >
                        {/* Type badge */}
                        <div style={{ alignSelf: "flex-start", marginBottom: 14 }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4, background: `${typeInfo.color}15`,
                            color: typeInfo.color, fontFamily: "var(--font-body)",
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
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}