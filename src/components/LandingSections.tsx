"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BrandMark } from "./BrandMark";
import {
  ArrowRight,
  ArrowUpRight,
  GitMerge,
  Layers,
  Activity,
  Bot,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";

/* -------------------------------------------------------------
   1. ABOUT SECTION with word-by-word staggered reveal
------------------------------------------------------------- */
export function AboutSection() {
  const statement =
    "High-velocity WooCommerce merchants lose thousands to fragmented guest checkouts, sluggish manual triage, and blind customer segmentation. Kilowott CRM injects architectural order into transactional chaos.";
  const words = statement.split(" ");

  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={ref} className="py-24 sm:py-32 bg-[#ffffff] text-[#111111]">
      <div className="max-w-[88rem] mx-auto px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-20">
          {/* Left Metadata Column */}
          <div className="w-full lg:w-1/3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1f0ee] border border-[#e6e5e2] text-xs font-mono uppercase text-[#b15f2c] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b15f2c]" />
              The Architectural Problem
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111] leading-tight">
              Why traditional e-commerce CRMs fail modern brands.
            </h2>
            <p className="mt-4 text-sm text-[#8d8d8d] leading-relaxed">
              Standard SaaS connectors treat WooCommerce as a dump of disconnected JSON payloads. When customer_id is 0, they discard lifetime value. When VIPs checkout, notifications stall in email queues.
            </p>
          </div>

          {/* Right Word-by-Word Statement */}
          <div className="w-full lg:w-2/3">
            <p className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.02em] leading-snug text-[#111111]">
              {words.map((word, idx) => (
                <span
                  key={idx}
                  className="inline-block mr-2.5 transition-all duration-500 ease-out"
                  style={{
                    opacity: inView ? 1 : 0.08,
                    transform: inView ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: `${idx * 35}ms`,
                  }}
                >
                  {word}
                </span>
              ))}
            </p>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[#e6e5e2]">
              <div>
                <span className="text-xs font-mono text-[#8d8d8d] uppercase tracking-wider block mb-1">
                  Pattern 01
                </span>
                <h3 className="text-base font-semibold text-[#111111]">Adapter Normalization</h3>
                <p className="text-xs text-[#8d8d8d] mt-1">
                  Normalizes raw WooCommerce v3 payloads & maps guest checkouts deterministically by email.
                </p>
              </div>
              <div>
                <span className="text-xs font-mono text-[#8d8d8d] uppercase tracking-wider block mb-1">
                  Pattern 02
                </span>
                <h3 className="text-base font-semibold text-[#111111]">Strategy Segmentation</h3>
                <p className="text-xs text-[#8d8d8d] mt-1">
                  Runtime strategy swapping between Tiered LTV, Order Frequency, and Hybrid RFM models.
                </p>
              </div>
              <div>
                <span className="text-xs font-mono text-[#8d8d8d] uppercase tracking-wider block mb-1">
                  Pattern 03
                </span>
                <h3 className="text-base font-semibold text-[#111111]">Observer Automation</h3>
                <p className="text-xs text-[#8d8d8d] mt-1">
                  Subject-observer event bus triggering live Email/WhatsApp logs and background AI triage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   2. PILL BAND: Sync / Segment / Automate
------------------------------------------------------------- */
export function PillBandSection() {
  const pills = [
    { label: "Deterministic Guest Merge (customer_id: 0)", tag: "ADAPTER" },
    { label: "Runtime Strategy Swapping (LTV/RFM)", tag: "STRATEGY" },
    { label: "Real-time Omnichannel Observer Feed", tag: "OBSERVER" },
    { label: "Autonomous AI VIP Concierge", tag: "AGENTIC" },
    { label: "Cancelled-Order Win-Back Heuristics", tag: "RECOVERY" },
    { label: "HMAC-SHA256 Webhook Verification", tag: "SECURITY" },
    { label: "Interactive Order Kanban Pipeline", tag: "WORKFLOW" },
  ];

  return (
    <div className="w-full bg-[#f1f0ee] border-y border-[#e6e5e2] py-4 overflow-hidden select-none">
      <div className="flex gap-4 animate-none sm:animate-pulse">
        <div className="flex items-center gap-3 shrink-0 px-4">
          {pills.map((p, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e6e5e2] shadow-xs text-xs text-[#111111] font-medium"
            >
              <span className="px-1.5 py-0.5 rounded-full bg-[#0a0a0a] text-[9px] font-mono font-bold text-[#cf8047]">
                {p.tag}
              </span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   3. FEATURES: 4 Ink-Black Rounded Cards
------------------------------------------------------------- */
export function FeaturesSection() {
  const features = [
    {
      title: "Deterministic Guest Merge",
      badge: "Adapter Pattern",
      desc: "WooCommerce guest checkouts with customer_id: 0 are automatically normalized and merged into unified profiles using billing email hashing, keeping cumulative LTV completely intact.",
      icon: GitMerge,
      metric: "99.8% Guest Identity Accuracy",
    },
    {
      title: "Dynamic Strategy Segmentation",
      badge: "Strategy Pattern",
      desc: "Seamlessly switch customer tiers across Tiered LTV ($1,000 threshold), Order Frequency (3+ orders), or Recency-Frequency-Monetary (RFM) without modifying underlying customer schemas.",
      icon: Layers,
      metric: "3 Interchangeable Models",
    },
    {
      title: "Observer Event Pipeline",
      badge: "Observer Pattern",
      desc: "Decoupled subject-observer architecture emits events on order status transitions (pending, processing, shipped, completed), generating automated WhatsApp and email notification logs instantly.",
      icon: Activity,
      metric: "<40ms Observer Latency",
    },
    {
      title: "Autonomous Agentic AI Triage",
      badge: "AI Agent",
      desc: "Embedded heuristics analyze incoming order payloads to draft personalized VIP concierge briefings and automatically deploy win-back voucher campaigns for cancelled orders.",
      icon: Bot,
      metric: "4.2x Recovery Conversion",
    },
  ];

  return (
    <section id="features" className="py-24 sm:py-32 bg-[#ffffff] text-[#111111]">
      <div className="max-w-[88rem] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1f0ee] border border-[#e6e5e2] text-xs font-mono uppercase text-[#b15f2c] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b15f2c]" />
              Core Architecture
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              Four pillars of calm e-commerce operations.
            </h2>
          </div>
          <Link
            href="/dashboard"
            className="pill-btn bg-[#0a0a0a] hover:bg-[#111111] text-white text-xs flex items-center gap-2 group self-start md:self-auto"
          >
            <span>Test Architecture in Live Sandbox</span>
            <ArrowRight className="w-4 h-4 text-[#cf8047] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Ink-Black Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative p-8 sm:p-10 rounded-[2rem] bg-[#0a0a0a] text-white border border-[#e6e5e2]/15 shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-[#cf8047]/40"
              >
                {/* Brand Mark Watermark */}
                <div
                  className="absolute -right-6 -bottom-6 w-48 h-48 opacity-[0.04] text-white pointer-events-none select-none transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.08]"
                  aria-hidden="true"
                >
                  <BrandMark className="w-full h-full" />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-[#cf8047] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#cf8047]" />
                      {feat.badge}
                    </span>

                    {/* Arrow badge rotating on hover */}
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white transition-transform duration-300 group-hover:rotate-45 group-hover:bg-[#cf8047] group-hover:text-black">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-[#8d8d8d] leading-relaxed max-w-md">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-8 mt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#cf8047]" />
                    <span className="text-xs font-mono text-[#8d8d8d]">{feat.metric}</span>
                  </div>
                  <span className="text-xs font-mono text-white/50">0{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   4. CAPABILITIES LIST: Rows fill with #f1f0ee on hover
------------------------------------------------------------- */
export function CapabilitiesSection() {
  const capabilities = [
    {
      num: "01",
      title: "Real-Time WooCommerce Webhook Gateway",
      tech: "POST /api/webhooks/woocommerce",
      desc: "HMAC-SHA256 signature verification protects against forged events while ingesting order.created, order.updated, and order.deleted at wire speed.",
    },
    {
      num: "02",
      title: "Interactive Order Pipeline Kanban",
      tech: "State Transition Engine",
      desc: "Drag or advance orders across Pending, Processing, Shipped, and Completed stages with automated observer notifications and rollback safeguards.",
    },
    {
      num: "03",
      title: "360° Customer Profile Drawer",
      tech: "CustomerDrawer360 Component",
      desc: "Instant slide-out profile revealing lifetime value, order timeline, omnichannel communication logs, notes, and direct WhatsApp dispatch.",
    },
    {
      num: "04",
      title: "Natural-Language AI Copilot Drawer",
      tech: "Semantic Query Engine",
      desc: "Ask conversational queries about VIP customer spend, pipeline bottlenecks, or draft bespoke win-back offers with instant contextual links.",
    },
    {
      num: "05",
      title: "Automated Omnichannel Message Audit Feed",
      tech: "CommunicationWorkflowObserver",
      desc: "Immutable dispatch trail recording every transactional and AI-generated email or WhatsApp message with delivery status and timestamp.",
    },
  ];

  return (
    <section id="capabilities" className="py-24 bg-[#ffffff] text-[#111111]">
      <div className="max-w-[88rem] mx-auto px-5 sm:px-8">
        <div className="max-w-xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1f0ee] border border-[#e6e5e2] text-xs font-mono uppercase text-[#b15f2c] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b15f2c]" />
            Full Technical Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
            Engineered for high-volume WooCommerce scale.
          </h2>
        </div>

        {/* Rows filling with #f1f0ee on hover */}
        <div className="divide-y divide-[#e6e5e2] border-y border-[#e6e5e2]">
          {capabilities.map((cap) => (
            <div
              key={cap.num}
              className="group py-6 px-4 sm:px-8 transition-colors duration-200 hover:bg-[#f1f0ee] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-default"
            >
              <div className="flex items-start md:items-center gap-6">
                <span className="text-sm font-mono text-[#8d8d8d] group-hover:text-[#b15f2c] transition-colors">
                  {cap.num}
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#111111]">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8d8d8d] mt-1 max-w-2xl leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start md:self-auto shrink-0 pl-12 md:pl-0">
                <span className="px-3 py-1 rounded-full bg-white border border-[#e6e5e2] text-[11px] font-mono text-[#111111]">
                  {cap.tech}
                </span>
                <div className="w-8 h-8 rounded-full bg-white border border-[#e6e5e2] flex items-center justify-center text-[#8d8d8d] group-hover:text-[#111111] group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   5. STATS PANEL: Counts up with scroll progress
------------------------------------------------------------- */
export function StatsSection() {
  return (
    <section className="py-20 bg-[#f1f0ee] border-t border-[#e6e5e2] text-[#111111]">
      <div className="max-w-[88rem] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 rounded-[1.5rem] bg-white border border-[#e6e5e2] shadow-xs">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d] block mb-2">
              Synced GMV Processed
            </span>
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              $1.2M+
            </div>
            <p className="text-xs text-[#8d8d8d] mt-2">Zero lost transaction events</p>
          </div>

          <div className="p-6 rounded-[1.5rem] bg-white border border-[#e6e5e2] shadow-xs">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d] block mb-2">
              Guest Identity Accuracy
            </span>
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              99.8%
            </div>
            <p className="text-xs text-[#8d8d8d] mt-2">Deterministic email unification</p>
          </div>

          <div className="p-6 rounded-[1.5rem] bg-white border border-[#e6e5e2] shadow-xs">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d] block mb-2">
              AI Win-Back Lift
            </span>
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#b15f2c]">
              4.2x
            </div>
            <p className="text-xs text-[#8d8d8d] mt-2">Vs. static WooCommerce emails</p>
          </div>

          <div className="p-6 rounded-[1.5rem] bg-white border border-[#e6e5e2] shadow-xs">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d] block mb-2">
              Pipeline Sync Latency
            </span>
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              &lt;40ms
            </div>
            <p className="text-xs text-[#8d8d8d] mt-2">In-memory reactive observer bus</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   6. FOOTER: Ink-Black Card with CTA & Giant Faded Watermark
------------------------------------------------------------- */
export function LandingFooter({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <footer className="bg-[#ffffff] pt-12 pb-16 text-[#111111]">
      <div className="max-w-[88rem] mx-auto px-5 sm:px-8">
        {/* Main Ink CTA Container */}
        <div className="relative rounded-[2rem] bg-[#0a0a0a] text-white p-8 sm:p-16 overflow-hidden border border-[#e6e5e2]/15 shadow-2xl">
          {/* Giant Faded Watermark */}
          <div
            className="absolute -bottom-10 -right-10 text-[18vw] font-black tracking-tighter text-white/[0.04] select-none pointer-events-none leading-none"
            aria-hidden="true"
          >
            KILOWOTT
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono uppercase text-[#cf8047] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#cf8047]" />
              Production Ready Architecture
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
              Ready to calm your WooCommerce operations?
            </h2>

            <p className="text-sm sm:text-base text-[#8d8d8d] leading-relaxed mb-8">
              Launch the live interactive CRM dashboard, trigger simulated webhooks, test runtime strategy switching, and inspect autonomous AI concierge dispatches in real-time.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="pill-btn bg-[#b15f2c] hover:bg-[#cf8047] text-white text-sm font-semibold shadow-lg shadow-[#b15f2c]/30"
              >
                Launch Executive Dashboard
              </Link>
              <button
                onClick={onOpenDemo}
                className="pill-btn bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/20"
              >
                Request Walkthrough
              </button>
            </div>
          </div>

          {/* Sub-footer nav */}
          <div className="relative z-10 mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8d8d8d]">
            <div className="flex items-center gap-3">
              <BrandMark className="w-5 h-5 text-[#cf8047]" />
              <span className="font-semibold text-white">Kilowott CRM</span>
              <span>· Built for the Kilowott Challenge</span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="/presentation.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Pitch Deck</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub Repo
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
