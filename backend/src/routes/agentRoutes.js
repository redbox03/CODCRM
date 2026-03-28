import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authGuard } from '../middleware/auth.js';
import { toNumber } from '../utils/format.js';

const router = Router();
router.use(authGuard);

router.post('/working-toggle', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  const nextState = !user.isWorking;

  if (nextState) {
    await prisma.agentSession.create({ data: { agentId: req.user.sub } });
  } else {
    await prisma.agentSession.updateMany({
      where: { agentId: req.user.sub, endedAt: null },
      data: { endedAt: new Date() },
    });
  }

  const updated = await prisma.user.update({ where: { id: req.user.sub }, data: { isWorking: nextState } });
  res.json({ isWorking: updated.isWorking });
});

router.get('/kpis', async (req, res) => {
  const deliveredOrders = await prisma.order.findMany({
    where: { assignedAgentId: req.user.sub, status: 'DELIVERED' },
  });

  const deliveredUpsells = await prisma.upsell.findMany({
    where: { agentId: req.user.sub, deliveredAt: { not: null } },
  });

  const deliveredCount = deliveredOrders.length;
  const upsellCount = deliveredUpsells.length;
  const upsellRevenue = deliveredUpsells.reduce((acc, item) => acc + toNumber(item.amount), 0);

  res.json({
    confirmed: await prisma.order.count({ where: { assignedAgentId: req.user.sub, status: { in: ['CONFIRMED', 'SHIPPING_QUEUE', 'SHIPPED', 'DELIVERED'] } } }),
    delivered: deliveredCount,
    upsells: upsellCount,
    earningsMad: deliveredCount * 10 + upsellCount * 5,
    upsellRevenue,
  });
});

export default router;
