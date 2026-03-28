import { Router } from 'express';
import dayjs from 'dayjs';
import { prisma } from '../config/prisma.js';
import { authGuard, roleGuard } from '../middleware/auth.js';
import { toNumber } from '../utils/format.js';

const router = Router();
router.use(authGuard, roleGuard('ADMIN'));

router.get('/metrics', async (_req, res) => {
  const totalOrders = await prisma.order.count();
  const confirmedOrders = await prisma.order.count({ where: { status: { in: ['SHIPPING_QUEUE', 'SHIPPED', 'DELIVERED'] } } });
  const deliveredOrders = await prisma.order.findMany({ where: { status: 'DELIVERED' } });

  const totalRevenue = deliveredOrders.reduce((acc, order) => acc + toNumber(order.price), 0);
  const totalUpsell = await prisma.upsell.findMany({ where: { deliveredAt: { not: null } } });
  const upsellRevenue = totalUpsell.reduce((acc, u) => acc + toNumber(u.amount), 0);

  const adSpendRows = await prisma.adMetric.findMany();
  const adsSpend = adSpendRows.reduce((acc, row) => acc + toNumber(row.spendMad), 0);

  res.json({
    totalRevenue: totalRevenue + upsellRevenue,
    orders: totalOrders,
    confirmationRate: totalOrders ? (confirmedOrders / totalOrders) * 100 : 0,
    deliveryRate: confirmedOrders ? (deliveredOrders.length / confirmedOrders) * 100 : 0,
    profit: totalRevenue + upsellRevenue - adsSpend,
    adsSpend,
  });
});

router.post('/ads-metrics', async (req, res) => {
  const date = dayjs(req.body.date).startOf('day').toDate();
  const metric = await prisma.adMetric.upsert({
    where: { date },
    update: { spendMad: req.body.spendMad, leads: req.body.leads, sales: req.body.sales, notes: req.body.notes },
    create: { date, spendMad: req.body.spendMad, leads: req.body.leads, sales: req.body.sales, notes: req.body.notes },
  });

  res.status(201).json(metric);
});

export default router;
