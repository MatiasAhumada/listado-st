import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { WORKSHOP_OPERATIONS_TEXT } from "@/constants/workshopOperations.constant";
import { TechnicianIdentity } from "@/interfaces/technician.interface";
import {
  CreateWorkshopCustomerPayload,
  MobileDeviceSummary,
  MobileDevicePayload,
  UpdateWorkshopCustomerPayload,
  WorkshopCustomerSummary,
} from "@/interfaces/workshopOperations.interface";
import {
  WorkshopCustomerRepository,
  WorkshopCustomerWithRelations,
} from "@/server/repositories/workshopCustomer.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";

export class WorkshopCustomerService {
  static async listCustomers(identity: TechnicianIdentity): Promise<WorkshopCustomerSummary[]> {
    const customers = await WorkshopCustomerRepository.findAll(identity.workshopId);
    return customers.map((customer) => this.toSummary(customer));
  }

  static async createCustomer(
    identity: TechnicianIdentity,
    payload: CreateWorkshopCustomerPayload
  ): Promise<WorkshopCustomerSummary> {
    try {
      return this.toSummary(await WorkshopCustomerRepository.create(identity.workshopId, payload));
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  static async updateCustomer(
    identity: TechnicianIdentity,
    customerId: string,
    payload: UpdateWorkshopCustomerPayload
  ): Promise<WorkshopCustomerSummary> {
    const customer = await WorkshopCustomerRepository.update(identity.workshopId, customerId, payload);
    if (!customer) {
      throw new ApiError({
        status: httpStatus.NOT_FOUND,
        message: WORKSHOP_OPERATIONS_TEXT.customerNotFound,
      });
    }
    return this.toSummary(customer);
  }

  static async addDevice(
    identity: TechnicianIdentity,
    customerId: string,
    payload: MobileDevicePayload
  ): Promise<WorkshopCustomerSummary> {
    try {
      const customer = await WorkshopCustomerRepository.addDevice(identity.workshopId, customerId, payload);
      if (!customer) {
        throw new ApiError({
          status: httpStatus.NOT_FOUND,
          message: WORKSHOP_OPERATIONS_TEXT.customerNotFound,
        });
      }
      return this.toSummary(customer);
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  private static toSummary(customer: WorkshopCustomerWithRelations): WorkshopCustomerSummary {
    return {
      id: customer.id,
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email,
      notes: customer.notes,
      devices: customer.devices.map(
        (device): MobileDeviceSummary => ({
          id: device.id,
          brand: device.brand,
          model: device.model,
          imei: device.imei,
          color: device.color,
          notes: device.notes,
          createdAt: device.createdAt.toISOString(),
        })
      ),
      quoteCount: customer._count.quotes,
      createdAt: customer.createdAt.toISOString(),
    };
  }

  private static handlePersistenceError(error: unknown): never {
    if (error instanceof ApiError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError({
        status: httpStatus.CONFLICT,
        message: WORKSHOP_OPERATIONS_TEXT.imeiAlreadyExists,
      });
    }
    throw error;
  }
}
