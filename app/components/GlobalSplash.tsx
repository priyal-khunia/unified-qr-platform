"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

export default function GlobalSplash() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2.2 seconds on initial load
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "linear-gradient(145deg, #192837 0%, #0f1c27 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Background glowing orb */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              position: "absolute", width: 400, height: 400, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(115,66,226,0.2) 0%, transparent 70%)",
            }}
          />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}
          >
            <Logo size={64} color="#F2F2EE" />
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              style={{
                fontFamily: "var(--font-heading)", fontSize: "2.5rem",
                color: "#F2F2EE", letterSpacing: "-0.02em", margin: 0,
              }}
            >
              QRcraft
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
              style={{ height: 3, background: "#7342E2", borderRadius: 10 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
