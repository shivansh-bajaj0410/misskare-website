import Razorpay from "razorpay";

// Lazily instantiate so the app doesn't crash at import time if the
// env vars aren't set yet (e.g. during local dev before .env is filled in).
let _razorpay = null;

export function getRazorpay() {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Copy .env.example to .env and add your test keys from https://dashboard.razorpay.com/app/keys"
      );
    }
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}
