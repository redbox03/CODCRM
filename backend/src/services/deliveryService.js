import { DeliveryProvider, OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export async function pushToDelivery(orderId, provider = DeliveryProvider.MOCK) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.SHIPPED,
      shippedAt: new Date(),
      deliveries: {
        create: {
          provider,
          status: OrderStatus.SHIPPED,
          externalId: `SHIP-${Date.now()}`,
          payload: { provider, mock: true },
        },
      },
      statusHistory: {
        create: {
          status: OrderStatus.SHIPPED,
          note: `Order shipped via ${provider}`,
        },
      },
    },
  });
}
