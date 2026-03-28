import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { authGuard } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'AGENT']).optional(),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return res.status(409).json({ message: 'Email already used' });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { ...parsed.data, passwordHash },
    select: { id: true, name: true, email: true, role: true },
  });

  res.status(201).json(user);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ sub: user.id, role: user.role, email: user.email, name: user.name }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, isWorking: user.isWorking },
  });
});

router.get('/me', authGuard, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, name: true, email: true, role: true, isWorking: true },
  });
  res.json(user);
});

export default router;
