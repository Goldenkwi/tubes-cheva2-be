const { z } = require('zod');

const registerCustomerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Nama wajib diisi'),
    phone: z.string().trim().min(10, 'No telepon minimal 10 digit'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    email: z.string().email('Format email tidak valid').transform((val) => val.trim().toLowerCase()).optional().nullable(),
    address: z.string().trim().optional().nullable(),
  }),
});

const loginCustomerSchema = z.object({
  body: z.object({
    phone: z.string().trim().min(1, 'Nomor telepon wajib diisi'),
    password: z.string().min(1, 'Password wajib diisi'),
  }),
});

const claimAccountSchema = z.object({
  body: z.object({
    phone: z.string().trim().min(10, 'No telepon minimal 10 digit'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
  }),
});

const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Nama wajib diisi'),
    phone: z.string().trim().min(10, 'No telepon minimal 10 digit'),
    email: z.string().email('Invalid email format').transform((val) => val.trim().toLowerCase()).optional().nullable(),
    address: z.string().trim().optional().nullable(),
  }),
});

const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(10).optional(),
    email: z.string().email().transform((val) => val.trim().toLowerCase()).optional().nullable(),
    address: z.string().trim().optional().nullable(),
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

module.exports = {
  registerCustomerSchema,
  loginCustomerSchema,
  claimAccountSchema,
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParam,
};

