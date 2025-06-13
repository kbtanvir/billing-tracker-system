export const orderStatusValues = [
  'pending',
  'processing',
  'completed',
  'cancelled',
  'on_hold',
  'refunded',
] as const;

export const paymentStatusValues = [
  'pending',
  'paid',
  'failed',
  'refunded',
  'partially_refunded',
] as const;

export const paymentMethodValues = [
  'cash_on_delivery',
  'credit_card',
  'bkash',
  'nagad',
  'bank_transfer',
] as const;

export const deliveryMethodValues = [
  'within_dhaka',
  'outside_dhaka',
  'express',
  'store_pickup',
] as const;

export const shippingMethodValues = [
  'standard',
  'express',
  'same_day',
  'next_day',
  'international',
] as const;

export const stockStatusValues = [
  'low_stock',
  'out_of_stock',
  'in_stock',
] as const;


export type StockStatusEnum = (typeof stockStatusValues)[number];
