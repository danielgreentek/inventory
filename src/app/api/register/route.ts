import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, department } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Nama, email, dan password harus diisi.' }, { status: 400 });
    }

    const allowedDomain = 'greentekindonesia.co.id';
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (emailDomain !== allowedDomain) {
      return NextResponse.json({ message: `Hanya email @${allowedDomain} yang diizinkan.` }, { status: 403 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password minimal 8 karakter.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'staff',
        department: department || 'Umum',
      },
    });

    // Send verification email
    try {
      const { sendVerificationEmail } = await import('@/lib/mail');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-email?id=${user.id}&hash=${user.email}`;
      await sendVerificationEmail(user.email, user.name, verificationUrl);
    } catch (emailErr) {
      // Email sending is best-effort during registration
    }

    return NextResponse.json({
      message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.',
      email: user.email,
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
