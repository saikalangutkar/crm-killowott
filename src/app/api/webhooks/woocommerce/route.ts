import { NextResponse } from "next/server";
import {
  verifyWooCommerceSignature,
  DEFAULT_WEBHOOK_SECRET,
} from "@/lib/webhook-auth";
import {
  WooCommerceAdapter,
  SegmentationContext,
  WorkflowEngine,
  CommunicationWorkflowObserver,
  AiTriageObserver,
} from "@/lib/crm-engine";
import { AiTriageAgent } from "@/lib/ai-triage";
import { WooCommerceOrderPayload, CrmOrderEvent } from "@/lib/types";

// Shared backend engine instance for live webhook ingestion
const adapter = new WooCommerceAdapter();
const segmentationContext = new SegmentationContext();
const workflowEngine = new WorkflowEngine();
const aiAgent = new AiTriageAgent();
const commObserver = new CommunicationWorkflowObserver();
const triageObserver = new AiTriageObserver(aiAgent);

workflowEngine.subscribe(commObserver);
workflowEngine.subscribe(triageObserver);

/**
 * GET /api/webhooks/woocommerce
 * Healthcheck & Webhook Gateway Discovery Endpoint
 */
export async function GET() {
  return NextResponse.json(
    {
      service: "Kilowott WooCommerce Webhook Gateway",
      status: "operational",
      version: "1.0.0",
      security: "HMAC-SHA256 (x-wc-webhook-signature)",
      supportedTopics: [
        "order.created",
        "order.updated",
        "order.deleted",
        "customer.created",
        "customer.updated",
      ],
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

/**
 * POST /api/webhooks/woocommerce
 * Primary WooCommerce Webhook Ingestion Endpoint with HMAC-SHA256 Signature Verification
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!rawBody || !rawBody.trim()) {
      return NextResponse.json(
        { error: "Bad Request: Empty webhook payload" },
        { status: 400 }
      );
    }

    const signature = request.headers.get("x-wc-webhook-signature");
    const topic = request.headers.get("x-wc-webhook-topic") || "order.created";
    const secret = process.env.WC_WEBHOOK_SECRET || DEFAULT_WEBHOOK_SECRET;

    // 1. Signature Verification
    // In production or when header is provided, strictly enforce HMAC-SHA256
    if (signature) {
      const isValid = verifyWooCommerceSignature(rawBody, signature, secret);
      if (!isValid) {
        return NextResponse.json(
          {
            error: "Unauthorized: Invalid WooCommerce webhook signature",
            hint: "Compute HMAC-SHA256 over raw payload using shared secret and pass in X-WC-Webhook-Signature header.",
          },
          { status: 401 }
        );
      }
    } else if (process.env.NODE_ENV === "production") {
      // In strict production mode, missing signature is rejected
      return NextResponse.json(
        { error: "Unauthorized: Missing X-WC-Webhook-Signature header" },
        { status: 401 }
      );
    }

    // 2. Parse Raw Payload
    let payload: WooCommerceOrderPayload;
    try {
      payload = JSON.parse(rawBody) as WooCommerceOrderPayload;
    } catch {
      return NextResponse.json(
        { error: "Bad Request: Malformed JSON payload" },
        { status: 400 }
      );
    }

    // 3. Adapter Pattern: Decouple WooCommerce Schema & Resolve Guest Checkouts
    const { order, customer } = adapter.adaptOrder(payload);

    // 4. Strategy Pattern: Re-evaluate Customer Segment
    const validOrders = order.status !== "cancelled" ? [order] : [];
    customer.lifetimeValue = validOrders.reduce((sum, o) => sum + o.total, 0);
    customer.segment = segmentationContext.evaluate(customer, validOrders);

    // 5. Observer Pattern: Broadcast Order Event
    const event: CrmOrderEvent = {
      type: order.status === "cancelled" ? "order:cancelled" : "order:created",
      order,
      customer,
    };
    workflowEngine.notifyOrder(event);

    // 6. Return Structured Integration Response
    return NextResponse.json(
      {
        success: true,
        message: "WooCommerce webhook ingested successfully",
        topic,
        data: {
          orderId: order.id,
          wooCommerceOrderId: order.wooCommerceOrderId,
          status: order.status,
          total: order.total,
          currency: order.currency,
          customer: {
            id: customer.id,
            email: customer.email,
            fullName: customer.fullName,
            segment: customer.segment,
            lifetimeValue: customer.lifetimeValue,
            isGuestCheckout: customer.wooCommerceId === null,
            tags: customer.tags,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: "Internal Server Error", details: message },
      { status: 500 }
    );
  }
}
