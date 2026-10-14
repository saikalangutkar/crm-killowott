"use client";

import React, { useState } from "react";
import { DashboardTopBar } from "@/components/DashboardTopBar";
import { DashboardKpis } from "@/components/DashboardKpis";
import { DashboardOrderPipeline } from "@/components/DashboardOrderPipeline";
import { DashboardCustomersTable } from "@/components/DashboardCustomersTable";
import { DashboardAiTriageCenter } from "@/components/DashboardAiTriageCenter";
import { DashboardCommunicationFeed } from "@/components/DashboardCommunicationFeed";
import { DashboardWebhookSimulator } from "@/components/DashboardWebhookSimulator";
import { DashboardAiCopilotDrawer } from "@/components/DashboardAiCopilotDrawer";
import { ToastContainer } from "@/components/ToastContainer";
import { Kanban, Users, Bot, MessageSquare, Terminal } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "customers" | "triage" | "comms">("pipeline");
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#111111] flex flex-col selection:bg-[#cf8047]/20 selection:text-[#97501f]">
      {/* 1. Dashboard Top Bar */}
      <DashboardTopBar
        onOpenSimulator={() => setSimulatorOpen(true)}
        onOpenCopilot={() => setCopilotOpen(true)}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-[88rem] w-full mx-auto px-5 sm:px-8 py-8 flex flex-col gap-8">
        {/* 2. Executive KPI Overview */}
        <DashboardKpis />

        {/* 3. Section Navigation Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#e6e5e2]">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`pill-btn text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "pipeline"
                ? "bg-[#0a0a0a] text-white shadow-xs"
                : "bg-[#f1f0ee] text-[#8d8d8d] hover:text-[#111111] hover:bg-[#e3e2df]"
            }`}
          >
            <Kanban className="w-3.5 h-3.5 text-[#cf8047]" />
            <span>Order Pipeline Kanban</span>
          </button>

          <button
            onClick={() => setActiveTab("customers")}
            className={`pill-btn text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "customers"
                ? "bg-[#0a0a0a] text-white shadow-xs"
                : "bg-[#f1f0ee] text-[#8d8d8d] hover:text-[#111111] hover:bg-[#e3e2df]"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#cf8047]" />
            <span>360° Customer Directory</span>
          </button>

          <button
            onClick={() => setActiveTab("triage")}
            className={`pill-btn text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "triage"
                ? "bg-[#0a0a0a] text-white shadow-xs"
                : "bg-[#f1f0ee] text-[#8d8d8d] hover:text-[#111111] hover:bg-[#e3e2df]"
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#cf8047]" />
            <span>AI Agent Triage Center</span>
          </button>

          <button
            onClick={() => setActiveTab("comms")}
            className={`pill-btn text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "comms"
                ? "bg-[#0a0a0a] text-white shadow-xs"
                : "bg-[#f1f0ee] text-[#8d8d8d] hover:text-[#111111] hover:bg-[#e3e2df]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#cf8047]" />
            <span>Live Communication Feed</span>
          </button>
        </div>

        {/* 4. Active Section Content */}
        {activeTab === "pipeline" && <DashboardOrderPipeline />}
        {activeTab === "customers" && <DashboardCustomersTable />}
        {activeTab === "triage" && <DashboardAiTriageCenter />}
        {activeTab === "comms" && <DashboardCommunicationFeed />}
      </main>

      {/* 5. Webhook Simulator Modal */}
      <DashboardWebhookSimulator
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      {/* 6. AI Copilot Drawer */}
      <DashboardAiCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />

      {/* 7. Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
