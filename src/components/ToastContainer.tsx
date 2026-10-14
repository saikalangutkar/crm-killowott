"use client";

import React from "react";
import { useCrm } from "@/context/CrmContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useCrm();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isWarning = toast.type === "warning";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-[1.25rem] bg-[#0a0a0a] text-white border border-[#e6e5e2]/20 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in"
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#cf8047]" aria-hidden="true" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" aria-hidden="true" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-400" aria-hidden="true" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-sky-400" aria-hidden="true" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white tracking-[-0.01em]">{toast.title}</p>
              <p className="text-xs text-[#8d8d8d] mt-0.5 leading-relaxed break-words">{toast.description}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-full text-[#8d8d8d] hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b15f2c]"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
