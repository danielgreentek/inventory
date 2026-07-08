import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const borrowing = await prisma.borrowing.update({
      where: { id },
      data: {
        borrower: body.borrower,
        borrowDate: body.borrow_date ? new Date(body.borrow_date) : undefined,
        returnDate: body.return_date ? new Date(body.return_date) : null,
        status: body.status,
      },
    });

    return NextResponse.json(borrowing);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui peminjaman.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.borrowing.delete({ where: { id } });
    return NextResponse.json({ message: 'Peminjaman berhasil dihapus.' });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus peminjaman.' }, { status: 500 });
  }
}
