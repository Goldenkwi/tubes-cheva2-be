const { z } = require('zod');
const { EXPENSE_CATEGORY } = require('../utils/constants');

const createExpenseSchema = z.object({
  body: z.object({
    category: z.nativeEnum(EXPENSE_CATEGORY),
    amount: z.number().int().positive(),
    source: z.string().trim().max(255).optional(),
    description: z.string().trim().max(1000).optional(),
    receiptProof: z.string().trim().max(500).optional(),
    spentAt: z.string().datetime().optional(),
  }).strict(),
});

const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
  body: z.object({
    category: z.nativeEnum(EXPENSE_CATEGORY).optional(),
    amount: z.number().int().positive().optional(),
    source: z.string().trim().max(255).optional(),
    description: z.string().trim().max(1000).optional(),
    receiptProof: z.string().trim().max(500).optional(),
    spentAt: z.string().datetime().optional(),
  }).strict(),
});

const expenseIdParam = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

module.exports = { createExpenseSchema, updateExpenseSchema, expenseIdParam };
