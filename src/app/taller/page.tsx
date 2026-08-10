import { redirect } from "next/navigation";
import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";

export default function LegacyWorkshopPage() {
  redirect(TECHNICIAN_ROUTES.workshop);
}
