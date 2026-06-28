import { Prisma } from "@prisma/client";

type ServiceOrderForIntegration = Prisma.ServiceOrderGetPayload<{
  include: {
    images: false;
    items: false;
    statusHistory: false;
    branch: false;
    client: false;
    company: false;
    seller: false;
  };
}>;

export const gastosIntegrationService = {
  async registerTechIncome(_order: ServiceOrderForIntegration): Promise<void> {
  },
};
