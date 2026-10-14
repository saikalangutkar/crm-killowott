"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ArrowRight } from "lucide-react";
import { BrandMark } from "./BrandMark";

interface RequestDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequestDemoModal({ isOpen, onClose }: RequestDemoModalProps) {
  const [storeUrl, setStoreUrl] = useState("");
  const [email, setEmail] = useState("");
  const [orderVolume, setOrderVolume] = useState("1000-5000");
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-[#ffffff] text-[#111111] rounded-[2rem] p-6 sm:p-8 border border-[#e6e5e2] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#8d8d8d] hover:text-[#111111] hover:bg-[#f1f0ee] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b15f2c]"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center">
            <BrandMark className="w-5 h-5 text-[#cf8047]" />
          </div>
          <div>
            <h2 id="demo-modal-title" className="text-xl font-bold tracking-tight text-[#111111]">
              Schedule Private Walkthrough
            </h2>
            <p className="text-xs text-[#8d8d8d]">
              Experience Kilowott CRM live on your WooCommerce staging store
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-[#b15f2c] animate-bounce" />
            <h3 className="text-lg font-bold text-[#111111]">Walkthrough Reserved</h3>
            <p className="text-xs text-[#8d8d8d] max-w-sm">
              Our engineering team will provision a dedicated sandbox instance connected to your WooCommerce webhook endpoint within 15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <div>
              <label htmlFor="store-url" className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                WooCommerce Store Domain
              </label>
              <input
                id="store-url"
                type="text"
                required
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="store.mybrand.com"
                className="w-full px-4 py-3 rounded-[0.875rem] bg-[#f1f0ee] border border-[#e6e5e2] text-sm text-[#111111] placeholder:text-[#8d8d8d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b15f2c]"
              />
            </div>

            <div>
              <label htmlFor="work-email" className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <input
                id="work-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@mybrand.com"
                className="w-full px-4 py-3 rounded-[0.875rem] bg-[#f1f0ee] border border-[#e6e5e2] text-sm text-[#111111] placeholder:text-[#8d8d8d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b15f2c]"
              />
            </div>

            <div>
              <label htmlFor="order-volume" className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1.5">
                Monthly Order Volume
              </label>
              <select
                id="order-volume"
                value={orderVolume}
                onChange={(e) => setOrderVolume(e.target.value)}
                className="w-full px-4 py-3 rounded-[0.875rem] bg-[#f1f0ee] border border-[#e6e5e2] text-sm text-[#111111] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b15f2c]"
              >
                <option value="500-1000">500 – 1,000 orders / mo</option>
                <option value="1000-5000">1,000 – 5,000 orders / mo</option>
                <option value="5000-25000">5,000 – 25,000 orders / mo</option>
                <option value="25000+">25,000+ enterprise volume</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e6e5e2]">
              <button
                type="button"
                onClick={onClose}
                className="pill-btn bg-[#f1f0ee] hover:bg-[#e3e2df] text-[#111111] text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pill-btn bg-[#b15f2c] hover:bg-[#cf8047] text-white text-xs flex items-center gap-2"
              >
                <span>Request Sandbox</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
