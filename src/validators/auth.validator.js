const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
  }),
});

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    phone: z.string().min(10, 'No telepon minimal 10 digit').optional(),
    role: z.enum(['ADMIN', 'STAFF']).optional(),
  }),
});

module.exports = { loginSchema, registerSchema };
