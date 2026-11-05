// Coupon codes module (to be wired into the order flow)
export const coupons = { WELCOME10: 10, FESTIVE20: 20 }; // percent off
export function applyCoupon(code, subtotal) {
  const pct = coupons[String(code).toUpperCase()] || 0;
  return Math.round(subtotal * (100 - pct)) / 100;
}
