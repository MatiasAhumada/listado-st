import prisma from "@/lib/prisma";
import { ServiceOrderStatus } from "@prisma/client";

export const serviceOrderStatusHistoryRepository = {
  async create(serviceOrderId: string, status: ServiceOrderStatus, occurredAt: Date) {
    return prisma.serviceOrderStatusHistory.create({
      data: { serviceOrderId, status, occurredAt },
    });
  },

  async findByOrderId(serviceOrderId: string) {
    return prisma.serviceOrderStatusHistory.findMany({
      where: { serviceOrderId },
      orderBy: { occurredAt: "asc" },
    });
  },
};
