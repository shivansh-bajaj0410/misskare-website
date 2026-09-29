'use client';

import { useState } from 'react';
import AnimateIn from './AnimateIn';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="bg-blush/40 py-20 sm:py-24">
      <div className="container-boutique max-w-xl text-center">
        <AnimateIn>
          <p className="eyebrow mb-3">Join the List</p>
          <h2 className="heading-serif text-3xl italic mb-3">15% off your first order</h2>
          <p className="text-ink/60 mb-8 text-sm">
            Early access to drops, restocks, and candlelit boutique stories — no spam, ever.
          </p>

          {status === 'success' ? (
            <p className="text-camel2 font-medium">You're on the list. Welcome to MissKare.</p>
          ) : (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="input-boutique flex-1"
              />
              <button type="submit" disabled={status === 'loading'} className="btn-primary whitespace-nowrap">
                {status === 'loading' ? 'Joining…' : 'Sign Up'}
              </button>
            </form>
          )}
          {status === 'error' && <p className="text-red-700 text-xs mt-2">Something went wrong. Try again.</p>}
        </AnimateIn>
      </div>
    </section>
  );
}
