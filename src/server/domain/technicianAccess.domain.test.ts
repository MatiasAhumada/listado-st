import assert from "node:assert/strict";
import test from "node:test";
import {
  PlanCode,
  SubscriptionStatus,
  TechnicianRole,
  TechnicianStatus,
  WorkshopStatus,
} from "@prisma/client";
import httpStatus from "http-status";
import { TECHNICIAN_TEST_TEXT } from "@/constants/technicianTest.constant";
import { TechnicianIdentity } from "@/interfaces/technician.interface";
import { TechnicianWorkspacePersistence } from "@/interfaces/technicianPersistence.interface";
import {
  hasTechnicianAccess,
  ownsTechnicianWorkspace,
} from "@/server/domain/technicianAccess.domain";
import { TechnicianWorkspaceService } from "@/server/service/technicianWorkspace.service";
import { ApiError } from "@/utils/handlers/apiError.handler";

const technicianIdentity: TechnicianIdentity = {
  id: "technician-a",
  workshopId: "workshop-a",
  email: "matias@example.com",
  displayName: "Matías",
  role: "OWNER",
  workshopName: "Taller A",
  workshopSlug: "taller-a",
  planCode: "SOLO_TECHNICIAN",
  subscriptionStatus: "ACTIVE",
};

function buildWorkspace(
  workshopId: string,
  technicianId: string
): TechnicianWorkspacePersistence {
  return {
    id: workshopId,
    name: workshopId,
    slug: workshopId,
    status: WorkshopStatus.ACTIVE,
    subscription: {
      planCode: PlanCode.SOLO_TECHNICIAN,
      status: SubscriptionStatus.ACTIVE,
    },
    technicians: [
      {
        id: technicianId,
        displayName: technicianId,
        email: `${technicianId}@example.com`,
        role: TechnicianRole.OWNER,
        status: TechnicianStatus.ACTIVE,
      },
    ],
  };
}

test(TECHNICIAN_TEST_TEXT.activeAccess, () => {
  assert.equal(
    hasTechnicianAccess({
      technicianStatus: "ACTIVE",
      workshopStatus: "ACTIVE",
      subscriptionStatus: "TRIAL",
    }),
    true
  );
});

test(TECHNICIAN_TEST_TEXT.suspendedAccess, () => {
  assert.equal(
    hasTechnicianAccess({
      technicianStatus: "ACTIVE",
      workshopStatus: "SUSPENDED",
      subscriptionStatus: "ACTIVE",
    }),
    false
  );
});

test(TECHNICIAN_TEST_TEXT.ownWorkshop, () => {
  assert.equal(
    ownsTechnicianWorkspace(technicianIdentity, buildWorkspace("workshop-a", "technician-a")),
    true
  );
});

test(TECHNICIAN_TEST_TEXT.foreignWorkshop, () => {
  assert.equal(
    ownsTechnicianWorkspace(technicianIdentity, buildWorkspace("workshop-b", "technician-b")),
    false
  );
});

test(TECHNICIAN_TEST_TEXT.privateWorkspace, async () => {
  const service = new TechnicianWorkspaceService({
    async findForIdentity(lookup) {
      assert.deepEqual(lookup, {
        technicianId: technicianIdentity.id,
        workshopId: technicianIdentity.workshopId,
      });
      return buildWorkspace("workshop-a", "technician-a");
    },
  });

  const workspace = await service.getWorkspace(technicianIdentity);
  assert.equal(workspace.id, technicianIdentity.workshopId);
});

test(TECHNICIAN_TEST_TEXT.foreignPrivateWorkspace, async () => {
  const service = new TechnicianWorkspaceService({
    async findForIdentity() {
      return buildWorkspace("workshop-b", "technician-b");
    },
  });

  await assert.rejects(
    () => service.getWorkspace(technicianIdentity),
    (error) => error instanceof ApiError && error.status === httpStatus.NOT_FOUND
  );
});
