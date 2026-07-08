import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const items = await prisma.inventory.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Serialize JSON fields
  const serialized = items.map(item => ({
    ...item,
    units: typeof item.units === 'string' ? JSON.parse(item.units) : item.units,
    history: typeof item.history === 'string' ? JSON.parse(item.history || '[]') : item.history,
    purchase_date: item.purchaseDate.toISOString().slice(0, 10),
    item_code: item.itemCode,
    item_name: item.itemName,
    image_url: item.imageUrl || '',
  }));

  return NextResponse.json(serialized);
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = body.id || crypto.randomUUID();
    const prefix = body.item_name.trim().replace(/\s+/g, '-').toUpperCase();
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const itemCode = body.item_code || `${prefix}-${suffix}`;

    const item = await prisma.inventory.create({
      data: {
        id,
        itemCode,
        itemName: body.item_name,
        category: body.category,
        brand: body.brand,
        branch: body.branch,
        price: body.price ? parseInt(body.price) : null,
        stock: parseInt(body.stock || '1'),
        purchaseDate: new Date(body.purchase_date),
        imageUrl: body.image_url || null,
        units: body.units || JSON.parse('[]'),
        history: body.history || JSON.parse('[]'),
        createdBy: authUser.id,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Create inventory error:', error);
    return NextResponse.json({ message: 'Gagal menyimpan item.' }, { status: 500 });
  }
}

