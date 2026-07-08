import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser(request);
  if (!authUser || !requireAdmin(authUser)) {
    return NextResponse.json({ message: 'Hanya admin yang bisa mengubah role.' }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await request.json();

  if (!['admin', 'staff'].includes(role)) {
    return NextResponse.json({ message: 'Role tidak valid.' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, department: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser(request);
  if (!authUser || !requireAdmin(authUser)) {
    return NextResponse.json({ message: 'Hanya admin yang bisa menghapus user.' }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (user?.role === 'admin') {
    return NextResponse.json({ message: 'Tidak bisa menghapus admin.' }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: 'User berhasil dihapus.' });
}
