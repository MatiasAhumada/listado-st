import { Prisma } from "@prisma/client";
import gastosAxios from "@/utils/gastosAxios.util";
import { GASTOS_INCOME_SOURCE_NAME } from "@/constants/gastosIntegration.constant";

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

interface GastosIncomeSource {
  id: string;
  name: string;
}

let cachedIncomeSourceId: string | null = null;

async function resolveIncomeSourceId(): Promise<string> {
  if (cachedIncomeSourceId) return cachedIncomeSourceId;

  const response = await gastosAxios.get<GastosIncomeSource[]>("/income-sources");
  const source = response.data.find((s) => s.name === GASTOS_INCOME_SOURCE_NAME);

  if (!source) throw new Error(`Income source "${GASTOS_INCOME_SOURCE_NAME}" not found in gastos app`);

  cachedIncomeSourceId = source.id;
  return cachedIncomeSourceId;
}

export const gastosIntegrationService = {
  async registerTechIncome(order: ServiceOrderForIntegration): Promise<void> {
    const incomeSourceId = await resolveIncomeSourceId();

    await gastosAxios.post("/incomes", {
      amount: order.totalTechMargin,
      date: new Date().toISOString(),
      incomeSourceId,
      description: order.clientName,
    });
  },
};
