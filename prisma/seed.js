const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminName = process.env.SEED_ADMIN_NAME;
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPhone = process.env.SEED_ADMIN_PHONE;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminName || !adminEmail || !adminPhone || !adminPassword) {
    throw new Error('SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PHONE, and SEED_ADMIN_PASSWORD are required');
  }
  if (adminPassword.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must contain at least 12 characters');
  }
  if (adminPassword === 'replace-with-at-least-12-characters') {
    throw new Error('SEED_ADMIN_PASSWORD must not use the example value');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      phone: adminPhone,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: passwordHash,
      phone: adminPhone,
      role: 'ADMIN',
    },
  });

  const serviceData = [
    {
      code: 'WASH_DRY',
      name: 'Cuci Kering',
      type: 'KILOAN',
      pricePerKg: 5000,
      description: 'Cuci + pengeringan, tanpa setrika',
    },
    {
      code: 'WASH_IRON',
      name: 'Cuci Setrika',
      type: 'KILOAN',
      pricePerKg: 8000,
      description: 'Cuci + pengeringan + setrika rapi',
    },
    {
      code: 'IRON_ONLY',
      name: 'Setrika Aja',
      type: 'KILOAN',
      pricePerKg: 5000,
      description: 'Setrika saja, cucian sudah bersih',
    },
    {
      code: 'EXPRESS_6H',
      name: 'Express (6 Jam)',
      type: 'EXPRESS',
      pricePerKg: 15000,
      description: 'Cuci setrika selesai dalam 6 jam',
    },
    {
      code: 'LARGE_ITEM',
      name: 'Selimut/Boneka Besar',
      type: 'SATUAN',
      priceUnit: 15000,
      description: 'Laundry satuan untuk barang besar',
    },
  ];

  const services = await Promise.all(
    serviceData.map((service) =>
      prisma.service.upsert({
        where: { code: service.code },
        update: service,
        create: service,
      })
    )
  );

  console.log('Seed completed successfully');
  console.log(`Admin ready: ${admin.email}`);
  console.log(`Services created: ${services.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
