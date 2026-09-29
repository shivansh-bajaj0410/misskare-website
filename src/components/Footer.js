import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/80 mt-24">
      <div className="container-boutique py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <p className="heading-serif italic text-3xl text-cream mb-4">MissKare</p>
          <p className="text-sm max-w-xs text-cream/60 leading-relaxed">
            Boutique lingerie crafted in small batches — candlelit luxury for everyday and evening.
          </p>
        </div>

        <div>
          <p className="eyebrow text-goldlight mb-4">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop/bras" className="hover:text-goldlight">Bras</Link></li>
            <li><Link href="/shop/sets" className="hover:text-goldlight">Sets</Link></li>
            <li><Link href="/shop/sleepwear" className="hover:text-goldlight">Sleepwear</Link></li>
            <li><Link href="/shop/shapewear" className="hover:text-goldlight">Shapewear</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-goldlight mb-4">Help</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/account" className="hover:text-goldlight">My Account</Link></li>
            <li><Link href="/account/orders" className="hover:text-goldlight">Order Status</Link></li>
            <li><span className="cursor-default">Size Guide</span></li>
            <li><span className="cursor-default">Shipping & Returns</span></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-goldlight mb-4">Follow</p>
          <ul className="space-y-2 text-sm">
            <li><span className="cursor-default">Instagram</span></li>
            <li><span className="cursor-default">Pinterest</span></li>
            <li><span className="cursor-default">TikTok</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 py-6">
        <div className="container-boutique flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-cream/40">
          <p>© {new Date().getFullYear()} MissKare. All rights reserved.</p>
          <p>Crafted with care · Test-mode payments</p>
        </div>
      </div>
    </footer>
  );
}
