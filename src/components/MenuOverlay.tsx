"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { X, ArrowUpRight } from "lucide-react";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestDemo: () => void;
}

export function MenuOverlay({ isOpen, onClose, onRequestDemo }: MenuOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const links = [
    { label: "Executive Dashboard", href: "/dashboard", desc: "Real-time WooCommerce operations" },
    { label: "Core Architecture", href: "#features", desc: "Adapter, Strategy & Observer Patterns" },
    { label: "Agentic AI Triage", href: "#capabilities", desc: "VIP concierge & win-back recoveries" },
    { label: "Engineering Story", href: "#about", desc: "Philosophy of calm e-commerce CRM" },
    { label: "Pitch Presentation", href: "/presentation.html", desc: "8-slide interactive pitch deck", external: true },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation Menu"
      className="fixed inset-0 z-[9990] bg-[#0a0a0a] text-white flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-300"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <BrandMark className="w-8 h-8 text-[#cf8047]" />
          <span className="text-lg font-bold tracking-tight text-white">Kilowott CRM</span>
        </div>
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full text-[#8d8d8d] hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b15f2c]"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Nav Links */}
      <nav aria-label="Main Navigation" className="flex flex-col gap-6 sm:gap-8 my-auto py-8">
        {links.map((item, idx) => (
          <div
            key={item.label}
            className="group flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/10 pb-4 transition-all"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.02em] text-white group-hover:text-[#cf8047] transition-colors flex items-center gap-3"
              >
                <span>{item.label}</span>
                <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>
            ) : (
              <Link
                href={item.href}
                onClick={onClose}
                className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.02em] text-white group-hover:text-[#cf8047] transition-colors flex items-center gap-3"
              >
                <span>{item.label}</span>
                <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </Link>
            )}
            <span className="text-xs sm:text-sm text-[#8d8d8d] font-mono">{item.desc}</span>
          </div>
        ))}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
        <div className="text-xs text-[#8d8d8d] font-mono">
          KILOWOTT DESIGN STUDIO · NEXT.JS 16 APP ROUTER
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              onClose();
              onRequestDemo();
            }}
            className="pill-btn bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20"
          >
            Request Live Demo
          </button>
          <Link
            href="/dashboard"
            onClick={onClose}
            className="pill-btn bg-[#b15f2c] hover:bg-[#cf8047] text-white text-xs"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
