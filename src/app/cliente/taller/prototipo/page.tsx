import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { QuoteValidationPrototype } from "@/components/prototype/QuoteValidationPrototype";
import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";
import { getTechnicianIdentity } from "@/server/guards/technician.guard";

export default async function AuthenticatedQuotePrototypePage() {
  const identity = await getTechnicianIdentity(await cookies());
  if (!identity) redirect(TECHNICIAN_ROUTES.login);

  return <QuoteValidationPrototype />;
}
