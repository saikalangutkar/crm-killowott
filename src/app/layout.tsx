import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { CrmProvider } from "@/context/CrmContext";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kilowott CRM | WooCommerce Integration & Agentic AI",
  description:
    "Editorial studio CRM for WooCommerce: deterministic guest resolution, real-time LTV segmentation, live order pipeline, and autonomous AI triage agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${onest.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#ffffff] text-[#111111] antialiased selection:bg-[#cf8047]/20 selection:text-[#97501f]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[9999] px-4 py-2 bg-[#0a0a0a] text-white rounded-full text-xs font-medium shadow-xl border border-[#b15f2c]"
        >
          Skip to main content
        </a>
        <CrmProvider>{children}</CrmProvider>
      </body>
    </html>
  );
}
