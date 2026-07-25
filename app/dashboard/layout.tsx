"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutGrid, Link2, MessageCircle, Phone, Mail, Shuffle, IndianRupee, MapPin, IdCard, Paperclip,
  LogOut, User as UserIcon
} from "lucide-react";
import Logo from "../components/Logo";

const navLinks = [
  { href: "/dashboard", label: "All QR Codes", icon: LayoutGrid },
  { href: "/dashboard/type/url", label: "URL", icon: Link2 },
  { href: "/dashboard/type/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/dashboard/type/phone", label: "Phone", icon: Phone },
  { href: "/dashboard/type/email", label: "Email", icon: Mail },
  { href: "/dashboard/type/multi_link", label: "Multi-Link", icon: Shuffle },
  { href: "/dashboard/type/upi", label: "UPI", icon: IndianRupee },
  { href: "/dashboard/type/maps", label: "Maps", icon: MapPin },
  { href: "/dashboard/type/business_card", label: "Business Card", icon: IdCard },
  { href: "/dashboard/type/file", label: "File", icon: Paperclip },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--color-login-bg)" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(115,66,226,0.2)", borderTopColor: "#7342E2", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)", opacity: 0.5 }}>Loading your vault…</p>
        </motion.div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Fixed Sidebar */}
      <aside className="w-[240px] fixed inset-y-0 left-0 bg-white border-r border-hairline flex flex-col z-20">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-8">
            <Logo size={28} color="#192837" />
            <span className="font-heading text-lg text-ink font-semibold tracking-tight">QRcraft</span>
          </Link>

          <nav className="space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#F3E8FF] text-[#7342E2]" // active state (accent color)
                      : "text-muted hover:bg-gray-50 hover:text-ink"
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-hairline">
          <div className="mb-4 px-2">
            <p className="text-xs text-muted font-medium uppercase tracking-wider mb-2">Account</p>
            <p className="text-sm text-ink truncate">{user?.email}</p>
          </div>
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-gray-50 hover:text-ink transition-colors">
            <UserIcon size={18} strokeWidth={2} />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut size={18} strokeWidth={2} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[240px] relative">
        {children}
      </main>
    </div>
  );
}
