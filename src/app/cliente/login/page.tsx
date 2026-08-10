import { redirect } from "next/navigation";
import { ACCESS_ROUTES } from "@/constants/access.constant";

export default function LegacyClientLoginPage() {
  redirect(ACCESS_ROUTES.login);
}
