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

  // Additional services (SATUAN) — flat list, no size variants.
  // Everyday clothing plus household items, all single-price per piece.
  const additionalServices = [
    { code: 'ADD_BAJU', name: 'Baju', priceUnit: 8000 },
    { code: 'ADD_CELANA', name: 'Celana', priceUnit: 8000 },
    { code: 'ADD_KAOS', name: 'Kaos', priceUnit: 6000 },
    { code: 'ADD_JAKET', name: 'Jaket', priceUnit: 15000 },
    { code: 'ADD_PUTIH', name: 'Baju Putih', priceUnit: 10000 },
    { code: 'ADD_HANDUK', name: 'Handuk', priceUnit: 8000 },
    { code: 'ADD_SPREI', name: 'Sprei', priceUnit: 20000 },
    { code: 'ADD_SELIMUT', name: 'Selimut', priceUnit: 15000 },
    { code: 'ADD_BANTAL', name: 'Bantal', priceUnit: 10000 },
    { code: 'ADD_BEDCOVER', name: 'Bed Cover', priceUnit: 25000 },
    { code: 'ADD_KARPET', name: 'Karpet', priceUnit: 25000 },
    { code: 'ADD_GORDEN', name: 'Gorden', priceUnit: 20000 },
    { code: 'ADD_BONEKA', name: 'Boneka', priceUnit: 15000 },
    { code: 'ADD_SEPATU', name: 'Sepatu', priceUnit: 20000 },
  ];

  for (const s of additionalServices) {
    await prisma.service.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        type: 'SATUAN',
        category: 'Layanan Tambahan',
        priceUnit: s.priceUnit,
        pricePerKg: null,
        parentId: null,
        isActive: true,
      },
      create: {
        code: s.code,
        name: s.name,
        type: 'SATUAN',
        category: 'Layanan Tambahan',
        priceUnit: s.priceUnit,
        isActive: true,
      },
    });
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
  const selimut = await prisma.service.findUnique({ where: { code: 'ADD_SELIMUT' } });
  const sprei = await prisma.service.findUnique({ where: { code: 'ADD_SPREI' } });

  const sampleOrders = [
    {
      customer: customers[0],
      items: [
        { serviceId: cuciSetrika.id, name: cuciSetrika.name, weight: 7.4, unitPrice: 8000, subtotal: 59200 },
        { serviceId: selimut.id, name: selimut.name, itemCount: 1, unitPrice: 15000, subtotal: 15000 },
      ],
      totalPrice: 74200,
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
        { serviceId: sprei.id, name: sprei.name, itemCount: 1, unitPrice: 20000, subtotal: 20000 },
      ],
      totalPrice: 48000,
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

  // ===== Sample Chat Conversation =====
  const chatCount = await prisma.conversation.count();
  if (chatCount === 0) {
    const raniOrder = await prisma.order.findUnique({ where: { orderNumber: 'TRX/0023400501' } });
    await prisma.conversation.create({
      data: {
        customerId: customers[0].id,
        orderId: raniOrder ? raniOrder.id : null,
        messages: {
          create: { senderType: 'CUSTOMER', body: 'Kapan pesanan saya selesai ?' },
        },
      },
    });
    console.log('Chat conversation seeded');
  }

  console.log('Seed completed successfully');
  console.log(`Admin ready: ${admin.email}`);
  console.log(`Services: ${mainServiceRows.length} main + ${additionalServices.length} additional`);
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
