import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLATFORM_ADMIN_ROUTES, PLATFORM_ADMIN_TEXT } from "@/constants/platformAdmin.constant";
import { getPlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";

export default async function AdminLoginPage() {
  const identity = await getPlatformAdminIdentity(await cookies());
  if (identity) redirect(PLATFORM_ADMIN_ROUTES.dashboard);

  return (
    <main className="admin-console-grid grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-foreground shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden min-h-[640px] overflow-hidden p-10 text-background lg:flex lg:flex-col lg:justify-between">
          <div className="safety-rule absolute inset-x-0 top-0 h-2" />
          <Badge variant="secondary" className="w-fit rounded-sm font-mono tracking-[0.14em]">
            {PLATFORM_ADMIN_TEXT.consoleEyebrow}
          </Badge>
          <div className="max-w-xl">
            <p className="font-display text-7xl font-bold uppercase leading-[0.84]">
              {PLATFORM_ADMIN_TEXT.dashboardTitle}
            </p>
            <p className="mt-6 max-w-md text-lg text-background/60">
              {PLATFORM_ADMIN_TEXT.dashboardDescription}
            </p>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-background/45">
            {PLATFORM_ADMIN_TEXT.productName}
          </p>
        </section>

        <section className="flex items-center bg-card p-6 sm:p-10">
          <Card className="w-full border-0 bg-transparent shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="font-display text-4xl uppercase tracking-wide">
                {PLATFORM_ADMIN_TEXT.loginTitle}
              </CardTitle>
              <CardDescription>{PLATFORM_ADMIN_TEXT.loginDescription}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <AdminLoginForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
