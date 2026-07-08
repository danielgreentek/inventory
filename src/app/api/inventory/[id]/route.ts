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
    const item = await prisma.inventory.update({
      where: { id },
      data: {
        itemName: body.item_name,
        category: body.category,
        brand: body.brand,
        branch: body.branch,
        price: body.price ? parseInt(body.price) : null,
        stock: parseInt(body.stock || '1'),
        purchaseDate: body.purchase_date ? new Date(body.purchase_date) : undefined,
        imageUrl: body.image_url || null,
        units: body.units,
        history: body.history,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui item.' }, { status: 500 });
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
    await prisma.inventory.delete({ where: { id } });
    return NextResponse.json({ message: 'Item berhasil dihapus.' });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus item.' }, { status: 500 });
  }
}
