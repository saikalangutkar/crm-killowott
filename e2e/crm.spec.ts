import { test, expect } from "@playwright/test";

test.describe("Kilowott CRM - Landing Page & Editorial Studio E2E", () => {
  test("renders landing page, verifies loader, hero headline, and navigates to dashboard", async ({ page }) => {
    await page.goto("/");

    // 1. Verify Brand & Hero Headline
    await expect(page.getByText("Every order.")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Every customer.")).toBeVisible();
    await expect(page.getByText("One calm view.")).toBeVisible();

    // 2. Verify Core Architecture & Features sections
    await expect(page.getByRole("heading", { name: "Deterministic Guest Merge" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dynamic Strategy Segmentation" })).toBeVisible();

    // 3. Test Request Walkthrough Modal
    const walkthroughBtn = page.getByRole("button", { name: "Request Walkthrough" }).first();
    if (await walkthroughBtn.isVisible()) {
      await walkthroughBtn.click();
      await expect(page.getByRole("heading", { name: "Schedule Private Walkthrough" })).toBeVisible();
      // Press Escape to close modal
      await page.keyboard.press("Escape");
    }

    // 4. Click Open Dashboard CTA
    await page.getByRole("link", { name: "Open Dashboard" }).first().click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByRole("heading", { name: "Kilowott CRM" })).toBeVisible();
  });
});

test.describe("Kilowott CRM - WooCommerce Integration & AI Triage Dashboard E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    // Ensure dashboard heading is loaded
    await expect(page.getByRole("heading", { name: "Kilowott CRM" })).toBeVisible();
  });

  test("loads the executive dashboard and displays KPI metrics", async ({ page }) => {
    await expect(page.getByText("Gross Revenue")).toBeVisible();
    await expect(page.getByText("Customers Managed")).toBeVisible();
    await expect(page.getByText("VIP Revenue Impact")).toBeVisible();
    await expect(page.getByText("Active In Pipeline")).toBeVisible();
    await expect(page.getByTestId("simulate-webhook-button")).toBeVisible();
  });

  test("opens Webhook Simulator modal and triggers presets", async ({ page }) => {
    // Open Simulator
    await page.getByTestId("simulate-webhook-button").click();
    await expect(page.getByRole("heading", { name: "WooCommerce Live Webhook Simulator" })).toBeVisible();

    // Verify demo presets are available inside modal
    const modal = page.getByRole("dialog");
    await expect(modal.getByText(/Standard Order/i)).toBeVisible();
    await expect(modal.getByText(/VIP Whale Order/i)).toBeVisible();
    await expect(modal.getByText("Guest Checkout ($145.00)")).toBeVisible();
    await expect(modal.getByText(/Order Cancellation/i)).toBeVisible();

    // Trigger VIP Whale Order preset
    await page.getByTestId("dispatch-preset-vip_whale").click();

    // Verify toast notification appears
    await expect(
      page.getByText(/Ingested WooCommerce Webhook.*Victoria Stirling/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("handles guest checkout (customer_id = 0) and maps by email", async ({ page }) => {
    await page.getByTestId("simulate-webhook-button").click();
    await page.getByTestId("dispatch-preset-guest_checkout").click();

    // Confirm webhook was ingested with guest note
    await expect(
      page.getByText(/Ingested WooCommerce Webhook.*Guest checkout mapped by email/i)
    ).toBeVisible({ timeout: 5000 });

    // Switch to 360° Customer Directory
    await page.getByRole("button", { name: /360° Customer Directory/i }).click();

    // Verify Sarah Guest is present in the table
    await expect(page.getByText("sarah.guest@example.com")).toBeVisible();
  });

  test("opens 360° Customer Drawer and inspects customer timeline", async ({ page }) => {
    // Switch to Customer Directory
    await page.getByRole("button", { name: /360° Customer Directory/i }).click();

    // Click on Elena Rostova row
    await page.getByTestId("customer-row-elena.rostova@luxuryfashion.com").click();

    // Verify 360° Drawer appears
    await expect(page.getByRole("heading", { name: "Elena Rostova" })).toBeVisible();
    await expect(page.getByRole("dialog").getByText("Lifetime Value (LTV)")).toBeVisible();
    await expect(page.getByText("VIP Patron Tier")).toBeVisible();

    // Inspect Communication Log tab inside drawer
    await page.getByRole("button", { name: /Communication Log/i }).click();
    await expect(page.getByText(/Order #1075 Delivered/i)).toBeVisible();

    // Close drawer
    await page.getByTestId("close-customer-drawer").click();
    await expect(page.getByTestId("close-customer-drawer")).not.toBeVisible();
  });

  test("advances order status interactively in the pipeline", async ({ page }) => {
    // Ensure we are on the pipeline view
    await page.getByRole("button", { name: /Order Pipeline Kanban/i }).click();

    // Find pending order #1081 and click Start Processing
    const advanceButton = page.getByTestId("advance-order-1081");
    if (await advanceButton.isVisible()) {
      await advanceButton.click();
      await expect(page.getByText(/transitioned to "PROCESSING"/i)).toBeVisible();
    }
  });

  test("navigates to AI Agent Triage Center and actions VIP alert", async ({ page }) => {
    // Switch to AI Agent Triage Center
    await page.getByRole("button", { name: /AI Agent Triage Center/i }).click();

    // Verify AI Triage alerts are displayed
    await expect(page.getByText("VIP Concierge Alert").first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Win-Back Recovery Campaign").first()).toBeVisible({ timeout: 5000 });

    // Find action button for triage and click
    const actionButton = page.locator("button:has-text('Dispatch VIP Concierge Greeting')").first();
    await expect(actionButton).toBeVisible();
    await actionButton.click();
    await expect(page.getByText(/AI Action Dispatched/i)).toBeVisible();
  });

  test("switches segmentation strategy at runtime via Strategy Pattern", async ({ page }) => {
    const strategySelect = page.getByLabel("Segmentation Strategy").first();
    await expect(strategySelect).toBeVisible();

    // Switch to Order Frequency Strategy
    await strategySelect.selectOption("frequency");
    await expect(page.getByText(/Switched to: Order Frequency Strategy/i)).toBeVisible();

    // Switch to Hybrid RFM Strategy
    await strategySelect.selectOption("rfm");
    await expect(page.getByText(/Switched to: Hybrid RFM Strategy/i)).toBeVisible();
  });

  test("processes live HTTP POST to /api/webhooks/woocommerce with HMAC verification", async ({ request }) => {
    // 1. Healthcheck discovery
    const getRes = await request.get("/api/webhooks/woocommerce");
    expect(getRes.status()).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.status).toBe("operational");
    expect(getJson.service).toContain("Kilowott WooCommerce Webhook Gateway");

    // 2. Reject forged signature
    const badRes = await request.post("/api/webhooks/woocommerce", {
      data: { id: 9999, total: "100.00" },
      headers: { "x-wc-webhook-signature": "forged_sig==" },
    });
    expect(badRes.status()).toBe(401);
  });

  test("interacts with AI Copilot Drawer and asks a natural language question", async ({ page }) => {
    // Open Copilot
    await page.getByTestId("open-copilot-button").click();
    await expect(page.getByRole("heading", { name: "Kilowott CRM Copilot" })).toBeVisible();

    // Click quick prompt: "Who are our top VIP patrons?"
    await page.getByTestId("quick-prompt-0").click();

    // Verify response contains Elena Rostova and VIP spend
    await expect(page.getByText(/Elena Rostova/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/VIP Cumulative Spend/i)).toBeVisible({ timeout: 5000 });

    // Close Copilot Drawer
    await page.getByTestId("close-copilot-drawer").click();
    await expect(page.getByTestId("close-copilot-drawer")).not.toBeVisible();
  });
});
