'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/useSession';

const EMPTY = { fullName: '', line1: '', line2: '', city: '', state: '', postal: '', country: 'US', isDefault: false };

export default function AddressesPage() {
  const { user, loading } = useSession();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch('/api/addresses')
      .then((res) => res.json())
      .then((data) => setAddresses(data.addresses || []));
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setForm(EMPTY);
      setShowForm(false);
      load();
    }
  };

  const remove = async (id) => {
    await fetch('/api/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  if (loading) return <main className="pt-40 pb-24 text-center text-ink/50">Loading…</main>;
  if (!user) {
    return (
      <main className="pt-40 pb-24 text-center">
        <p className="text-ink/60 mb-6">Sign in to manage saved addresses.</p>
        <Link href="/account/login" className="btn-primary">Sign In</Link>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24">
      <div className="container-boutique max-w-3xl">
        <p className="eyebrow mb-2">My Account</p>
        <h1 className="heading-serif text-3xl italic mb-8">Saved Addresses</h1>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {addresses.map((a) => (
            <div key={a.id} className="card-boutique p-5">
              <p className="font-medium">{a.fullName}</p>
              <p className="text-sm text-ink/60">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
              <p className="text-sm text-ink/60">{a.city}, {a.state} {a.postal}</p>
              <button onClick={() => remove(a.id)} className="text-xs text-red-700 underline mt-3">
                Remove
              </button>
            </div>
          ))}
        </div>

        {showForm ? (
          <form onSubmit={submit} className="card-boutique p-6 space-y-4 max-w-md">
            <input placeholder="Full Name" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="input-boutique" />
            <input placeholder="Address Line 1" required value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} className="input-boutique" />
            <input placeholder="Address Line 2 (optional)" value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} className="input-boutique" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="City" required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="input-boutique" />
              <input placeholder="State" required value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="input-boutique" />
            </div>
            <input placeholder="Postal Code" required value={form.postal} onChange={(e) => setForm((f) => ({ ...f, postal: e.target.value }))} className="input-boutique" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
              Set as default
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Address'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowForm(true)} className="btn-outline">+ Add New Address</button>
        )}
      </div>
    </main>
  );
}
