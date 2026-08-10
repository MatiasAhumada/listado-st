import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TechnicianLoginForm } from "@/components/technician/TechnicianLoginForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TECHNICIAN_ROUTES, TECHNICIAN_TEXT } from "@/constants/technician.constant";
import { getTechnicianIdentity } from "@/server/guards/technician.guard";

export default async function TechnicianLoginPage() {
  const identity = await getTechnicianIdentity(await cookies());
  if (identity) redirect(TECHNICIAN_ROUTES.dashboard);

  return (
    <main className="technician-workspace-grid grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-foreground shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden min-h-[640px] overflow-hidden p-10 text-background lg:flex lg:flex-col lg:justify-between">
          <div className="safety-rule absolute inset-x-0 top-0 h-2" />
          <Badge variant="secondary" className="w-fit rounded-sm font-mono tracking-[0.14em]">
            {TECHNICIAN_TEXT.loginEyebrow}
          </Badge>
          <div className="max-w-xl">
            <p className="font-display text-7xl font-bold uppercase leading-[0.84]">
              {TECHNICIAN_TEXT.loginTitle}
            </p>
            <p className="mt-6 max-w-md text-lg text-background/60">
              {TECHNICIAN_TEXT.loginPromise}
            </p>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-background/45">
            {TECHNICIAN_TEXT.productName}
          </p>
        </section>

        <section className="flex items-center bg-card p-6 sm:p-10">
          <Card className="w-full border-0 bg-transparent shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="font-display text-4xl uppercase tracking-wide">
                {TECHNICIAN_TEXT.loginEyebrow}
              </CardTitle>
              <CardDescription>{TECHNICIAN_TEXT.loginDescription}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <TechnicianLoginForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
