import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  // We don't need to invalidate JWT tokens, just return success
  return NextResponse.json({ message: 'Berhasil logout.' });
}
