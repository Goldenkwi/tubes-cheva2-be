const { z } = require('zod');

const payOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
  body: z.object({
    paymentMethod: z.enum(['CASH', 'QRIS', 'TRANSFER', 'EWALLET']).default('CASH'),
    paymentProof: z.string().trim().min(1).max(500).optional(),
    notes: z.string().trim().max(1000).optional(),
  }).strict(),
});

module.exports = { payOrderSchema };
