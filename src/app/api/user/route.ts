import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }
  return NextResponse.json(user);
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const { name, department } = await request.json();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { ...(name && { name }), ...(department && { department }) },
      select: { id: true, name: true, email: true, role: true, department: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui profil.' }, { status: 500 });
  }
}
