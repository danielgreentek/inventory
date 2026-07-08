import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: 'Email harus diisi.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Email tidak ditemukan.' }, { status: 404 });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ message: 'Email sudah diverifikasi.' });
    }

    // Resend verification email
    try {
      const { sendVerificationEmail } = await import('@/lib/mail');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-email?id=${user.id}&hash=${crypto.createHash('sha1').update(user.email).digest('hex')}`;
      await sendVerificationEmail(user.email, user.name, verificationUrl);
    } catch (emailErr) {
      console.error('Failed to resend verification email:', emailErr);
    }

    return NextResponse.json({ message: 'Link verifikasi telah dikirim ulang ke email Anda.' });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengirim ulang email.' }, { status: 500 });
  }
}
