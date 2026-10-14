"use client";

import React from "react";
import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { LiveClockChip } from "./LiveClockChip";
import { Menu, ArrowRight } from "lucide-react";

interface LandingHeaderProps {
  onOpenMenu: () => void;
  onOpenDemo: () => void;
}

export function LandingHeader({ onOpenMenu, onOpenDemo }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#ffffff]/85 backdrop-blur-md border-b border-[#e6e5e2]/80 transition-all">
      <div className="max-w-[88rem] mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b15f2c] rounded-full p-1 -ml-1"
          aria-label="Kilowott CRM Home"
        >
          <div className="w-9 h-9 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center shadow-xs">
            <BrandMark className="w-5 h-5 text-[#cf8047]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#111111] leading-none">
              Kilowott CRM
            </span>
            <span className="text-[10px] text-[#8d8d8d] font-mono tracking-wider uppercase mt-0.5">
              WooCommerce AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-1 bg-[#f1f0ee] p-1.5 rounded-full border border-[#e6e5e2]">
          <Link
            href="#hero"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[#111111] hover:bg-white hover:shadow-xs transition-all"
          >
            Home
          </Link>
          <Link
            href="#features"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[#111111] hover:bg-white hover:shadow-xs transition-all"
          >
            Features
          </Link>
          <Link
            href="#capabilities"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[#111111] hover:bg-white hover:shadow-xs transition-all"
          >
            Capabilities
          </Link>
          <Link
            href="#about"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[#111111] hover:bg-white hover:shadow-xs transition-all"
          >
            About
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#b15f2c] hover:bg-white hover:shadow-xs transition-all"
          >
            Dashboard
          </Link>
          <button
            onClick={onOpenDemo}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[#8d8d8d] hover:text-[#111111] hover:bg-white hover:shadow-xs transition-all cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <LiveClockChip className="hidden sm:inline-flex" />

          <button
            onClick={onOpenDemo}
            className="hidden md:inline-flex pill-btn bg-[#f1f0ee] hover:bg-[#e3e2df] text-[#111111] text-xs border border-[#e6e5e2]"
          >
            Request Walkthrough
          </button>

          <Link
            href="/dashboard"
            className="pill-btn bg-[#0a0a0a] hover:bg-[#111111] text-white text-xs flex items-center gap-2 group shadow-sm"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#cf8047] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={onOpenMenu}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full text-[#111111] hover:bg-[#f1f0ee] border border-transparent hover:border-[#e6e5e2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b15f2c]"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
