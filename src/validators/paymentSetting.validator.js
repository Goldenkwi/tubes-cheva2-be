const { z } = require('zod');

const bankAccountSchema = z.object({
  bankName: z.string().trim().min(1, 'Nama bank wajib diisi'),
  noRekening: z.string().trim().min(1, 'No rekening wajib diisi'),
  namaPemilik: z.string().trim().min(1, 'Nama pemilik wajib diisi'),
  enabled: z.boolean().optional(),
});

const paymentSettingSchema = z.object({
  body: z.object({
    qrisEnabled: z.boolean().optional(),
    qrisMerchantName: z.string().trim().optional().nullable(),
    qrisNmid: z.string().trim().optional().nullable(),
    qrisImageUrl: z.string().optional().nullable(),
    cashEnabled: z.boolean().optional(),
    transferEnabled: z.boolean().optional(),
    bankAccounts: z.array(bankAccountSchema).optional(),
  }),
});

module.exports = { paymentSettingSchema };
