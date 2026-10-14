# 3-Minute Hackathon Demo Script & Judge Presentation Guide

This guide provides a timed, high-impact demonstration script for pitching the **Kilowott CRM WooCommerce System Integration** to judges and technical evaluators.

- **Live Application URL**: [http://localhost:3000](http://localhost:3000)
- **Slide Deck URL**: [http://localhost:3000/presentation.html](http://localhost:3000/presentation.html)
- **Time Limit**: 3 Minutes (180 Seconds) + 2 Minutes Q&A

---

## 1. Fast-Path Click Sequence Cheat Sheet

```
[Start on http://localhost:3000]
  ↓
[Step 1] Point out KPI Cards ($2,840 Gross Revenue, 4 Customers, 50% VIP Impact).
  ↓
[Step 2] Click "Simulate WooCommerce Webhook" → Trigger "VIP Whale Order ($1,250.00)".
         → Show instant Toast notification & Gross Revenue update to $4,090.
  ↓
[Step 3] Click "Simulate WooCommerce Webhook" → Trigger "Guest Checkout ($145.00)".
         → Show customer_id = 0 mapped directly to Sarah Guest by email.
  ↓
[Step 4] Click "Elena Rostova" → 360° Customer Drawer slides open.
         → Show $1,420 LTV, order timeline, and "Communication Log" tab. Close drawer.
  ↓
[Step 5] In Kanban Pipeline, advance Order #1081 from "Pending" → click "Start Processing".
         → Show automated WhatsApp/Email notification logged.
  ↓
[Step 6] Switch to "AI Agent Triage Center" tab.
         → Show VIP Concierge Alert & Win-Back Recovery Campaign.
         → Click "Dispatch VIP Concierge (WhatsApp)" to approve.
  ↓
[Step 7] In Header, switch Strategy dropdown: "Tiered LTV" → "Order Frequency Strategy".
         → Show instant re-segmentation across database.
  ↓
[Step 8] Run terminal command: npm test (15 passed) & npm run test:e2e (7 passed).
```

---

## 2. Timed Spoken Script (3 Minutes)

### Minute 0:00 – 0:45: The Problem & Architecture
**Spoken Pitch**:
> *"Good morning, judges. Standard WooCommerce stores lose vital customer relationship signals every single day. Over 40% of orders occur as guest checkouts with `customer_id = 0`, fracturing order histories and blinding merchants to customer Lifetime Value.*
>
> *To solve this, we engineered Kilowott CRM using three classical design patterns in `src/lib/crm-engine.ts`:*
> 1. *The **Adapter Pattern** (`WooCommerceAdapter`) to normalize messy webhook schemas and merge guest checkouts by email.*
> 2. *The **Strategy Pattern** (`SegmentationStrategy`) to enable dynamic customer tier classification.*
> 3. *The **Observer Pattern** (`WorkflowEngine`) to drive automated omnichannel notifications and our embedded **AI Triage Agent**."*

---

### Minute 0:45 – 1:30: Live Webhook Simulator & Guest Checkout Resolution
**Action on Screen**:
1. Click the primary button: **"Simulate WooCommerce Webhook"**.
2. Show the 4 presets in the modal.
3. Click **"Trigger"** on **"VIP Whale Order ($1,250.00)"**.
4. Point out the instant toast notification and the live Gross Revenue update.
5. Click **"Simulate WooCommerce Webhook"** again and trigger **"Guest Checkout ($145.00)"**.

**Spoken Pitch**:
> *"Let’s see it in action. Our Live Webhook Simulator mimics incoming production WooCommerce events. When I trigger a high-value $1,250 order, the Adapter Pattern parses the event, recalculates customer LTV in real-time, and fires our Observer engine.*
>
> *Next, notice this Guest Checkout order. WooCommerce sends `customer_id: 0`. Instead of creating an orphaned orphan record, our adapter matches `billing.email`, links the purchase to Sarah Guest, recalculates her cumulative spend, and tags her appropriately."*

---

### Minute 1:30 – 2:15: 360° Customer Drawer & Kanban Pipeline
**Action on Screen**:
1. In the customer roster, click on **"Elena Rostova"**.
2. The **360° Customer Drawer** slides open from the right.
3. Point out her `$1,420 LTV`, `$473.33 AOV`, itemized orders, and shipping address.
4. Click the **"Communication Log"** tab inside the drawer to show delivered messages.
5. Close the drawer.
6. In the Kanban Pipeline, find Order `#1081` and click **"Start Processing"**.

**Spoken Pitch**:
> *"Clicking on any customer opens their 360° Profile Drawer. Here we see Elena Rostova: her $1,420 LTV, full purchase timeline, and a live omnichannel ledger of every Email and WhatsApp message dispatched to her.*
>
> *Our pipeline isn't a static board. Advancing an order from 'Pending' to 'Processing' immediately dispatches simulated packing alerts via WhatsApp and recalculates store velocity."*

---

### Minute 2:15 – 3:00: Autonomous AI Triage & Verification
**Action on Screen**:
1. Click the **"AI Agent Triage Center"** tab.
2. Show the **VIP Concierge Alert** and the **Cancelled-Order Win-Back Campaign**.
3. Click **"Dispatch VIP Concierge (WhatsApp)"** to approve the alert.
4. In the Header, toggle the **"Strategy:"** dropdown from *Tiered LTV Strategy* to *Order Frequency Strategy*.
5. Highlight the instant recalculation of customer segments.
6. Mention the automated test suites: 15 Vitest tests and 7 Playwright E2E tests.

**Spoken Pitch**:
> *"Finally, our crowning capability: the embedded **AI Triage Agent**. When high-value patrons order, our AI autonomously synthesizes their loyalty history and drafts bespoke concierge briefing notes. And when orders are cancelled, it calculates optimal discount codes—like `COMEBACK-1077`—and drafts high-converting recovery emails.*
>
> *With our Strategy Pattern, switching segmentation logic from LTV to purchase frequency happens at runtime without touching a single line of backend code.*
>
> *Every single pattern and workflow is backed by **15 passing Vitest unit tests** and **7 automated Playwright E2E tests**, ensuring production-ready reliability. Thank you, and I welcome your questions!"*

---

## 3. Anticipated Judge Q&A Cheat Sheet

| Question | Winning Answer |
|:---|:---|
| **"Why implement design patterns instead of simple helper functions?"** | *"Helper functions quickly become tangled when payload schemas drift or side-effects multiply. The **Adapter Pattern** guarantees our core CRM remains completely agnostic of WooCommerce schema changes. The **Strategy Pattern** satisfies the Open/Closed Principle—adding RFM or Machine Learning clustering requires zero edits to existing segmentation code. The **Observer Pattern** ensures sending a WhatsApp message or running AI triage never blocks core transaction ingestion."* |
| **"How do you handle guest checkouts without duplicate records?"** | *"In WooCommerce, guest checkouts assign `customer_id: 0`. Our `WooCommerceAdapter` extracts `billing.email` as the canonical entity key. If a customer with that email already exists—even from a registered account—the new order is merged into their record, updating their cumulative LTV and purchase count."* |
| **"How do you prevent the AI Triage Agent from hallucinating or spamming?"** | *"We employ a Human-in-the-Loop (HITL) approval gateway: the AI agent generates the synthesized analysis, coupon code, and message copy, but human operators review and dispatch via 1-click approvals in the Triage Center. Furthermore, our `AiTriageObserver` enforces deduplication constraints so no duplicate pending alerts are created for the same event."* |
| **"What is the test coverage and reliability?"** | *"We have dual-layer test coverage: 15 unit tests in Vitest running in 37ms covering all boundary conditions ($199 vs $200 LTV, guest mapping, observer notifications), and 7 Playwright E2E tests executing real browser user journeys."* |

---

## 4. Operational Testing Commands for Judges

To verify the test suite live:

```bash
# Run Vitest Unit Tests (15 tests covering Adapter, Strategy, Observer, AI Triage)
npm test

# Run Playwright E2E Tests (7 tests validating full browser user journeys)
npm run test:e2e

# Run Next.js Turbopack Production Build
npm run build
```
