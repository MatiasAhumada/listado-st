import httpStatus from "http-status";
import { TECHNICIAN_TEXT } from "@/constants/technician.constant";
import {
  TechnicianIdentity,
  TechnicianWorkspaceSummary,
} from "@/interfaces/technician.interface";
import {
  TechnicianWorkspacePersistence,
  TechnicianWorkspaceReader,
} from "@/interfaces/technicianPersistence.interface";
import { ownsTechnicianWorkspace } from "@/server/domain/technicianAccess.domain";
import { TechnicianWorkspaceRepository } from "@/server/repositories/technicianWorkspace.repository";
import { ApiError } from "@/utils/handlers/apiError.handler";

export class TechnicianWorkspaceService {
  constructor(
    private readonly repository: TechnicianWorkspaceReader = TechnicianWorkspaceRepository
  ) {}

  async getWorkspace(identity: TechnicianIdentity): Promise<TechnicianWorkspaceSummary> {
    const workspace = await this.repository.findForIdentity({
      technicianId: identity.id,
      workshopId: identity.workshopId,
    });

    if (!workspace || !ownsTechnicianWorkspace(identity, workspace)) {
      throw new ApiError({
        status: httpStatus.NOT_FOUND,
        message: TECHNICIAN_TEXT.workspaceNotFound,
      });
    }

    return this.toSummary(workspace);
  }

  private toSummary(workspace: TechnicianWorkspacePersistence): TechnicianWorkspaceSummary {
    const technician = workspace.technicians[0];
    if (!technician || !workspace.subscription) {
      throw new ApiError({ message: TECHNICIAN_TEXT.internalError, isOperational: false });
    }

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      status: workspace.status,
      planCode: workspace.subscription.planCode,
      subscriptionStatus: workspace.subscription.status,
      technician,
    };
  }
}

export const technicianWorkspaceService = new TechnicianWorkspaceService();
