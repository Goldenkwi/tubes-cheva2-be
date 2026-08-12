const { z } = require('zod');

const serviceCode = z.string().trim().regex(/^[A-Z0-9_]+$/, 'Code must use uppercase letters, numbers, and underscores');
const price = z.number().int().positive();

const createServiceSchema = z.object({
  body: z.object({
    code: serviceCode,
    name: z.string().min(1, 'Nama layanan wajib diisi'),
    type: z.enum(['KILOAN', 'SATUAN', 'EXPRESS']),
    category: z.string().trim().max(100).optional().nullable(),
    parentId: z.number().int().positive().optional().nullable(),
    pricePerKg: price.optional().nullable(),
    priceUnit: price.optional().nullable(),
    description: z.string().optional().nullable(),
  }).superRefine((data, ctx) => {
    const priceField = data.type === 'SATUAN' ? 'priceUnit' : 'pricePerKg';
    if (!data[priceField]) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [priceField], message: `${priceField} is required for ${data.type}` });
    }
  }),
});

const updateServiceSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    type: z.enum(['KILOAN', 'SATUAN', 'EXPRESS']).optional(),
    category: z.string().trim().max(100).optional().nullable(),
    parentId: z.number().int().positive().optional().nullable(),
    pricePerKg: price.optional().nullable(),
    priceUnit: price.optional().nullable(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

module.exports = { createServiceSchema, updateServiceSchema };
