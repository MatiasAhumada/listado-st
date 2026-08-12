import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { UnifiedLoginForm } from "@/components/auth/UnifiedLoginForm";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ACCESS_TEXT } from "@/constants/access.constant";
import { PLATFORM_ADMIN_ROUTES } from "@/constants/platformAdmin.constant";
import { TECHNICIAN_ROUTES } from "@/constants/technician.constant";
import { getPlatformAdminIdentity } from "@/server/guards/platformAdmin.guard";
import { getTechnicianIdentity } from "@/server/guards/technician.guard";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const [adminIdentity, clientIdentity] = await Promise.all([
    getPlatformAdminIdentity(cookieStore),
    getTechnicianIdentity(cookieStore),
  ]);

  if (adminIdentity) redirect(PLATFORM_ADMIN_ROUTES.dashboard);
  if (clientIdentity) redirect(TECHNICIAN_ROUTES.dashboard);

  return (
    <main className="access-grid grid min-h-screen place-items-center bg-background px-4 py-8 sm:px-6">
      <div className="page-enter grid w-full max-w-6xl overflow-hidden rounded-3xl border border-primary/20 bg-inverse shadow-2xl shadow-primary/10 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden min-h-[680px] overflow-hidden p-10 text-inverse-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="green-rule absolute inset-x-0 top-0 h-2" />
          <div className="absolute -right-24 top-20 size-80 rounded-full border border-secondary/20" />
          <div className="absolute -right-8 top-36 size-56 rounded-full border border-secondary/15" />
          <Badge variant="secondary" className="w-fit rounded-sm font-mono tracking-[0.14em]">
            <ShieldCheck />
            {ACCESS_TEXT.eyebrow}
          </Badge>
          <div className="relative max-w-xl">
            <Sparkles className="mb-6 text-secondary" />
            <p className="font-display text-7xl font-bold uppercase leading-[0.86] tracking-tight">
              {ACCESS_TEXT.title}
            </p>
            <p className="mt-7 max-w-md text-lg text-inverse-foreground/60">
              {ACCESS_TEXT.description}
            </p>
            <div className="mt-10 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-secondary">
              <span>{ACCESS_TEXT.adminFlowLabel}</span>
              <ArrowRight />
              <span>{ACCESS_TEXT.plansFlowLabel}</span>
              <ArrowRight />
              <span>{ACCESS_TEXT.workshopsFlowLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-inverse-foreground/45">
            <KeyRound />
            <span>{ACCESS_TEXT.securityNote}</span>
          </div>
        </section>

        <section className="flex items-center bg-card p-6 sm:p-12">
          <Card className="w-full border-0 bg-transparent shadow-none">
            <CardHeader className="px-0">
              <Badge variant="outline" className="mb-2 w-fit lg:hidden">
                {ACCESS_TEXT.productName}
              </Badge>
              <CardTitle className="font-display text-4xl uppercase tracking-wide">
                {ACCESS_TEXT.formTitle}
              </CardTitle>
              <CardDescription>{ACCESS_TEXT.formDescription}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <UnifiedLoginForm />
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 shrink-0 text-primary" />
                <p>{ACCESS_TEXT.securityNote}</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
