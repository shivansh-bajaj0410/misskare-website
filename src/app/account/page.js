'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';

export default function AccountPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return <main className="pt-40 pb-24 text-center text-ink/50">Loading…</main>;
  }

  if (!user) {
    return (
      <main className="pt-40 pb-24 text-center">
        <p className="text-ink/60 mb-6">Sign in to view your account.</p>
        <Link href="/account/login" className="btn-primary">Sign In</Link>
      </main>
    );
  }

  const links = [
    { href: '/account/orders', label: 'Order History', desc: 'Track past purchases' },
    { href: '/account/addresses', label: 'Saved Addresses', desc: 'Manage shipping details' },
    { href: '/account/wishlist', label: 'Wishlist', desc: 'Pieces you\u2019re saving' },
  ];

  return (
    <main className="pt-32 pb-24">
      <div className="container-boutique max-w-3xl">
        <p className="eyebrow mb-2">My Account</p>
        <h1 className="heading-serif text-3xl italic mb-1">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="text-ink/50 text-sm mb-10">{user.email}</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="card-boutique p-5 hover:border-camel border border-transparent transition-colors">
              <p className="font-medium mb-1">{l.label}</p>
              <p className="text-xs text-ink/50">{l.desc}</p>
            </Link>
          ))}
        </div>

        <button onClick={logout} className="btn-outline">
          Sign Out
        </button>
      </div>
    </main>
  );
}
