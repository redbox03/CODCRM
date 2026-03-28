import { OrderStatus } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authGuard, roleGuard } from '../middleware/auth.js';
import { pushToDelivery } from '../services/deliveryService.js';
import { importOrdersFromSheet } from '../services/googleSheetsService.js';
import { assignOrderForAttempt, dedupeAndUpsertOrder } from '../services/orderService.js';
import { env } from '../config/env.js';
import { whatsappLink } from '../utils/format.js';

const router = Router();
router.use(authGuard);

router.get('/', async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : { assignedAgentId: req.user.sub };
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { statusHistory: true, upsells: true },
  });

  res.json(
    orders.map((order) => ({
      ...order,
      callLink: `tel:${order.phone}`,
      whatsappLink: whatsappLink(order.phone, `Bonjour ${order.customerName}, confirmation de votre commande ${order.product}`),
    })),
  );
});

router.get('/:id/history', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { statusHistory: true, callAttempts: true, deliveries: true, upsells: true },
  });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

router.post('/import/google-sheets', roleGuard('ADMIN'), async (req, res) => {
  const spreadsheetId = req.body.spreadsheetId || env.googleSheetId;
  if (!spreadsheetId) return res.status(400).json({ message: 'spreadsheetId required' });

  const rows = await importOrdersFromSheet({ spreadsheetId, range: req.body.range || 'Orders!A:F' });

  let imported = 0;
  for (const row of rows) {
    await dedupeAndUpsertOrder(row);
    imported += 1;
  }

  res.json({ imported });
});

router.post('/import/manual', roleGuard('ADMIN'), async (req, res) => {
  const schema = z.array(
    z.object({
      externalOrderId: z.string().optional(),
      customerName: z.string(),
      phone: z.string(),
      city: z.string(),
      product: z.string(),
      price: z.number(),
      source: z.string().optional(),
    }),
  );

  const parsed = schema.safeParse(req.body.orders);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const results = [];
  for (const order of parsed.data) {
    results.push(await dedupeAndUpsertOrder(order));
  }

  res.status(201).json(results);
});

router.patch('/:id/workflow', async (req, res) => {
  const schema = z.object({
    status: z.nativeEnum(OrderStatus),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const updated = await assignOrderForAttempt(req.params.id, req.user.sub, parsed.data.status, parsed.data.notes);
  res.json(updated);
});

router.patch('/:id/schedule', async (req, res) => {
  const scheduleAt = new Date(req.body.scheduleAt);
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { scheduledAt: scheduleAt } });
  res.json(order);
});

router.post('/:id/upsell', async (req, res) => {
  const schema = z.object({ description: z.string(), amount: z.number().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const upsell = await prisma.upsell.create({
    data: {
      orderId: req.params.id,
      agentId: req.user.sub,
      description: parsed.data.description,
      amount: parsed.data.amount,
    },
  });

  res.status(201).json(upsell);
});

router.post('/:id/delivery/push', roleGuard('ADMIN'), async (req, res) => {
  const order = await pushToDelivery(req.params.id, req.body.provider || 'MOCK');
  res.json(order);
});

router.patch('/:id/delivery/status', roleGuard('ADMIN'), async (req, res) => {
  const status = req.body.status;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status,
      deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
      returnedAt: status === 'RETURNED' ? new Date() : undefined,
      statusHistory: { create: { status, note: 'Delivery status update' } },
      deliveries: { create: { status, provider: req.body.provider || 'MOCK', payload: req.body.payload || {} } },
    },
  });

  if (status === 'DELIVERED') {
    await prisma.upsell.updateMany({
      where: { orderId: req.params.id, deliveredAt: null },
      data: { deliveredAt: new Date() },
    });
  }

  res.json(order);
});

export default router;
