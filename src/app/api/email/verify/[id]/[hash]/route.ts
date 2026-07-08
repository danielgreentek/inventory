import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hash: string }> }
) {
  try {
    const { id, hash } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });
    }

    // Verify hash matches user email
    const emailHash = crypto.createHash('sha1').update(user.email).digest('hex');
    if (hash !== emailHash) {
      return NextResponse.json({ message: 'Hash verifikasi tidak cocok.' }, { status: 400 });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ message: 'Email sudah diverifikasi sebelumnya.' });
    }

    await prisma.user.update({
      where: { id },
      data: { emailVerifiedAt: new Date() },
    });

    return NextResponse.json({ message: 'Email berhasil diverifikasi! Silakan login.' });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ message: 'Gagal memverifikasi email.' }, { status: 500 });
  }
}
