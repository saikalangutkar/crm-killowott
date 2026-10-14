/**
 * WooCommerce & CRM Integration Domain Types
 */

export type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";
export type CustomerSegment = "New" | "Repeat" | "VIP";
export type CommunicationChannel = "email" | "whatsapp";
export type CommunicationStatus = "sent" | "delivered" | "read" | "pending";
export type AiTriageType = "vip_concierge" | "cancellation_recovery";
export type TriageAlertStatus = "pending" | "actioned" | "dismissed";

export interface Address {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface WooCommerceLineItemPayload {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  subtotal: string | number;
  total: string | number;
  sku?: string;
  price?: number;
}

export interface WooCommerceOrderPayload {
  id: number;
  status: string;
  currency: string;
  total: string | number;
  customer_id: number; // 0 indicates guest checkout
  billing: Address;
  shipping: Address;
  line_items: WooCommerceLineItemPayload[];
  payment_method?: string;
  payment_method_title?: string;
  date_created?: string;
  date_modified?: string;
}

export interface WooCommerceCustomerPayload {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  billing?: Address;
  shipping?: Address;
  total_spent?: string | number;
  orders_count?: number;
}

export interface CrmLineItem {
  id: string;
  productId: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  sku: string;
}

export interface CrmCustomer {
  id: string;
  wooCommerceId: number | null; // null or 0 for guest checkouts
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  billingAddress: Address;
  shippingAddress: Address;
  lifetimeValue: number;
  ordersCount: number;
  averageOrderValue: number;
  segment: CustomerSegment;
  tags: string[];
  orderIds: string[];
  firstOrderDate: string;
  lastOrderDate: string;
  createdAt: string;
  notes?: string[];
}

export interface CrmOrder {
  id: string;
  wooCommerceOrderId: number;
  customerId: string;
  customerEmail: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  currency: string;
  lineItems: CrmLineItem[];
  paymentMethod: string;
  trackingNumber?: string;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  orderId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  channel: CommunicationChannel;
  subject?: string;
  message: string;
  status: CommunicationStatus;
  timestamp: string;
  eventType: string;
}

export interface AiTriageAlert {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  type: AiTriageType;
  priority: "high" | "urgent" | "normal";
  summary: string;
  analysis: string;
  recommendedAction: string;
  suggestedMessage: {
    channel: CommunicationChannel;
    subject?: string;
    body: string;
    couponCode?: string;
    discountPercent?: number;
  };
  status: TriageAlertStatus;
  createdAt: string;
}

export type CrmEventType =
  | "order:created"
  | "order:status_changed"
  | "order:cancelled"
  | "customer:created"
  | "customer:updated"
  | "customer:vip_elevated";

export interface CrmOrderEvent {
  type: CrmEventType;
  order: CrmOrder;
  customer: CrmCustomer;
  previousStatus?: OrderStatus;
}

export interface CrmCustomerEvent {
  type: CrmEventType;
  customer: CrmCustomer;
  previousSegment?: CustomerSegment;
}
