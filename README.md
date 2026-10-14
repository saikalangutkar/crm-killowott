# Kilowott CRM — WooCommerce System Integration & Agentic AI

An enterprise-grade Customer Relationship Management (CRM) system integrated with **WooCommerce**, built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS**.

The platform ingests real-time e-commerce transaction streams, calculates Customer Lifetime Value (LTV), dynamically classifies patron tiers via swappable segmentation algorithms, provides a **360° Customer Drawer**, coordinates omnichannel communication logs (Email & WhatsApp), and embeds an **Autonomous AI Triage Agent** for VIP concierge briefings and cancelled-order recovery campaigns.

> **Presentation & Evaluation Quick Links**:
> - 📊 **Live Interactive Slide Deck**: [http://localhost:3000/presentation.html](http://localhost:3000/presentation.html)
> - ⏱️ **3-Minute Hackathon Demo Script & Judge Q&A**: [`DEMO_SCRIPT.md`](file:///d:/hackathon-kilowott-crm/kilowott-crm/DEMO_SCRIPT.md)
> - 🤖 **Agentic AI & Triage Documentation**: [`AI_USAGE.md`](file:///d:/hackathon-kilowott-crm/kilowott-crm/AI_USAGE.md)
> - 🏗️ **Implementation Plan & Architecture**: [`implementation_plan.md`](file:///d:/hackathon-kilowott-crm/kilowott-crm/implementation_plan.md)

---

## 1. Scope Definition & Key Features

### 1.1 Customer Data Management
- **WooCommerce Ingestion & Normalization**: Transforms external WooCommerce webhook schemas into clean CRM domain models (`CrmCustomer`, `CrmOrder`).
- **Guest Checkout Resolution (`customer_id = 0`)**: Automatically isolates `billing.email` as the canonical customer identity. If a guest places multiple orders with the same email or later creates an account, all orders and cumulative spend merge seamlessly.
- **Dynamic Lifetime Value (LTV) & AOV**: Recomputes cumulative spend and average order values in real-time across order status changes.
- **Auto-Segmentation**: Dynamically categorizes customers into `New` (<$200), `Repeat` ($200–$499), and `VIP` ($500+).
- **360° Customer Drawer**: Interactive slide-over drawer displaying customer profile, LTV KPIs, address books, itemized historical order timelines, omnichannel communication logs, and direct concierge outreach controls.

### 1.2 Order Tracking Pipeline
- **Real-Time Kanban Pipeline**: Visual stages for `Pending Payment` ➔ `Fulfillment & Packing` ➔ `Out for Delivery` ➔ `Delivered & Completed`, plus a dedicated view for `Cancelled` orders.
- **Interactive Lifecycle Transitions**: Action buttons advance orders through stages, automatically recalculating customer metrics and firing observer events.

### 1.3 Communication Workflows & Embedded Agentic AI
- **Omnichannel Communication Ledger**: Automatically logs customer notifications across stages:
  - `Order Created (Pending)`: Confirmation Email & WhatsApp message.
  - `Processing`: Warehouse fulfillment alert.
  - `Shipped`: Dispatch notice with tracking link.
  - `Completed`: Delivered confirmation & feedback request.
  - `Cancelled`: Order cancellation alert.
- **Embedded AI Triage Agent**:
  - **VIP Concierge Alert**: Detects high-value orders (≥$500) or VIP status. Generates personalized briefings (spending history, line items, priority handling instructions) with a 1-click VIP WhatsApp greeting dispatch.
  - **Cancelled-Order Discount Recovery**: Automatically triggers upon order cancellation, synthesizing abandoned items and issuing a targeted win-back discount promo code (e.g., `COMEBACK-xxx`) with personalized email recovery copy.

### 1.4 Live Webhook Simulator
- A dedicated **"Simulate WooCommerce Webhook"** trigger on the main dashboard with 4 one-click demo presets:
  1. `Standard Order ($89.00)`: New customer order.
  2. `VIP Whale Order ($1,250.00)`: Luxury order triggering instant VIP status & AI Concierge alert.
  3. `Guest Checkout Order ($145.00)`: `customer_id = 0` mapped by email `sarah.guest@example.com`.
  4. `Order Cancellation ($340.00)`: Order cancellation triggering AI discount recovery.
  - *Plus* an interactive custom JSON payload editor.

---

## 2. Key Architecture & Design Patterns

The core engine in `src/lib/crm-engine.ts` implements three classical software design patterns:

### Pattern 1: Adapter Pattern (`WooCommerceAdapter`)
- **Problem**: WooCommerce webhooks transmit snake_case fields, raw strings for numeric amounts, nested billing/shipping blocks, and `customer_id: 0` for guest checkouts.
- **Solution**: The `WooCommerceAdapter` normalizes payloads into strongly-typed `CrmOrder` and `CrmCustomer` domain models.
- **Guest Resolution**: If `customer_id === 0`, extracts `billing.email` as the immutable entity key, mapping to existing customers or creating a new profile with tag `["Guest Checkout"]`.
- **Code Reference**: [`src/lib/crm-engine.ts`](file:///d:/hackathon-kilowott-crm/kilowott-crm/src/lib/crm-engine.ts#L17-L138).

### Pattern 2: Strategy Pattern (`SegmentationStrategy`)
- **Problem**: Business rules for customer segmentation vary (e.g. monetary LTV vs purchase frequency vs recency). Hardcoding `if/else` checks violates the Open/Closed Principle.
- **Solution**: Defines `ISegmentationStrategy` with pluggable concrete strategies:
  - `TieredLtvStrategy`: New (<$200), Repeat ($200–$499), VIP ($500+).
  - `FrequencyStrategy`: 1 order (New), 2–4 orders (Repeat), 5+ orders (VIP).
  - `HybridRfmStrategy`: Composite spending and order frequency thresholding.
- **Runtime Swapping**: The `SegmentationContext` allows administrators to switch segmentation algorithms at runtime from the dashboard dropdown, instantly re-evaluating the customer base.
- **Code Reference**: [`src/lib/crm-engine.ts`](file:///d:/hackathon-kilowott-crm/kilowott-crm/src/lib/crm-engine.ts#L182-L285).

### Pattern 3: Observer Pattern (`WorkflowEngine`)
- **Problem**: When an order is created, advanced, or cancelled, multiple independent subsystems must react (omnichannel message logging, AI triage evaluation, analytics aggregation) without tight coupling.
- **Solution**: `WorkflowEngine` acts as the Publisher/Subject. Concrete observers subscribe to order and customer lifecycle events:
  - `CommunicationWorkflowObserver`: Dispatches and logs automated Email & WhatsApp messages.
  - `AiTriageObserver`: Evaluates order context via `AiTriageAgent` to create VIP concierge alerts and win-back recovery campaigns.
  - `AnalyticsObserver`: Maintains real-time revenue and pipeline counts.
- **Code Reference**: [`src/lib/crm-engine.ts`](file:///d:/hackathon-kilowott-crm/kilowott-crm/src/lib/crm-engine.ts#L295-L508).

---

## 3. Key Assumptions

1. **Guest Checkout Mapping**: WooCommerce guest orders with `customer_id = 0` are matched by `billing.email` (case-insensitive). If an order has no email, a fallback deterministic ID is assigned.
2. **LTV Calculation**: Lifetime Value includes all non-cancelled orders (`completed`, `processing`, `shipped`, `pending`). If an order is marked `cancelled`, it is immediately deducted from the customer's LTV, and customer tier is re-evaluated.
3. **Simulated Omnichannel Delivery**: In this production-ready demo, Email and WhatsApp messages are dispatched into an in-memory audit ledger visible on the dashboard and 360° drawer. Real API keys for Twilio/SendGrid can be configured via environment variables.

---

## 4. Operational Setup & Commands

### Prerequisites
- Node.js 18+ (tested on Node.js v22)
- npm or pnpm

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live CRM dashboard.

### Run Unit Tests (Vitest)
Executes 15 comprehensive unit tests covering the Adapter Pattern, Strategy Pattern, Observer Pattern, guest checkout merging, and AI Triage logic:
```bash
npm test
```

### Run End-to-End Tests (Playwright)
Executes automated E2E tests validating dashboard KPIs, Webhook Simulator triggering, 360° Customer Drawer, and AI Triage actions:
```bash
npm run test:e2e
```

### Build for Production
```bash
npm run build
npm run start
```

---

## 5. Live Production Webhook Endpoint (`/api/webhooks/woocommerce`)

The application exposes a production App Router API route to ingest real-time webhooks from external WordPress/WooCommerce instances:

- **Endpoint**: `POST /api/webhooks/woocommerce`
- **Health & Discovery**: `GET /api/webhooks/woocommerce`
- **Security**: HMAC-SHA256 hash passed in `X-WC-Webhook-Signature` header computed over the raw request payload using shared secret `WC_WEBHOOK_SECRET` (default: `kilowott_wc_secret_2026`).

### Example cURL Ingestion Request:
```bash
# 1. Inspect gateway discovery
curl -X GET http://localhost:3000/api/webhooks/woocommerce

# 2. Ingest WooCommerce Order Webhook
curl -X POST http://localhost:3000/api/webhooks/woocommerce \
  -H "Content-Type: application/json" \
  -H "X-WC-Webhook-Topic: order.created" \
  -H "X-WC-Webhook-Signature: <base64_hmac_sha256_hash>" \
  -d '{
    "id": 9001,
    "status": "processing",
    "total": "750.00",
    "customer_id": 0,
    "billing": {
      "first_name": "Arthur",
      "last_name": "Dent",
      "email": "arthur.dent@hitchhiker.galaxy"
    },
    "line_items": [{"id": 1, "name": "Sub-Etha Sens-O-Matic", "quantity": 1, "price": 750, "total": "750"}]
  }'
```

---

## 6. Repository Structure
```
kilowott-crm/
├── e2e/
│   └── crm.spec.ts             # Playwright End-to-End test suite (8 tests)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── woocommerce/
│   │   │           ├── route.ts # Live Webhook API route with HMAC verification
│   │   │           └── __tests__/
│   │   │               └── route.test.ts # Webhook route unit tests (7 tests)
│   │   ├── globals.css         # Modern glassmorphism & dark theme styles
│   │   ├── layout.tsx          # Root layout & typography
│   │   └── page.tsx            # CRM Executive Dashboard & orchestration
│   ├── components/
│   │   ├── Header.tsx          # Strategy selector & Webhook trigger
│   │   ├── MetricCards.tsx     # Gross revenue, LTV, and active order KPIs
│   │   ├── WebhookSimulatorModal.tsx # Live webhook simulator & JSON editor
│   │   ├── OrderPipeline.tsx   # Kanban pipeline with status transitions
│   │   ├── CustomerTable.tsx   # Customer roster with segment badges
│   │   ├── CustomerDrawer360.tsx # 360° customer profile & order timeline
│   │   ├── AiTriageCenter.tsx  # VIP Concierge & Win-Back recovery center
│   │   └── CommunicationFeed.tsx # Live omnichannel message ledger
│   └── lib/
│       ├── types.ts            # Domain models & webhook payload schemas
│       ├── webhook-auth.ts     # HMAC-SHA256 signature verification helper
│       ├── ai-triage.ts        # Embedded AI Triage Agent logic
│       ├── crm-engine.ts       # Adapter, Strategy, & Observer implementations
│       ├── seed-data.ts        # Seed data & Webhook Simulator presets
│       └── __tests__/
│           └── crm-engine.test.ts # Vitest unit test suite (15 tests)
├── public/
│   └── presentation.html       # Interactive 8-slide pitch deck (Chart.js)
├── DEMO_SCRIPT.md              # Timed 3-minute hackathon pitch & judge Q&A
├── AI_USAGE.md                 # Agentic AI prompt strategy & usage log
├── implementation_plan.md      # System architecture & design pattern specs
├── vitest.config.mts           # Vitest unit test configuration
├── playwright.config.ts        # Playwright E2E configuration
└── README.md                   # System documentation & pattern guide
```
