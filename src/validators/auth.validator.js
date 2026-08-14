const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').transform((val) => val.trim().toLowerCase()),
    password: z.string().min(6, 'Password minimal 6 karakter'),
  }),
});

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Nama wajib diisi'),
    email: z.string().email('Invalid email format').transform((val) => val.trim().toLowerCase()),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    phone: z.string().trim().min(10, 'No telepon minimal 10 digit').optional(),
    role: z.enum(['ADMIN', 'STAFF']).optional().default('STAFF'),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Nama wajib diisi').optional(),
    phone: z.string().trim().min(10, 'No telepon minimal 10 digit').optional(),
    photoUrl: z.string().optional(),
    email: z.string().email('Invalid email format').transform((val) => val.trim().toLowerCase()).optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: z.string().min(6, 'Password minimal 6 karakter'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').transform((val) => val.trim().toLowerCase()),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10, 'Token tidak valid'),
    newPassword: z.string().min(6, 'Password minimal 6 karakter'),
  }),
});

module.exports = {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};

