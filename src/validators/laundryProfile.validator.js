const { z } = require('zod');

const laundryProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().optional().nullable(),
    address: z.string().optional().nullable(),
    info: z.string().optional().nullable(),
    operationalDays: z.array(z.string()).optional(),
    openTime: z.string().optional().nullable(),
    closeTime: z.string().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    links: z.string().optional().nullable(),
  }),
});

module.exports = { laundryProfileSchema };
