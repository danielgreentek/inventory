const { PrismaClient } = require('@prisma/client');
const { PrismaNeonHttp } = require('@prisma/adapter-neon');
const bcrypt = require('bcryptjs');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaNeonHttp(connectionString, {});
  const prisma = new PrismaClient({ adapter });

  console.log('Seeding database...');

  // Create admin user (no upsert - avoid transactions)
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  try {
    const existing = await prisma.user.findUnique({ where: { email: 'admin@greentek.co.id' } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: 'Admin',
          email: 'admin@greentek.co.id',
          password: hashedPassword,
          role: 'admin',
          department: 'IT',
          emailVerifiedAt: new Date(),
        },
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (e: any) {
    console.log('Admin user creation:', e.message);
  }

  // Get admin ID
  const admin = await prisma.user.findUnique({ where: { email: 'admin@greentek.co.id' } });
  if (!admin) {
    console.error('Failed to create admin user');
    await prisma.$disconnect();
    return;
  }

  // Inventory data
  const items = [
    {
      id: 'inv-1779699950981',
      itemCode: 'Laptop Asus Vivobook X412UA-001',
      itemName: 'Laptop Asus Vivobook X412UA',
      category: 'Laptop', brand: 'Asus', branch: 'Jakarta', stock: 1,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Laptop Asus Vivobook X412UA-001","status":"Aktif","location":"Ruangan Finance","assignedTo":"Putu Lorenzo","condition":"Aktif","condition_note":"","production_date":"2019-08-30","history":[{"id":"hist-1779699957929","date":"2026-05-25","note":"Status diubah menjadi Diperbaiki oleh admin.","action":"Diperbaiki"}]}],
      history: [],
      createdBy: admin.id,
    },
    {
      id: 'inv-1779698325731',
      itemCode: 'Printer Epson L360-001',
      itemName: 'Printer Epson L360',
      category: 'Printer', brand: 'Epson', branch: 'Jakarta', stock: 1,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Printer Epson L360-001","status":"Aktif","location":"Ruangan Finance","assignedTo":"Finance","condition":"Aktif","condition_note":"","production_date":"2026-05-25","history":[{"id":"hist-1779698335832","date":"2026-05-25","note":"Status diubah menjadi Diperbaiki oleh admin.","action":"Diperbaiki"}]}],
      history: [],
      createdBy: admin.id,
    },
    {
      id: 'inv-1779699113855',
      itemCode: 'Laptop Lenovo 20FAS4EM2R-001',
      itemName: 'Laptop Lenovo 20FAS4EM2R',
      category: 'Laptop', brand: 'Lenovo', branch: 'Jakarta', stock: 1,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Laptop Lenovo 20FAS4EM2R-001","status":"Aktif","location":"Ruangan MRO","assignedTo":"Ellyda Siregae","condition":"Aktif","condition_note":"","production_date":"2022-09-13","history":[{"id":"hist-1779699119448","date":"2026-05-25","note":"Status diubah menjadi Diperbaiki oleh admin.","action":"Diperbaiki"}]}],
      history: [],
      createdBy: admin.id,
    },
    {
      id: 'inv-1779698903494',
      itemCode: 'Laptop Lenovo 20HGS0RY2P-001',
      itemName: 'Laptop Lenovo 20HGS0RY2P',
      category: 'Laptop', brand: 'Lenovo', branch: 'Jakarta', stock: 1,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Laptop Lenovo 20HGS0RY2P-001","status":"Aktif","location":"Ruangan MRO","assignedTo":"Sania Britney Mogi","condition":"Aktif","condition_note":"","production_date":"2018-01-24","history":[{"id":"hist-1779698908913","date":"2026-05-25","note":"Status diubah menjadi Diperbaiki oleh admin.","action":"Diperbaiki"}]}],
      history: [],
      createdBy: admin.id,
    },
    {
      id: 'inv-1779698654590',
      itemCode: 'Laptop Dell Latitude E6430-001',
      itemName: 'Laptop Dell Latitude E6430',
      category: 'Laptop', brand: 'Dell', branch: 'Jakarta', stock: 1,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Laptop Dell Latitude E6430-001","status":"Aktif","location":"Ruangan MRO","assignedTo":"Melvi Nurviza","condition":"Aktif","condition_note":"","production_date":"2018-02-21","history":[{"id":"hist-1779698660415","date":"2026-05-25","note":"Status diubah menjadi Diperbaiki oleh admin.","action":"Diperbaiki"}]}],
      history: [],
      createdBy: admin.id,
    },
    {
      id: 'inv-1779697064571',
      itemCode: 'Laptop Lenovo Ideapad 110-14IBR-001',
      itemName: 'Laptop Lenovo Ideapad 110-14IBR',
      category: 'Laptop', brand: 'Lenovo', branch: 'Jakarta', stock: 1,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Laptop Lenovo Ideapad 110-14IBR-001","status":"Rusak","location":"Gudang IT","assignedTo":"-","condition":"Aktif","condition_note":"Rusak harus download windows manual menggunakan flashdisk","production_date":"2024-05-17","history":[{"id":"hist-1779697075365","date":"2026-05-25","note":"Status diubah menjadi Rusak oleh admin.","action":"Rusak"}]}],
      history: [],
      createdBy: admin.id,
    },
    {
      id: 'inv-1779695201909',
      itemCode: 'Laptop HP 14s-dk0xxx-001',
      itemName: 'Laptop HP 14s-dk0xxx',
      category: 'Laptop', brand: 'HP', branch: 'Jakarta', stock: 1,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Laptop HP 14s-dk0xxx-001","status":"Maintenance","location":"Gudang IT","assignedTo":"-","condition":"Aktif","condition_note":"Bagian sebelah kiri laptop ada yang longgar sehingga kadang bermasalah wifinya jadi harus di tekan agar bisa berfungsi lagi","production_date":"2023-07-18","history":[{"id":"hist-1779695462076","date":"2026-05-25","note":"Status diubah menjadi Maintenance oleh admin.","action":"Maintenance"}]}],
      history: [],
      createdBy: admin.id,
    },
    {
      id: 'inv-1779697586427',
      itemCode: 'Laptop Dell Latitude E6330-001',
      itemName: 'Laptop Dell Latitude E6330',
      category: 'Laptop', brand: 'Dell', branch: 'Jakarta', stock: 1,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Laptop Dell Latitude E6330-001","status":"Maintenance","location":"Gudang IT","assignedTo":"-","condition":"Aktif","condition_note":"Tidak dipakai","production_date":"2018-02-21","history":[{"id":"hist-1779697594451","date":"2026-05-25","note":"Status diubah menjadi Maintenance oleh admin.","action":"Maintenance"},{"id":"hist-1779697625207","date":"2026-05-25","note":"Status diubah menjadi Maintenance oleh admin.","action":"Maintenance"}]}],
      history: [],
      createdBy: admin.id,
    },
    {
      id: 'inv-1779699246441',
      itemCode: 'Laptop Dell Latitude E7470-001',
      itemName: 'Laptop Dell Latitude E7470',
      category: 'Laptop', brand: 'Dell', branch: 'Jakarta', stock: 2,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Laptop Dell Latitude E7470-001","status":"Aktif","location":"Ruangan MRO","assignedTo":"Marcell Chin","condition":"Aktif","condition_note":"","production_date":"2020-07-30","history":[{"id":"hist-1779699264740","date":"2026-05-25","note":"Status diubah menjadi Diperbaiki oleh admin.","action":"Diperbaiki"}]},{"serial":"Laptop Dell Latitude E7470-002","status":"Aktif","location":"Jakarta","assignedTo":"Rendy Muji Rahmad","condition":"Aktif","condition_note":"","production_date":"2022-09-18","history":[{"id":"hist-1779699482708","date":"2026-05-25","note":"Status diubah menjadi Diperbaiki oleh admin.","action":"Diperbaiki"}]}],
      history: [],
      createdBy: admin.id,
    },
    {
      id: 'inv-1779699372422',
      itemCode: 'Printer Epson L6270-001',
      itemName: 'Printer Epson L6270',
      category: 'Printer', brand: 'Epson', branch: 'Jakarta', stock: 1,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Printer Epson L6270-001","status":"Aktif","location":"Ruangan MRO","assignedTo":"MRO","condition":"Aktif","condition_note":"","production_date":"2026-05-25","history":[{"id":"hist-1779699383769","date":"2026-05-25","note":"Status diubah menjadi Diperbaiki oleh admin.","action":"Diperbaiki"},{"id":"hist-1779699407134","date":"2026-05-25","note":"Status diubah menjadi Diperbaiki oleh admin.","action":"Diperbaiki"}]}],
      history: [],
      createdBy: admin.id,
    },
    {
      id: 'inv-1779699803419',
      itemCode: 'Laptop Asus Vivobook X409UA-001',
      itemName: 'Laptop Asus Vivobook X409UA',
      category: 'Laptop', brand: 'Asus', branch: 'Jakarta Pusat', stock: 1,
      purchaseDate: new Date('2026-05-25'),
      units: [{"serial":"Laptop Asus Vivobook X409UA-001","status":"Aktif","location":"Ruangan Finance","assignedTo":"Dovy Febrianty Shandra","condition":"Aktif","condition_note":"","production_date":"2020-01-10","history":[{"id":"hist-1779699810994","date":"2026-05-25","note":"Status diubah menjadi Diperbaiki oleh admin.","action":"Diperbaiki"}]}],
      history: [],
      createdBy: admin.id,
    },
  ];

  for (const item of items) {
    try {
      await prisma.inventory.create({ data: item });
      console.log('  Created:', item.itemName);
    } catch (e: any) {
      if (e.message.includes('Unique constraint') || e.message.includes('duplicate key')) {
        console.log('  Skipped (exists):', item.itemName);
      } else {
        console.log('  Error:', item.itemName, e.message.substring(0, 80));
      }
    }
  }

  console.log('Seeding complete!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
