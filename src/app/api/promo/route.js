import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  const { code } = await request.json();
  if (!code) {
    return NextResponse.json({ error: 'Enter a promo code' }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });

  if (!promo || !promo.active) {
    return NextResponse.json({ error: 'That code is invalid or expired' }, { status: 404 });
  }

  return NextResponse.json({ promo: { code: promo.code, percentOff: promo.percentOff } });
}
