const { z } = require('zod');
const { ORDER_STATUS } = require('../utils/constants');

const createOrderSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    serviceId: z.number().int().positive(),
    weight: z.number().positive().optional(),
    itemCount: z.number().int().positive().optional(),
    pickupAddress: z.string().optional(),
    deliveryAddress: z.string().optional(),
    estimatedDone: z.string().datetime().optional(),
    notes: z.string().optional(),
    courierId: z.number().int().positive().optional(),
  }),
});

const updateOrderSchema = z.object({
  body: z.object({
    weight: z.number().positive().optional(),
    itemCount: z.number().int().positive().optional(),
    pickupAddress: z.string().optional(),
    deliveryAddress: z.string().optional(),
    estimatedDone: z.string().datetime().optional(),
    notes: z.string().optional(),
    courierId: z.number().int().positive().nullable().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ORDER_STATUS),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

const orderIdParam = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

const trackingTokenParam = z.object({
  params: z.object({
    trackingToken: z.string().uuid('Invalid tracking token'),
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  updateStatusSchema,
  orderIdParam,
  trackingTokenParam,
};
