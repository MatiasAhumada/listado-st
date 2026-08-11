import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  CreateWorkshopCustomerPayload,
  MobileDevicePayload,
  UpdateWorkshopCustomerPayload,
} from "@/interfaces/workshopOperations.interface";

export type WorkshopCustomerWithRelations = Prisma.WorkshopCustomerGetPayload<{
  include: {
    devices: true;
    _count: { select: { quotes: true } };
  };
}>;

const customerRelations = {
  devices: { orderBy: { createdAt: "asc" as const } },
  _count: { select: { quotes: true } },
};

export class WorkshopCustomerRepository {
  static async findAll(workshopId: string): Promise<WorkshopCustomerWithRelations[]> {
    return prisma.workshopCustomer.findMany({
      where: { workshopId },
      orderBy: { createdAt: "desc" },
      include: customerRelations,
    });
  }

  static async findById(workshopId: string, customerId: string): Promise<WorkshopCustomerWithRelations | null> {
    return prisma.workshopCustomer.findFirst({
      where: { id: customerId, workshopId },
      include: customerRelations,
    });
  }

  static async create(
    workshopId: string,
    payload: CreateWorkshopCustomerPayload
  ): Promise<WorkshopCustomerWithRelations> {
    return prisma.workshopCustomer.create({
      data: {
        workshopId,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        notes: payload.notes,
        devices: {
          create: {
            workshopId,
            ...payload.device,
          },
        },
      },
      include: customerRelations,
    });
  }

  static async update(
    workshopId: string,
    customerId: string,
    payload: UpdateWorkshopCustomerPayload
  ): Promise<WorkshopCustomerWithRelations | null> {
    const result = await prisma.workshopCustomer.updateMany({
      where: { id: customerId, workshopId },
      data: payload,
    });
    if (!result.count) return null;
    return this.findById(workshopId, customerId);
  }

  static async addDevice(
    workshopId: string,
    customerId: string,
    payload: MobileDevicePayload
  ): Promise<WorkshopCustomerWithRelations | null> {
    return prisma.$transaction(async (transaction) => {
      const customer = await transaction.workshopCustomer.findFirst({
        where: { id: customerId, workshopId },
        select: { id: true },
      });
      if (!customer) return null;
      await transaction.mobileDevice.create({
        data: {
          workshopId,
          customerId,
          ...payload,
        },
      });
      return transaction.workshopCustomer.findFirst({
        where: { id: customerId, workshopId },
        include: customerRelations,
      });
    });
  }
}
