const prisma = require('../config/database');

// Singleton: the app keeps a single payment-settings row. Bank accounts are a
// flat list of transfer destinations shown on receipts.
async function getSettings() {
  let settings = await prisma.paymentSetting.findFirst();
  if (!settings) {
    settings = await prisma.paymentSetting.create({ data: {} });
  }
  const bankAccounts = await prisma.bankAccount.findMany({ orderBy: { id: 'asc' } });
  return { ...settings, bankAccounts };
}

async function updateSettings(data) {
  let settings = await prisma.paymentSetting.findFirst();
  if (!settings) {
    settings = await prisma.paymentSetting.create({ data: {} });
  }

  await prisma.paymentSetting.update({
    where: { id: settings.id },
    data: {
      qrisEnabled: data.qrisEnabled,
      qrisMerchantName: data.qrisMerchantName,
      qrisNmid: data.qrisNmid,
      qrisImageUrl: data.qrisImageUrl,
      cashEnabled: data.cashEnabled,
      transferEnabled: data.transferEnabled,
    },
  });

  if (Array.isArray(data.bankAccounts)) {
    await prisma.$transaction([
      prisma.bankAccount.deleteMany(),
      prisma.bankAccount.createMany({
        data: data.bankAccounts.map((account) => ({
          bankName: account.bankName,
          noRekening: account.noRekening,
          namaPemilik: account.namaPemilik,
          enabled: account.enabled ?? true,
        })),
      }),
    ]);
  }

  return getSettings();
}

module.exports = { getSettings, updateSettings };
