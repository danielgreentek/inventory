import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const borrowings = await prisma.borrowing.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(borrowings);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const borrowing = await prisma.borrowing.create({
      data: {
        id: crypto.randomUUID(),
        inventoryId: body.inventory_id,
        borrower: body.borrower,
        borrowDate: new Date(body.borrow_date),
        returnDate: body.return_date ? new Date(body.return_date) : null,
        status: body.status || 'Dipinjam',
      },
    });

    return NextResponse.json(borrowing, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menyimpan peminjaman.' }, { status: 500 });
  }
}
