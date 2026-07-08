import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const branch = searchParams.get('branch');

  const itemsQuery: any = {};
  if (branch && branch !== 'Semua Cabang') {
    itemsQuery.branch = branch;
  }

  const items = await prisma.inventory.findMany({ where: itemsQuery });
  const allUnits = items.flatMap((item: any) => {
    const units = typeof item.units === 'string' ? JSON.parse(item.units) : (item.units || []);
    return units;
  });

  const activeUnits = allUnits.filter((u: any) => u.status === 'Aktif').length;
  const maintenanceUnits = allUnits.filter((u: any) => u.status === 'Maintenance').length;
  const brokenUnits = allUnits.filter((u: any) => u.status === 'Rusak').length;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  items.forEach((item: any) => {
    const cat = item.category;
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categories = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));

  // Branch breakdown
  const branchMap: Record<string, number> = {};
  items.forEach((item: any) => {
    const br = item.branch;
    branchMap[br] = (branchMap[br] || 0) + 1;
  });
  const branches = Object.entries(branchMap).map(([branch, total]) => ({ branch, total: Number(total) }));

  const totalUsers = await prisma.user.count();

  return NextResponse.json({
    inventory: {
      total_items: items.length,
      total_units: allUnits.length,
      active_units: activeUnits,
      maintenance_units: maintenanceUnits,
      broken_units: brokenUnits,
    },
    categories,
    branches,
    total_users: totalUsers,
  });
}
