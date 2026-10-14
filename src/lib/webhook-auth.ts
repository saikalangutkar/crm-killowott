import crypto from "crypto";

export const DEFAULT_WEBHOOK_SECRET = "kilowott_wc_secret_2026";

/**
 * Computes WooCommerce HMAC-SHA256 base64 signature for a given raw payload and secret.
 */
export function computeWooCommerceSignature(
  rawBody: string,
  secret: string = DEFAULT_WEBHOOK_SECRET
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
}

/**
 * Verifies the incoming X-WC-Webhook-Signature against the raw request body.
 * Uses timingSafeEqual to protect against timing attacks.
 */
export function verifyWooCommerceSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string = DEFAULT_WEBHOOK_SECRET
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const expectedSignature = computeWooCommerceSignature(rawBody, secret);

  const sigBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}
