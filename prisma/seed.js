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

  // ===== Services (hierarchical: parent category -> sub-services) =====
  // Main services (Kiloan) — top level
  const mainServices = [
    {
      code: 'WASH_DRY',
      name: 'Cuci Kering',
      type: 'KILOAN',
      pricePerKg: 5000,
      description: 'Cuci + pengeringan, tanpa setrika',
      category: 'Layanan Utama',
    },
    {
      code: 'WASH_IRON',
      name: 'Cuci Setrika',
      type: 'KILOAN',
      pricePerKg: 8000,
      description: 'Cuci + pengeringan + setrika rapi',
      category: 'Layanan Utama',
    },
    {
      code: 'IRON_ONLY',
      name: 'Setrika Aja',
      type: 'KILOAN',
      pricePerKg: 5000,
      description: 'Setrika saja, cucian sudah bersih',
      category: 'Layanan Utama',
    },
    {
      code: 'EXPRESS_6H',
      name: 'Express (6 Jam)',
      type: 'EXPRESS',
      pricePerKg: 15000,
      description: 'Cuci setrika selesai dalam 6 jam',
      category: 'Layanan Utama',
    },
    {
      code: 'CUCI_EXPRESS',
      name: 'Cuci Express',
      type: 'EXPRESS',
      pricePerKg: 50000,
      description: 'Layanan kilat premium, estimasi 5-10 jam',
      category: 'Layanan Utama',
    },
  ];

  const mainServiceRows = [];
  for (const s of mainServices) {
    mainServiceRows.push(
      await prisma.service.upsert({
        where: { code: s.code },
        update: { ...s, parentId: null },
        create: { ...s, parentId: null },
      })
    );
  }

  // Additional services (SATUAN) — categories with child sub-services
  const additionalServiceData = [
    {
      code: 'ADD_SELIMUT',
      name: 'Selimut',
      children: [
        { code: 'ADD_SELIMUT_KECIL', name: 'Selimut Kecil', priceUnit: 10000 },
        { code: 'ADD_SELIMUT_SEDANG', name: 'Selimut Sedang', priceUnit: 15000 },
        { code: 'ADD_SELIMUT_BESAR', name: 'Selimut Besar', priceUnit: 25000 },
      ],
    },
    {
      code: 'ADD_SPREI',
      name: 'Sprei',
      children: [
        { code: 'ADD_SPREI_KECIL', name: 'Sprei Kecil', priceUnit: 20000 },
        { code: 'ADD_SPREI_BESAR', name: 'Sprei Besar', priceUnit: 35000 },
      ],
    },
    {
      code: 'ADD_BANTAL',
      name: 'Bantal',
      children: [
        { code: 'ADD_BANTAL_KECIL', name: 'Bantal Kecil', priceUnit: 30000 },
        { code: 'ADD_BANTAL_BESAR', name: 'Bantal Besar', priceUnit: 45000 },
      ],
    },
    {
      code: 'ADD_BEDCOVER',
      name: 'Bed Cover',
      children: [
        { code: 'ADD_BEDCOVER_KECIL', name: 'Bed Cover Kecil', priceUnit: 40000 },
        { code: 'ADD_BEDCOVER_BESAR', name: 'Bed Cover Besar', priceUnit: 65000 },
      ],
    },
    {
      code: 'ADD_KARPET',
      name: 'Karpet',
      children: [
        { code: 'ADD_KARPET_KECIL', name: 'Karpet Kecil', priceUnit: 40000 },
        { code: 'ADD_KARPET_BESAR', name: 'Karpet Besar', priceUnit: 65000 },
      ],
    },
    {
      code: 'ADD_BONEKA',
      name: 'Boneka',
      children: [
        { code: 'ADD_BONEKA_KECIL', name: 'Boneka Kecil', priceUnit: 20000 },
        { code: 'ADD_BONEKA_BESAR', name: 'Boneka Besar', priceUnit: 35000 },
      ],
    },
    {
      code: 'ADD_PUTIH',
      name: 'Baju Putih',
      children: [
        { code: 'ADD_PUTIH_PEMUTIH', name: 'Pemutih + Pelembut', priceUnit: 10000 },
      ],
    },
  ];

  for (const cat of additionalServiceData) {
    const parent = await prisma.service.upsert({
      where: { code: cat.code },
      update: { name: cat.name, type: 'SATUAN', category: 'Layanan Tambahan', priceUnit: null, pricePerKg: null, isActive: true },
      create: {
        code: cat.code,
        name: cat.name,
        type: 'SATUAN',
        category: 'Layanan Tambahan',
        isActive: true,
      },
    });
    for (const child of cat.children) {
      await prisma.service.upsert({
        where: { code: child.code },
        update: {
          name: child.name,
          type: 'SATUAN',
          category: 'Layanan Tambahan',
          priceUnit: child.priceUnit,
          pricePerKg: null,
          parentId: parent.id,
          isActive: true,
        },
        create: {
          code: child.code,
          name: child.name,
          type: 'SATUAN',
          category: 'Layanan Tambahan',
          priceUnit: child.priceUnit,
          parentId: parent.id,
          isActive: true,
        },
      });
    }
  }

  // ===== Customers =====
  const customers = await Promise.all(
    [
      { name: 'Rani Puspita', phone: '081234567891', email: 'rani@example.com', address: 'Jl. Merdeka No. 1, Bandung' },
      { name: 'Alberto', phone: '081298765432', email: 'alberto@example.com', address: 'Jl. Dago No. 22, Bandung' },
      { name: 'Azzam', phone: '081399887766', email: 'azzam@example.com', address: 'Jl. Setiabudi No. 7, Bandung' },
    ].map((c) =>
      prisma.customer.upsert({
        where: { phone: c.phone },
        update: c,
        create: c,
      })
    )
  );

  // ===== Sample Orders (multi-service line items) =====
  const cuciSetrika = await prisma.service.findUnique({ where: { code: 'WASH_IRON' } });
  const selimutKecil = await prisma.service.findUnique({ where: { code: 'ADD_SELIMUT_KECIL' } });
  const spreiBesar = await prisma.service.findUnique({ where: { code: 'ADD_SPREI_BESAR' } });

  const sampleOrders = [
    {
      customer: customers[0],
      items: [
        { serviceId: cuciSetrika.id, name: cuciSetrika.name, weight: 7.4, unitPrice: 8000, subtotal: 59200 },
        { serviceId: selimutKecil.id, name: selimutKecil.name, itemCount: 1, unitPrice: 10000, subtotal: 10000 },
      ],
      totalPrice: 69200,
      status: 'WASHING',
      orderNumber: 'TRX/0023400501',
      pickupAddress: 'Jl. Merdeka No. 1, Bandung',
      deliveryAddress: 'Jl. Merdeka No. 1, Bandung',
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      weight: 7.4,
    },
    {
      customer: customers[1],
      items: [
        { serviceId: cuciSetrika.id, name: cuciSetrika.name, weight: 3.5, unitPrice: 8000, subtotal: 28000 },
        { serviceId: spreiBesar.id, name: spreiBesar.name, itemCount: 1, unitPrice: 35000, subtotal: 35000 },
      ],
      totalPrice: 63000,
      status: 'READY',
      orderNumber: 'TRX/0023300502',
      pickupAddress: 'Jl. Dago No. 22, Bandung',
      deliveryAddress: 'Jl. Dago No. 22, Bandung',
      paymentMethod: 'QRIS',
      paymentStatus: 'PAID',
      weight: 3.5,
    },
    {
      customer: customers[2],
      items: [
        { serviceId: cuciSetrika.id, name: cuciSetrika.name, weight: 8.6, unitPrice: 8000, subtotal: 68800 },
      ],
      totalPrice: 68800,
      status: 'COMPLETED',
      orderNumber: 'TRX/0023200503',
      pickupAddress: 'Jl. Setiabudi No. 7, Bandung',
      deliveryAddress: 'Jl. Setiabudi No. 7, Bandung',
      paymentMethod: 'TRANSFER',
      paymentStatus: 'PAID',
      weight: 8.6,
    },
  ];

  for (const so of sampleOrders) {
    const existing = await prisma.order.findUnique({ where: { orderNumber: so.orderNumber } });
    if (existing) continue;

    const order = await prisma.order.create({
      data: {
        orderNumber: so.orderNumber,
        customerId: so.customer.id,
        serviceId: so.items[0].serviceId,
        weight: so.weight,
        totalPrice: so.totalPrice,
        status: so.status,
        pickupAddress: so.pickupAddress,
        deliveryAddress: so.deliveryAddress,
        items: { create: so.items },
        statusHistories: {
          create: { status: so.status, changedBy: admin.id, notes: 'Pesanan dibuat (seed)' },
        },
        transaction: {
          create: {
            amount: so.totalPrice,
            paymentMethod: so.paymentMethod,
            paymentStatus: so.paymentStatus,
            paidAt: new Date(),
          },
        },
      },
    });

    await prisma.customer.update({
      where: { id: so.customer.id },
      data: {
        totalOrders: { increment: 1 },
        totalWeight: { increment: so.weight },
      },
    });

    console.log(`Order seeded: ${order.orderNumber}`);
  }

  // ===== Sample Expenses =====
  const expenses = [
    { category: 'BAHAN_BAKU', amount: 150000, source: 'Kas Harian', description: 'Deterjen & pelembut bulanan' },
    { category: 'UTILITAS', amount: 120000, source: 'Kas Harian', description: 'Tagihan air & listrik' },
    { category: 'GAJI', amount: 1000000, source: 'Bank', description: 'Uang muka gaji karyawan' },
  ];

  const expenseCount = await prisma.expense.count();
  if (expenseCount === 0) {
    for (const e of expenses) {
      await prisma.expense.create({
        data: { ...e, createdBy: admin.id },
      });
    }
  }

  // ===== Canned Questions =====
  const cannedQuestionData = [
    {
      category: 'GENERAL',
      question: 'Berapa jam operasional Cheva Laundry?',
      answer: 'Cheva Laundry buka setiap hari Senin - Minggu dari pukul 07.00 s/d 21.00 WIB.',
    },
    {
      category: 'GENERAL',
      question: 'Di mana lokasi outlet Cheva Laundry?',
      answer: 'Outlet kami berlokasi di Jl. Pendidikan No. 12, Bandung (Dekat Kampus).',
    },
    {
      category: 'ORDER',
      question: 'Berapa lama estimasi pengerjaan cuci reguler?',
      answer: 'Estimasi pengerjaan cuci reguler (Kiloan) adalah 1-2 hari kerja.',
    },
    {
      category: 'PAYMENT',
      question: 'Metode pembayaran apa saja yang didukung?',
      answer: 'Kami menerima pembayaran Tunai (CASH), QRIS (Gopay/OVO/Dana/Bank), Transfer Bank, dan E-Wallet.',
    },
  ];

  const cannedCount = await prisma.cannedQuestion.count();
  if (cannedCount === 0) {
    await prisma.cannedQuestion.createMany({ data: cannedQuestionData });
  }

  console.log('Seed completed successfully');
  console.log(`Admin ready: ${admin.email}`);
  console.log(`Services: ${mainServiceRows.length} main + ${additionalServiceData.length} additional categories`);
  console.log(`Customers: ${customers.length}`);
  console.log(`Orders seeded: ${sampleOrders.length}`);
  console.log(`Expenses seeded: ${expenses.length}`);
  console.log(`Canned questions: ${cannedQuestionData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
