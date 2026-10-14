import { describe, it, expect } from "vitest";
import { CrmCopilotEngine } from "../crm-copilot";
import {
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_COMM_LOGS,
  INITIAL_TRIAGE_ALERTS,
} from "../seed-data";

describe("CrmCopilotEngine Natural Language Queries", () => {
  const engine = new CrmCopilotEngine();
  const context = {
    customers: INITIAL_CUSTOMERS,
    orders: INITIAL_ORDERS,
    alerts: INITIAL_TRIAGE_ALERTS,
    logs: INITIAL_COMM_LOGS,
  };

  it("handles VIP customer queries and returns formatted spend list", () => {
    const res = engine.answerQuery("Who are our top VIP customers?", context);
    expect(res.sender).toBe("copilot");
    expect(res.text).toContain("Elena Rostova");
    expect(res.text).toContain("LTV");
    expect(res.dataPoints?.some((dp) => dp.label === "VIP Count")).toBe(true);
    expect(res.suggestedActions?.length).toBeGreaterThan(0);
  });

  it("handles pending orders and pipeline bottleneck queries", () => {
    const res = engine.answerQuery("Which orders are pending fulfillment?", context);
    expect(res.sender).toBe("copilot");
    expect(res.text).toContain("pending orders");
    expect(res.dataPoints?.some((dp) => dp.label === "Pending")).toBe(true);
  });

  it("handles win-back recovery and cancelled order queries", () => {
    const res = engine.answerQuery("What is our status on order recovery campaigns?", context);
    expect(res.sender).toBe("copilot");
    expect(res.text).toContain("Win-Back recovery");
    expect(res.dataPoints?.some((dp) => dp.label === "Cancelled")).toBe(true);
  });

  it("drafts personalized outreach copy for a named customer", () => {
    const res = engine.answerQuery("Draft a thank you message for Elena", context);
    expect(res.sender).toBe("copilot");
    expect(res.text).toContain("Elena");
    expect(res.text).toContain("WhatsApp Concierge");
    expect(res.suggestedActions?.some((a) => a.actionType === "open_customer")).toBe(true);
  });

  it("returns overall CRM health summary on open-ended queries", () => {
    const res = engine.answerQuery("Give me an overview of the CRM", context);
    expect(res.sender).toBe("copilot");
    expect(res.text).toContain("Kilowott CRM Health Summary");
    expect(res.dataPoints?.some((dp) => dp.label === "Revenue")).toBe(true);
  });
});
