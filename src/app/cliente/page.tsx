import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";
import { getTechnicianIdentity } from "@/server/guards/technician.guard";

export default async function ClientPage() {
  const identity = await getTechnicianIdentity(await cookies());
  if (!identity) redirect(TECHNICIAN_ROUTES.login);
  redirect(TECHNICIAN_ROUTES.workshop);
}
