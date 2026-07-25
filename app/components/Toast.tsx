"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-[fadeInUp_0.3s_ease-out]">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
              toast.type === "success"
                ? "bg-white border-emerald-200 text-emerald-700"
                : "bg-white border-red-200 text-red-700"
            }`}
          >
            {toast.type === "success" ? "✓" : "✕"} {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
