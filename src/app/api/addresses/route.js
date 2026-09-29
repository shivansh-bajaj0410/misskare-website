import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: 'desc' },
  });
  return NextResponse.json({ addresses });
}

export async function POST(request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const data = await request.json();
  if (!data.fullName || !data.line1 || !data.city || !data.postal) {
    return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
  }

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { ...data, userId: user.id },
  });

  return NextResponse.json({ address });
}

export async function DELETE(request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await request.json();
  await prisma.address.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
