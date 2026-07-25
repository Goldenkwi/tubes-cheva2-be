const { z } = require('zod');

const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    phone: z.string().min(10, 'No telepon minimal 10 digit'),
    email: z.string().email('Invalid email format').optional().nullable(),
    address: z.string().optional().nullable(),
  }),
});

const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional().nullable(),
    address: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

const customerIdParam = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

module.exports = { createCustomerSchema, updateCustomerSchema, customerIdParam };
