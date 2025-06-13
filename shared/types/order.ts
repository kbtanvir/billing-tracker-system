export const OrderStatusValues = [
  'pending',
  'processing',
  'completed',
  'cancelled',
  'on_hold',
  'refunded',
] as const;
export type OrderStatus = (typeof OrderStatusValues)[number];

export const PaymentStatusValues = [
  'pending',
  'paid',
  'failed',
  'refunded',
  'partially_refunded',
] as const;
export type PaymentStatus = (typeof PaymentStatusValues)[number];

export const PaymentMethodValues = [
  'cash_on_delivery',
  'credit_card',
  'bkash',
  'nagad',
  'bank_transfer',
] as const;
export type PaymentMethod = (typeof PaymentMethodValues)[number];

export const ShippingMethodValues = [
  'standard',
  'express',
  'same_day',
  'next_day',
  'international',
] as const;
export type ShippingMethod = (typeof ShippingMethodValues)[number];

export const ShippingZoneValues = ['within_dhaka', 'outside_dhaka'] as const;

export type ShippingZones = (typeof ShippingZoneValues)[number];