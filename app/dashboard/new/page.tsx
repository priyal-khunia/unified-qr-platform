"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { QRCodeCanvas } from "qrcode.react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe, MessageCircle, Phone, Mail, Link2, Banknote,
  MapPin, CreditCard, FileUp, ArrowLeft, Plus, X, ChevronRight,
} from "lucide-react";
import Logo from "../../components/Logo";

type QRType = "url" | "whatsapp" | "phone" | "email" | "multi_link" | "upi" | "maps" | "business_card" | "file";

interface LinkItem { label: string; url: string; }
interface BusinessCardData { name: string; jobTitle: string; company: string; phone: string; email: string; website: string; }

const qrTypes: { type: QRType; icon: any; label: string; desc: string; color: string }[] = [
  { type: "url", icon: Globe, label: "Website URL", desc: "Link to any webpage", color: "#7342E2" },
  { type: "whatsapp", icon: MessageCircle, label: "WhatsApp", desc: "Open a WhatsApp chat", color: "#25D366" },
  { type: "phone", icon: Phone, label: "Phone Call", desc: "Dial a number directly", color: "#42A5E2" },
  { type: "email", icon: Mail, label: "Email", desc: "Compose an email", color: "#E27342" },
  { type: "multi_link", icon: Link2, label: "Multi-Link", desc: "Link tree with multiple URLs", color: "#E2A542" },
  { type: "upi", icon: Banknote, label: "UPI Payment", desc: "Accept Indian payments", color: "#0D9488" },
  { type: "maps", icon: MapPin, label: "Google Maps", desc: "Point to a location", color: "#E24242" },
  { type: "business_card", icon: CreditCard, label: "Business Card", desc: "Share your contact info", color: "#6B7280" },
  { type: "file", icon: FileUp, label: "PDF / File", desc: "Upload and share a file", color: "#8B5CF6" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
  background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(25,40,55,0.1)",
  borderRadius: 10, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export default function NewQRPage() {
  const [type, setType] = useState<QRType>("url");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([{ label: "", url: "" }]);
  const [upiId, setUpiId] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [mapsQuery, setMapsQuery] = useState("");
  const [card, setCard] = useState<BusinessCardData>({ name: "", jobTitle: "", company: "", phone: "", email: "", website: "" });
  const [fgColor, setFgColor] = useState("#192837");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedContent, setSavedContent] = useState("");
  const router = useRouter();

  const generateShortCode = (): string => Math.random().toString(36).substring(2, 8);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) { setError("Logo image must be under 500KB."); return; }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10MB."); return; }
    setSelectedFile(file);
    setError("");
  };

  const buildDestination = (): string => {
    if (type === "url") return value;
    if (type === "whatsapp") {
      const cleaned = value.replace(/[^0-9]/g, "");
      return `https://wa.me/${cleaned}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
    }
    if (type === "phone") return `tel:${value}`;
    if (type === "email") return `mailto:${value}${message ? `?subject=${encodeURIComponent(message)}` : ""}`;
    if (type === "upi") {
      const params = new URLSearchParams();
      params.set("pa", upiId);
      if (payeeName) params.set("pn", payeeName);
      if (amount) params.set("am", amount);
      params.set("cu", "INR");
      return `upi://pay?${params.toString()}`;
    }
    if (type === "maps") return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
    return "";
  };

  const getLivePreviewValue = (): string => {
    try {
      const dest = buildDestination();
      return dest || title || "https://qrcraft.io";
    } catch { return "https://qrcraft.io"; }
  };

  const addLinkField = () => setLinks([...links, { label: "", url: "" }]);
  const removeLinkField = (index: number) => setLinks(links.filter((_, i) => i !== index));
  const updateLinkField = (index: number, field: "label" | "url", newValue: string) => {
    const updated = [...links];
    updated[index][field] = newValue;
    setLinks(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) { setError("You must be logged in."); setLoading(false); return; }
      const shortCode = generateShortCode();
      if (type === "multi_link") {
        const validLinks = links.filter((l) => l.label && l.url);
        if (validLinks.length === 0) { setError("Add at least one link."); setLoading(false); return; }
        await addDoc(collection(db, "qrcodes"), { userId: user.uid, title, type, links: validLinks, destination: "", shortCode, fgColor, bgColor, logoUrl: logoDataUrl, createdAt: serverTimestamp() });
      } else if (type === "business_card") {
        if (!card.name) { setError("Name is required for a business card."); setLoading(false); return; }
        await addDoc(collection(db, "qrcodes"), { userId: user.uid, title, type, card, destination: "", shortCode, fgColor, bgColor, logoUrl: logoDataUrl, createdAt: serverTimestamp() });
      } else if (type === "file") {
        if (!selectedFile) { setError("Please select a file to upload."); setLoading(false); return; }
        setUploadProgress("Uploading…");
        const fileRef = ref(storage, `qr-files/${user.uid}/${Date.now()}_${selectedFile.name}`);
        await uploadBytes(fileRef, selectedFile);
        const fileUrl = await getDownloadURL(fileRef);
        setUploadProgress("");
        await addDoc(collection(db, "qrcodes"), { userId: user.uid, title, type, destination: fileUrl, fileName: selectedFile.name, fileType: selectedFile.type, shortCode, fgColor, bgColor, logoUrl: logoDataUrl, createdAt: serverTimestamp() });
      } else {
        const destination = buildDestination();
        await addDoc(collection(db, "qrcodes"), { userId: user.uid, title, type, destination, shortCode, fgColor, bgColor, logoUrl: logoDataUrl, createdAt: serverTimestamp() });
      }
      setSavedContent(`${window.location.origin}/r/${shortCode}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedType = qrTypes.find(t => t.type === type)!;
  const SelectedIcon = selectedType.icon;

  if (savedContent) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(25,40,55,0.08)", borderRadius: 24, padding: "40px 32px",
            maxWidth: 400, width: "100%", textAlign: "center",
            boxShadow: "0 24px 80px rgba(25,40,55,0.1)",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(13,148,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
              <ChevronRight size={28} color="#0D9488" />
            </motion.div>
          </div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "var(--color-text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>QR Code Created!</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)", opacity: 0.5, margin: "0 0 24px" }}>Your QR code is live and ready to share.</p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, padding: 14, background: "#fff", border: "1px solid rgba(25,40,55,0.06)", borderRadius: 16, display: "inline-block" }}>
            <QRCodeCanvas value={savedContent} size={180} fgColor={fgColor} bgColor={bgColor} imageSettings={logoDataUrl ? { src: logoDataUrl, height: 36, width: 36, excavate: true } : undefined} />
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/dashboard")}
            style={{
              width: "100%", background: "#7342E2", color: "#fff",
              fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 600,
              padding: "13px 20px", borderRadius: 50, border: "none", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(115,66,226,0.25)",
            }}
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
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
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "var(--color-text)", letterSpacing: "-0.02em" }}>New QR Code</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="lg:grid-cols-[1fr_340px]">

          {/* Left: Form */}
          <div>
            {/* Type selector */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(25,40,55,0.08)", borderRadius: 20, padding: 24, marginBottom: 16 }}
            >
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.45, margin: "0 0 14px" }}>
                Select QR Type
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                {qrTypes.map(({ type: t, icon: Icon, label, color }) => (
                  <motion.button key={t} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setType(t)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 12px", borderRadius: 12,
                      background: type === t ? `${color}12` : "rgba(25,40,55,0.03)",
                      border: type === t ? `1.5px solid ${color}35` : "1.5px solid transparent",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={14} color={color} />
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 500, color: type === t ? color : "var(--color-text)", opacity: type === t ? 1 : 0.65 }}>
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(25,40,55,0.08)", borderRadius: 20, padding: 24 }}
            >
              {/* Selected type header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(25,40,55,0.06)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${selectedType.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SelectedIcon size={18} color={selectedType.color} />
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "var(--color-text)", margin: 0, letterSpacing: "-0.01em" }}>{selectedType.label}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-text)", opacity: 0.45, margin: 0 }}>{selectedType.desc}</p>
                </div>
              </div>

              {error && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#DC2626" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Title */}
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>Title *</label>
                  <input type="text" placeholder="e.g. My Portfolio" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = "#7342E2"; e.target.style.boxShadow = "0 0 0 3px rgba(115,66,226,0.08)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                </div>

                {/* Type-specific fields */}
                {type === "url" && (
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>Website URL *</label>
                    <input type="url" placeholder="https://example.com" value={value} onChange={(e) => setValue(e.target.value)} required style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#7342E2"; e.target.style.boxShadow = "0 0 0 3px rgba(115,66,226,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                )}
                {type === "whatsapp" && (<>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>Phone Number (with country code) *</label>
                    <input type="text" placeholder="919999999999" value={value} onChange={(e) => setValue(e.target.value)} required style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#25D366"; e.target.style.boxShadow = "0 0 0 3px rgba(37,211,102,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>Pre-filled Message (optional)</label>
                    <input type="text" placeholder="Hi, I'm interested…" value={message} onChange={(e) => setMessage(e.target.value)} style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#25D366"; e.target.style.boxShadow = "0 0 0 3px rgba(37,211,102,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                </>)}
                {type === "phone" && (
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>Phone Number *</label>
                    <input type="tel" placeholder="+919999999999" value={value} onChange={(e) => setValue(e.target.value)} required style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#42A5E2"; e.target.style.boxShadow = "0 0 0 3px rgba(66,165,226,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                )}
                {type === "email" && (<>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>Email Address *</label>
                    <input type="email" placeholder="someone@email.com" value={value} onChange={(e) => setValue(e.target.value)} required style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#E27342"; e.target.style.boxShadow = "0 0 0 3px rgba(226,115,66,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>Subject (optional)</label>
                    <input type="text" placeholder="Subject line" value={message} onChange={(e) => setMessage(e.target.value)} style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#E27342"; e.target.style.boxShadow = "0 0 0 3px rgba(226,115,66,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                </>)}
                {type === "multi_link" && (
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 10 }}>Links</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {links.map((link, index) => (
                        <div key={index} style={{ display: "flex", gap: 8 }}>
                          <input type="text" placeholder="Label (e.g. Instagram)" value={link.label} onChange={(e) => updateLinkField(index, "label", e.target.value)}
                            style={{ ...inputStyle, flex: 1 }}
                            onFocus={e => { e.target.style.borderColor = "#E2A542"; e.target.style.boxShadow = "0 0 0 3px rgba(226,165,66,0.08)"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                          <input type="url" placeholder="https://…" value={link.url} onChange={(e) => updateLinkField(index, "url", e.target.value)}
                            style={{ ...inputStyle, flex: 1 }}
                            onFocus={e => { e.target.style.borderColor = "#E2A542"; e.target.style.boxShadow = "0 0 0 3px rgba(226,165,66,0.08)"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                          {links.length > 1 && (
                            <button type="button" onClick={() => removeLinkField(index)}
                              style={{ padding: "0 10px", background: "rgba(239,68,68,0.08)", border: "none", borderRadius: 10, cursor: "pointer", color: "#EF4444", flexShrink: 0 }}>
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addLinkField}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(25,40,55,0.04)", border: "1.5px dashed rgba(25,40,55,0.12)", borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text)", opacity: 0.6 }}>
                        <Plus size={14} /> Add link
                      </button>
                    </div>
                  </div>
                )}
                {type === "upi" && (<>
                  {[["UPI ID *", "yourname@upi", upiId, (v: string) => setUpiId(v)], ["Payee Name (optional)", "Your Name", payeeName, (v: string) => setPayeeName(v)], ["Amount in INR (optional)", "100", amount, (v: string) => setAmount(v)]].map(([label, ph, val, setter]: any) => (
                    <div key={label as string}>
                      <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>{label}</label>
                      <input type="text" placeholder={ph as string} value={val as string} onChange={(e) => setter(e.target.value)} required={label.includes("*")} style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = "#0D9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                    </div>
                  ))}
                </>)}
                {type === "maps" && (
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6 }}>Location / Address *</label>
                    <input type="text" placeholder="Eiffel Tower, Paris" value={mapsQuery} onChange={(e) => setMapsQuery(e.target.value)} required style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#E24242"; e.target.style.boxShadow = "0 0 0 3px rgba(226,66,66,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                  </div>
                )}
                {type === "business_card" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {(["name", "jobTitle", "company", "phone", "email", "website"] as (keyof BusinessCardData)[]).map((field) => (
                      <div key={field} style={{ gridColumn: field === "name" ? "span 2" : "auto" }}>
                        <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 6, textTransform: "capitalize" }}>
                          {field === "jobTitle" ? "Job Title" : field}{field === "name" ? " *" : ""}
                        </label>
                        <input type={field === "email" ? "email" : "text"} value={card[field]} onChange={(e) => setCard({ ...card, [field]: e.target.value })} required={field === "name"} style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = "#6B7280"; e.target.style.boxShadow = "0 0 0 3px rgba(107,114,128,0.08)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(25,40,55,0.1)"; e.target.style.boxShadow = "none"; }} />
                      </div>
                    ))}
                  </div>
                )}
                {type === "file" && (
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text)", opacity: 0.6, marginBottom: 8 }}>Upload File (PDF, Image, Video — max 10MB) *</label>
                    <label style={{
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      gap: 8, padding: "28px 20px", border: "2px dashed rgba(25,40,55,0.12)", borderRadius: 12,
                      cursor: "pointer", background: "rgba(255,255,255,0.5)", transition: "border-color 0.15s",
                    }}>
                      <FileUp size={24} color="rgba(25,40,55,0.3)" />
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-text)", opacity: 0.5 }}>
                        {selectedFile ? selectedFile.name : "Click to choose file"}
                      </span>
                      <input type="file" accept="application/pdf,image/*,video/*" onChange={handleFileSelect} style={{ display: "none" }} />
                    </label>
                    {uploadProgress && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#7342E2", marginTop: 8 }}>{uploadProgress}</p>}
                  </div>
                )}

                {/* Appearance */}
                <div style={{ borderTop: "1px solid rgba(25,40,55,0.06)", paddingTop: 16, marginTop: 4 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.4, margin: "0 0 12px" }}>Customize</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[["Foreground", fgColor, setFgColor], ["Background", bgColor, setBgColor]].map(([label, val, setter]: any) => (
                      <div key={label as string}>
                        <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-text)", opacity: 0.5, marginBottom: 6 }}>{label}</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input type="color" value={val as string} onChange={(e) => setter(e.target.value)}
                            style={{ width: 36, height: 36, border: "1.5px solid rgba(25,40,55,0.1)", borderRadius: 10, cursor: "pointer", padding: 2 }} />
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-text)", opacity: 0.5 }}>{val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-text)", opacity: 0.5, marginBottom: 6 }}>Logo (optional, under 500KB)</label>
                    <input type="file" accept="image/png,image/jpeg" onChange={handleLogoUpload}
                      style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text)" }} />
                    {logoDataUrl && <img src={logoDataUrl} alt="Logo" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8, border: "1px solid rgba(25,40,55,0.1)", marginTop: 8 }} />}
                  </div>
                </div>

                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02, filter: "brightness(1.08)" }} whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", padding: "14px 20px",
                    background: loading ? "rgba(115,66,226,0.6)" : "#7342E2",
                    color: "#fff", fontFamily: "var(--font-body)", fontSize: "0.95rem", fontWeight: 600,
                    borderRadius: 50, border: "none", cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 20px rgba(115,66,226,0.25)", marginTop: 4,
                  }}
                >
                  {loading ? (uploadProgress || "Creating QR Code…") : "Generate QR Code"}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Right: Live Preview */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            style={{ position: "sticky", top: 80, height: "fit-content" }}
          >
            <div style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(25,40,55,0.08)", borderRadius: 20, padding: 24, textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.4, margin: "0 0 20px" }}>
                Live Preview
              </p>
              <div style={{ display: "flex", justifyContent: "center", padding: 16, background: "#fff", border: "1px solid rgba(25,40,55,0.06)", borderRadius: 14, marginBottom: 16 }}>
                <QRCodeCanvas
                  value={getLivePreviewValue()}
                  size={200}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  imageSettings={logoDataUrl ? { src: logoDataUrl, height: 40, width: 40, excavate: true } : undefined}
                />
              </div>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.9rem", color: "var(--color-text)", margin: "0 0 4px" }}>{title || "Your QR Code"}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--color-text)", opacity: 0.4, margin: 0 }}>{selectedType.label}</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
