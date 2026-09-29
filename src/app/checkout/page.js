'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/cartStore';
import { formatPrice } from '@/lib/format';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discountAmount());
  const total = useCartStore((s) => s.total());
  const promo = useCartStore((s) => s.promo);
  const clearCart = useCartStore((s) => s.clearCart);
  const closeCart = useCartStore((s) => s.closeCart);

  useEffect(() => {
    closeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal: '',
    country: 'US',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    fetch('/api/addresses')
      .then((res) => (res.ok ? res.json() : { addresses: [] }))
      .then((data) => setSavedAddresses(data.addresses || []))
      .catch(() => {});
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.email) setForm((f) => ({ ...f, email: data.user.email }));
      });
  }, []);

  const applySavedAddress = (a) => {
    setForm((f) => ({
      ...f,
      fullName: a.fullName,
      line1: a.line1,
      line2: a.line2 || '',
      city: a.city,
      state: a.state,
      postal: a.postal,
      country: a.country,
    }));
  };

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.fullName.trim()) errs.fullName = 'Required';
    if (!form.line1.trim()) errs.line1 = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.state.trim()) errs.state = 'Required';
    if (!form.postal.trim()) errs.postal = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, promo, shipping: form, email: form.email }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        setErrors({ form: data.error || 'Something went wrong. Please try again.' });
        setSubmitting(false);
      }
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' });
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="pt-40 pb-24 text-center">
        <p className="text-ink/60 mb-6">Your bag is empty.</p>
        <Link href="/shop" className="btn-primary">Shop the Edit</Link>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24">
      <div className="container-boutique grid lg:grid-cols-[1fr_400px] gap-12">
        <div>
          <p className="eyebrow mb-2">Step 1 of 2</p>
          <h1 className="heading-serif text-3xl italic mb-8">Shipping Details</h1>

          {savedAddresses.length > 0 && (
            <div className="mb-8">
              <p className="label-boutique">Saved Addresses</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {savedAddresses.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => applySavedAddress(a)}
                    className="text-left card-boutique p-4 text-sm hover:border-camel border border-transparent"
                  >
                    <p className="font-medium">{a.fullName}</p>
                    <p className="text-ink/60">{a.line1}, {a.city}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-boutique">Email</label>
              <input value={form.email} onChange={update('email')} className="input-boutique" />
              {errors.email && <p className="text-xs text-red-700 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label-boutique">Full Name</label>
              <input value={form.fullName} onChange={update('fullName')} className="input-boutique" />
              {errors.fullName && <p className="text-xs text-red-700 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="label-boutique">Address Line 1</label>
              <input value={form.line1} onChange={update('line1')} className="input-boutique" />
              {errors.line1 && <p className="text-xs text-red-700 mt-1">{errors.line1}</p>}
            </div>

            <div>
              <label className="label-boutique">Address Line 2 (optional)</label>
              <input value={form.line2} onChange={update('line2')} className="input-boutique" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-boutique">City</label>
                <input value={form.city} onChange={update('city')} className="input-boutique" />
                {errors.city && <p className="text-xs text-red-700 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="label-boutique">State</label>
                <input value={form.state} onChange={update('state')} className="input-boutique" />
                {errors.state && <p className="text-xs text-red-700 mt-1">{errors.state}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-boutique">Postal Code</label>
                <input value={form.postal} onChange={update('postal')} className="input-boutique" />
                {errors.postal && <p className="text-xs text-red-700 mt-1">{errors.postal}</p>}
              </div>
              <div>
                <label className="label-boutique">Country</label>
                <select value={form.country} onChange={update('country')} className="input-boutique">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="IN">India</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>

            {errors.form && <p className="text-sm text-red-700">{errors.form}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full mt-4">
              {submitting ? 'Redirecting to payment…' : 'Continue to Payment'}
            </button>
            <p className="text-xs text-ink/40 text-center">
              Payment is securely handled by Stripe (test mode). No real charge will occur.
            </p>
          </form>
        </div>

        <div className="card-boutique p-6 h-fit sticky top-28">
          <h2 className="heading-serif text-xl italic mb-5">Order Summary</h2>
          <ul className="space-y-4 mb-5">
            {items.map((item) => (
              <li key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-3">
                <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-black/5 shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.name}</p>
                  <p className="text-xs text-ink/50">{item.color} · {item.size} · Qty {item.quantity}</p>
                </div>
                <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 text-sm border-t border-black/10 pt-4">
            <div className="flex justify-between text-ink/60">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-camel2">
                <span>Discount ({promo?.code})</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink/60">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-1.5 border-t border-black/10">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
