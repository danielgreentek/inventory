import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json({ message: 'Email, token, dan password harus diisi.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password minimal 8 karakter.' }, { status: 400 });
    }

    // Find valid token
    const tokens = await prisma.$queryRaw`
      SELECT token, expires_at FROM password_reset_tokens 
      WHERE email = ${email} AND expires_at > NOW() 
      ORDER BY created_at DESC LIMIT 1
    `;

    const rows = tokens as { token: string; expires_at: Date }[];
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'Token reset tidak valid atau sudah kadaluarsa.' }, { status: 400 });
    }

    // Compare token
    const storedToken = rows[0].token;
    if (token !== storedToken) {
      return NextResponse.json({ message: 'Token reset tidak valid.' }, { status: 400 });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete used tokens
    await prisma.$executeRaw`DELETE FROM password_reset_tokens WHERE email = ${email}`;

    return NextResponse.json({
      message: 'Password berhasil direset! Silakan login dengan password baru.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Gagal mereset password.' }, { status: 500 });
  }
}
