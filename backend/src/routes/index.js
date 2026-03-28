import { Router } from 'express';
import authRoutes from './authRoutes.js';
import orderRoutes from './orderRoutes.js';
import agentRoutes from './agentRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'codcrm-api' }));
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/agents', agentRoutes);
router.use('/admin', adminRoutes);

export default router;
