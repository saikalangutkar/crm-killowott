"use client";

import React, { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import { StudioLoader } from "@/components/StudioLoader";
import { LandingHeader } from "@/components/LandingHeader";
import { HeroSection } from "@/components/HeroSection";
import {
  AboutSection,
  PillBandSection,
  FeaturesSection,
  CapabilitiesSection,
  StatsSection,
  LandingFooter,
} from "@/components/LandingSections";
import { MenuOverlay } from "@/components/MenuOverlay";
import { RequestDemoModal } from "@/components/RequestDemoModal";
import { ToastContainer } from "@/components/ToastContainer";

export default function LandingPage() {
  const [loaderDone, setLoaderDone] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let reqId: number;
    function raf(time: number) {
      lenis.raf(time);
      reqId = requestAnimationFrame(raf);
    }
    reqId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
    };
  }, []);

  // Stop Lenis while any overlay is open
  useEffect(() => {
    if (isMenuOpen || isDemoOpen) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
  }, [isMenuOpen, isDemoOpen]);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#111111] relative selection:bg-[#cf8047]/20 selection:text-[#97501f]">
      {/* 1. Full-screen Studio Loader (000 -> 100 with easeInOutCubic over 1300ms) */}
      <StudioLoader onComplete={() => setLoaderDone(true)} />

      {/* 2. Header with Live Clock Chip & Menu Button */}
      <LandingHeader
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      {/* Main Content Landmark */}
      <main id="main-content">
        {/* 3. Hero with Cursor Liquid Reveal Canvas */}
        <HeroSection loaderDone={loaderDone} />

        {/* 4. About with Word-by-Word Staggered Reveal */}
        <AboutSection />

        {/* 5. Sync / Segment / Automate Pill Band */}
        <PillBandSection />

        {/* 6. Features: 4 Ink-Black Cards with Watermarks */}
        <FeaturesSection />

        {/* 7. Capabilities List: Rows filling with #f1f0ee on hover */}
        <CapabilitiesSection />

        {/* 8. Stats Panel: Animated Metrics */}
        <StatsSection />
      </main>

      {/* 9. Ink-Black Footer */}
      <LandingFooter onOpenDemo={() => setIsDemoOpen(true)} />

      {/* 10. Full-screen Dark Menu Overlay */}
      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onRequestDemo={() => setIsDemoOpen(true)}
      />

      {/* 11. Request Demo Modal Dialog */}
      <RequestDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />

      {/* 12. Floating Toast Container */}
      <ToastContainer />
    </div>
  );
}
