import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

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

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in user record (we store it in a separate table)
    await prisma.$executeRaw`INSERT INTO password_reset_tokens (id, email, token, expires_at) VALUES (gen_random_uuid(), ${email}, ${token}, ${expires})`;

    // Send email
    try {
      const { sendResetPasswordEmail } = await import('@/lib/mail');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      await sendResetPasswordEmail(email, user.name, resetUrl);
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
    }

    return NextResponse.json({
      message: 'Tautan reset password telah dikirim ke email Anda.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Gagal mengirim email reset.' }, { status: 500 });
  }
}
