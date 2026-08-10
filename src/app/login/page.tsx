import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { TechnicianLoginForm } from "@/components/technician/TechnicianLoginForm";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACCESS_TABS, ACCESS_TEXT } from "@/constants/access.constant";
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
    <main className="technician-workspace-grid grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl border bg-foreground shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[680px] overflow-hidden p-10 text-background lg:flex lg:flex-col lg:justify-between">
          <div className="safety-rule absolute inset-x-0 top-0 h-2" />
          <Badge variant="secondary" className="w-fit rounded-sm font-mono tracking-[0.14em]">
            <ShieldCheck />
            {ACCESS_TEXT.eyebrow}
          </Badge>
          <div className="max-w-xl">
            <p className="font-display text-7xl font-bold uppercase leading-[0.84]">
              {ACCESS_TEXT.title}
            </p>
            <p className="mt-7 max-w-md text-lg text-background/60">
              {ACCESS_TEXT.description}
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-background/45">
            <KeyRound />
            <span>{ACCESS_TEXT.securityNote}</span>
          </div>
        </section>

        <section className="flex items-center bg-card p-5 sm:p-10">
          <Card className="w-full border-0 bg-transparent shadow-none">
            <CardHeader className="px-0">
              <Badge variant="outline" className="mb-2 w-fit lg:hidden">
                {ACCESS_TEXT.productName}
              </Badge>
              <CardTitle className="font-display text-4xl uppercase tracking-wide">
                {ACCESS_TEXT.eyebrow}
              </CardTitle>
              <CardDescription>{ACCESS_TEXT.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Tabs defaultValue={ACCESS_TABS.client}>
                <TabsList className="grid w-full grid-cols-2" variant="line">
                  <TabsTrigger value={ACCESS_TABS.client}>{ACCESS_TEXT.clientTab}</TabsTrigger>
                  <TabsTrigger value={ACCESS_TABS.admin}>{ACCESS_TEXT.adminTab}</TabsTrigger>
                </TabsList>

                <TabsContent value={ACCESS_TABS.client} className="pt-7">
                  <div className="mb-5">
                    <h1 className="font-display text-3xl uppercase tracking-wide">
                      {ACCESS_TEXT.clientTitle}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ACCESS_TEXT.clientDescription}
                    </p>
                  </div>
                  <TechnicianLoginForm />
                </TabsContent>

                <TabsContent value={ACCESS_TABS.admin} className="pt-7">
                  <div className="mb-5">
                    <h1 className="font-display text-3xl uppercase tracking-wide">
                      {ACCESS_TEXT.adminTitle}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ACCESS_TEXT.adminDescription}
                    </p>
                  </div>
                  <AdminLoginForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
