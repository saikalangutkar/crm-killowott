"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ASSETS } from "@/lib/assets";
import { LiquidHeroCanvas } from "./LiquidHeroCanvas";
import { BrandMark } from "./BrandMark";
import { ArrowRight, Sparkles, UserCheck, ShieldAlert, ArrowDown } from "lucide-react";

interface HeroSectionProps {
  loaderDone: boolean;
}

export function HeroSection({ loaderDone }: HeroSectionProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const carouselItems = [
    {
      badge: "VIP Concierge Alert",
      badgeColor: "bg-[#cf8047]/20 text-[#cf8047] border-[#cf8047]/40",
      icon: Sparkles,
      title: "Victoria Stirling ($1,450.00)",
      detail: "Patron spend crossed threshold. Autonomous concierge greeting dispatched via WhatsApp.",
      time: "Just now",
    },
    {
      badge: "Guest Resolution",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      icon: UserCheck,
      title: "Sarah Guest (customer_id: 0)",
      detail: "Deterministic mapping by email. Merged with historical profile. LTV updated to $240.00.",
      time: "2m ago",
    },
    {
      badge: "AI Recovery Campaign",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: ShieldAlert,
      title: "Cancelled Cart ($340.00)",
      detail: "Win-back email drafted with 15% recovery voucher SAVE15-RECOVER.",
      time: "5m ago",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  return (
    <section
      id="hero"
      aria-label="Hero Introduction"
      className="relative w-full min-h-[90vh] lg:min-h-[94vh] flex items-center overflow-hidden bg-[#0a0a0a] text-white"
    >
      {/* 1. Base Image - Model centered with face at center 30% */}
      <img
        src={ASSETS.heroModel}
        alt="Serene editorial model with headphones"
        className="absolute inset-0 w-full h-full object-cover object-[center_30%] select-none pointer-events-none"
      />

      {/* 2. Full-bleed Cursor Liquid Reveal Canvas */}
      <LiquidHeroCanvas />

      {/* 3. Vignette & Contrast Overlay so text and face are both balanced */}
      <div
        className="absolute inset-0 pointer-events-none select-none bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-[#0a0a0a]/75 lg:bg-gradient-to-r lg:from-[#0a0a0a]/95 lg:via-[#0a0a0a]/20 lg:to-[#0a0a0a]/85"
        aria-hidden="true"
      />

      {/* 4. Giant KILOWOTT Watermark at white/40% */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none text-white/40 font-black tracking-[-0.05em] text-[15vw] leading-none uppercase mix-blend-overlay z-0"
        aria-hidden="true"
      >
        KILOWOTT
      </div>

      {/* 5. Main Hero Container (Headline on Left, Glass Carousel on Right, Center Uncovered) */}
      <div className="relative z-20 w-full max-w-[88rem] mx-auto px-5 sm:px-8 py-16 lg:py-24 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12">
        {/* Left Column: Headline and Actions */}
        <div className="w-full lg:max-w-xl xl:max-w-2xl flex flex-col items-start">
          {/* Eyebrow Chip */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 border border-white/20 backdrop-blur-md text-xs font-mono tracking-wider uppercase text-[#cf8047] mb-6 transition-all duration-700 ${
              loaderDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <BrandMark className="w-3.5 h-3.5 text-[#cf8047]" />
            <span>Enterprise WooCommerce CRM Engine</span>
          </div>

          {/* H1 Headline: line-by-line clipped reveal over 900ms */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold tracking-[-0.02em] leading-[1.05] text-white mb-6">
            <span className="block overflow-hidden">
              <span
                className={`block transition-transform duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  loaderDone ? "translate-y-0" : "translate-y-full"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                Every order.
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className={`block transition-transform duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  loaderDone ? "translate-y-0" : "translate-y-full"
                }`}
                style={{ transitionDelay: "220ms" }}
              >
                Every customer.
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className={`block text-transparent bg-clip-text bg-gradient-to-r from-[#cf8047] via-amber-200 to-white transition-transform duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  loaderDone ? "translate-y-0" : "translate-y-full"
                }`}
                style={{ transitionDelay: "340ms" }}
              >
                One calm view.
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-base sm:text-lg text-[#f1f0ee]/90 max-w-lg font-light leading-relaxed mb-8 transition-all duration-700 ${
              loaderDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "450ms" }}
          >
            Deterministic guest checkout resolution, dynamic LTV segmentation strategies, real-time order Kanban pipelines, and autonomous AI concierge triage.
          </p>

          {/* Actions: Primary & Outline Pills */}
          <div
            className={`flex flex-wrap items-center gap-4 transition-all duration-700 ${
              loaderDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "550ms" }}
          >
            <Link
              href="/dashboard"
              className="pill-btn bg-[#b15f2c] hover:bg-[#cf8047] text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#b15f2c]/30"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="pill-btn bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md border border-white/25"
            >
              <span>See How It Works</span>
              <ArrowDown className="w-3.5 h-3.5 ml-1.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Right Column: Glass Carousel Card */}
        <div
          className={`w-full lg:max-w-xs xl:max-w-sm transition-all duration-700 ${
            loaderDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="p-5 rounded-[1.5rem] bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8d8d8d]">
                Live Event Stream
              </span>
              <div className="flex gap-1.5">
                {carouselItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      carouselIndex === i ? "w-5 bg-[#cf8047]" : "w-1.5 bg-white/30"
                    }`}
                    aria-label={`Show slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Active Carousel Item */}
            <div className="min-h-[140px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${carouselItems[carouselIndex].badgeColor}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {carouselItems[carouselIndex].badge}
                  </span>
                  <span className="text-[10px] font-mono text-[#8d8d8d]">
                    {carouselItems[carouselIndex].time}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight mb-1">
                  {carouselItems[carouselIndex].title}
                </h3>
                <p className="text-xs text-[#b6b6b6] leading-relaxed">
                  {carouselItems[carouselIndex].detail}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-[#8d8d8d] font-mono">OBSERVER PIPELINE</span>
                <Link
                  href="/dashboard"
                  className="text-xs text-[#cf8047] hover:text-white font-medium flex items-center gap-1 group"
                >
                  <span>Inspect in CRM</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
