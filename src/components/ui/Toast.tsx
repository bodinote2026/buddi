"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type ToastVariant = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2500);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-4 z-[110] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-5">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-[13px] font-medium shadow-md ${
              toast.variant === "success"
                ? "bg-[#E8F8F0] text-[#1F7A4D]"
                : "bg-[#FDECEC] text-[#C0392B]"
            }`}
          >
            {toast.variant === "success" ? (
              <CheckCircle2 size={18} className="shrink-0" aria-hidden />
            ) : (
              <XCircle size={18} className="shrink-0" aria-hidden />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
