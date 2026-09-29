'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push('/account');
      router.refresh();
    } else {
      setError(data.error || 'Login failed');
    }
  };

  return (
    <main className="pt-32 pb-24 min-h-[70vh] flex items-center">
      <div className="container-boutique max-w-md">
        <p className="eyebrow mb-2 text-center">Welcome Back</p>
        <h1 className="heading-serif text-3xl italic mb-8 text-center">Sign In</h1>

        <form onSubmit={submit} className="space-y-5 card-boutique p-7">
          <div>
            <label className="label-boutique">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input-boutique"
            />
          </div>
          <div>
            <label className="label-boutique">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input-boutique"
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/60 mt-6">
          New to MissKare?{' '}
          <Link href="/account/signup" className="text-camel2 underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
