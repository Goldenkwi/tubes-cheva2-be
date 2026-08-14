const { z } = require('zod');

const replySchema = z.object({
  body: z.object({
    body: z.string().trim().min(1, 'Pesan tidak boleh kosong'),
  }),
});

const customerMessageSchema = z.object({
  body: z.object({
    body: z.string().trim().min(1, 'Pesan tidak boleh kosong'),
    orderId: z.number().int().positive().optional(),
  }),
});

module.exports = { replySchema, customerMessageSchema };
