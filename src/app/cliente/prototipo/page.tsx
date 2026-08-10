import { redirect } from "next/navigation";
import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";

export default function LegacyClientPrototypePage() {
  redirect(TECHNICIAN_ROUTES.prototype);
}
