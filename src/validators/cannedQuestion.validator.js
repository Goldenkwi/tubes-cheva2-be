const { z } = require('zod');

const idParam = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

const createCannedQuestionSchema = z.object({
  body: z.object({
    question: z.string().trim().min(1, 'Pertanyaan wajib diisi'),
    answer: z.string().trim().min(1, 'Jawaban wajib diisi'),
    category: z.string().trim().min(1).optional().default('GENERAL'),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateCannedQuestionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
  body: z.object({
    question: z.string().trim().min(1).optional(),
    answer: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

const askCannedQuestionSchema = z.object({
  body: z.object({
    cannedQuestionId: z.number().int().positive('cannedQuestionId wajib berupa angka positif'),
    customerId: z.number().int().positive().optional(),
    orderId: z.number().int().positive().optional(),
  }),
});

module.exports = {
  createCannedQuestionSchema,
  updateCannedQuestionSchema,
  askCannedQuestionSchema,
  cannedQuestionIdParam: idParam,
};
