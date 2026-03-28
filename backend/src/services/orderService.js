import { OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export async function dedupeAndUpsertOrder(payload) {
  const existingByExternal = payload.externalOrderId
    ? await prisma.order.findFirst({ where: { externalOrderId: payload.externalOrderId } })
    : null;

  if (existingByExternal) {
    return prisma.order.update({
      where: { id: existingByExternal.id },
      data: { ...payload },
    });
  }

  const existingPhoneOrders = await prisma.order.findMany({
    where: { phone: payload.phone },
    include: { statusHistory: true },
    orderBy: { createdAt: 'desc' },
  });

  const hasHistory = existingPhoneOrders.some((order) => order.statusHistory.length > 0);

  if (!hasHistory && existingPhoneOrders.length) {
    const latest = existingPhoneOrders[0];
    return prisma.order.update({
      where: { id: latest.id },
      data: { ...payload, note: 'Order replaced by newer import (same phone, no history)' },
    });
  }

  return prisma.order.create({
    data: {
      ...payload,
      note: hasHistory ? 'Duplicate phone with history: kept both orders' : payload.note,
      status: OrderStatus.NEW,
      statusHistory: {
        create: {
          status: OrderStatus.NEW,
          note: 'Imported from Google Sheets',
        },
      },
    },
  });
}

export async function assignOrderForAttempt(orderId, agentId, status, notes) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { callAttempts: true } });
  if (!order) throw new Error('Order not found');

  const attemptNo = order.callAttempts.length + 1;

  const updates = {
    status,
    assignedAgentId: agentId,
    statusHistory: {
      create: {
        status,
        note: notes || `Call attempt ${attemptNo}`,
      },
    },
    callAttempts: {
      create: {
        attemptNo,
        agentId,
        status,
        notes,
      },
    },
  };

  if (status === OrderStatus.CONFIRMED) {
    updates.status = OrderStatus.SHIPPING_QUEUE;
    updates.statusHistory.create = {
      status: OrderStatus.SHIPPING_QUEUE,
      note: 'Auto moved to shipping queue after confirmation',
    };
  }

  if ([OrderStatus.NO_ANSWER_1, OrderStatus.NO_ANSWER_2, OrderStatus.CALL_LATER].includes(status)) {
    updates.scheduledAt = new Date(Date.now() + 30 * 60 * 1000);
  }

  return prisma.order.update({ where: { id: orderId }, data: updates });
}
