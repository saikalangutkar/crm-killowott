import { describe, it, expect } from "vitest";
import { GET, POST } from "../route";
import {
  computeWooCommerceSignature,
  verifyWooCommerceSignature,
  DEFAULT_WEBHOOK_SECRET,
} from "@/lib/webhook-auth";

describe("WooCommerce Webhook HMAC-SHA256 Authentication", () => {
  const secret = "test_webhook_secret_key";
  const payload = JSON.stringify({ id: 100, total: "50.00" });

  it("computes matching HMAC-SHA256 base64 signature", () => {
    const signature = computeWooCommerceSignature(payload, secret);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe("string");
    expect(verifyWooCommerceSignature(payload, signature, secret)).toBe(true);
  });

  it("rejects mismatched or forged signature", () => {
    const validSignature = computeWooCommerceSignature(payload, secret);
    const tamperedPayload = JSON.stringify({ id: 100, total: "500.00" });

    // Payload tampered
    expect(verifyWooCommerceSignature(tamperedPayload, validSignature, secret)).toBe(false);

    // Signature tampered
    expect(verifyWooCommerceSignature(payload, "invalid_sig_base64==", secret)).toBe(false);

    // Missing signature
    expect(verifyWooCommerceSignature(payload, null, secret)).toBe(false);
  });
});

describe("API Route: /api/webhooks/woocommerce", () => {
  it("GET returns gateway health and discovery status", async () => {
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe("operational");
    expect(json.service).toContain("Kilowott WooCommerce Webhook Gateway");
    expect(json.supportedTopics).toContain("order.created");
  });

  it("POST returns 400 on empty request body", async () => {
    const req = new Request("http://localhost:3000/api/webhooks/woocommerce", {
      method: "POST",
      body: "",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Empty webhook payload");
  });

  it("POST returns 401 when signature is invalid", async () => {
    const rawBody = JSON.stringify({ id: 101, total: "89.00" });
    const req = new Request("http://localhost:3000/api/webhooks/woocommerce", {
      method: "POST",
      headers: {
        "x-wc-webhook-signature": "bogus_signature_123==",
        "content-type": "application/json",
      },
      body: rawBody,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain("Unauthorized");
  });

  it("POST returns 200 and processes valid registered order with HMAC signature", async () => {
    const orderPayload = {
      id: 8801,
      status: "processing",
      currency: "USD",
      total: "620.00",
      customer_id: 55,
      billing: {
        first_name: "Bruce",
        last_name: "Wayne",
        email: "bruce.wayne@waynecorp.com",
        phone: "+1 555-9000",
      },
      shipping: {
        address_1: "1007 Mountain Drive",
        city: "Gotham",
        state: "NJ",
      },
      line_items: [
        {
          id: 1,
          product_id: 99,
          name: "Tactical Armored Cowl",
          quantity: 1,
          price: 620.0,
          total: "620.00",
        },
      ],
    };

    const rawBody = JSON.stringify(orderPayload);
    const validSignature = computeWooCommerceSignature(rawBody, DEFAULT_WEBHOOK_SECRET);

    const req = new Request("http://localhost:3000/api/webhooks/woocommerce", {
      method: "POST",
      headers: {
        "x-wc-webhook-signature": validSignature,
        "x-wc-webhook-topic": "order.created",
        "content-type": "application/json",
      },
      body: rawBody,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.wooCommerceOrderId).toBe(8801);
    expect(json.data.customer.fullName).toBe("Bruce Wayne");
    expect(json.data.customer.email).toBe("bruce.wayne@waynecorp.com");
    expect(json.data.customer.segment).toBe("VIP"); // >= $500
    expect(json.data.customer.isGuestCheckout).toBe(false);
  });

  it("POST successfully resolves guest checkout (customer_id = 0) mapped by billing.email", async () => {
    const guestPayload = {
      id: 8802,
      status: "pending",
      currency: "USD",
      total: "120.00",
      customer_id: 0, // Guest checkout
      billing: {
        first_name: "Diana",
        last_name: "Prince",
        email: "diana.prince@themyscira.gov",
      },
      shipping: {},
      line_items: [],
    };

    const rawBody = JSON.stringify(guestPayload);
    const validSignature = computeWooCommerceSignature(rawBody, DEFAULT_WEBHOOK_SECRET);

    const req = new Request("http://localhost:3000/api/webhooks/woocommerce", {
      method: "POST",
      headers: {
        "x-wc-webhook-signature": validSignature,
        "content-type": "application/json",
      },
      body: rawBody,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.customer.isGuestCheckout).toBe(true);
    expect(json.data.customer.email).toBe("diana.prince@themyscira.gov");
    expect(json.data.customer.tags).toContain("Guest Checkout");
    expect(json.data.customer.segment).toBe("New"); // < $200
  });
});
