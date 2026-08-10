"use client";

import { FormEvent, useState } from "react";
import { KeyRound, LoaderCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  PLATFORM_ADMIN_FIELDS,
  PLATFORM_ADMIN_ROUTES,
  PLATFORM_ADMIN_SECURITY,
  PLATFORM_ADMIN_TEXT,
} from "@/constants/platformAdmin.constant";
import { loginPlatformAdmin } from "@/services/platformAdmin.service";
import { clientErrorHandler } from "@/utils/handlers/clientError.handler";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await loginPlatformAdmin({ email, password });
      router.replace(PLATFORM_ADMIN_ROUTES.dashboard);
      router.refresh();
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.loginEmail}>
            {PLATFORM_ADMIN_TEXT.emailLabel}
          </FieldLabel>
          <Input
            id={PLATFORM_ADMIN_FIELDS.loginEmail}
            type="email"
            autoComplete="email"
            maxLength={PLATFORM_ADMIN_SECURITY.maximumEmailLength}
            value={email}
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.loginPassword}>
            {PLATFORM_ADMIN_TEXT.passwordLabel}
          </FieldLabel>
          <Input
            id={PLATFORM_ADMIN_FIELDS.loginPassword}
            type="password"
            autoComplete="current-password"
            minLength={PLATFORM_ADMIN_SECURITY.minimumPasswordLength}
            maxLength={PLATFORM_ADMIN_SECURITY.maximumPasswordLength}
            value={password}
            required
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <LogIn data-icon="inline-start" />
          )}
          {isSubmitting ? PLATFORM_ADMIN_TEXT.loginPending : PLATFORM_ADMIN_TEXT.loginAction}
        </Button>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <KeyRound />
          <span>{PLATFORM_ADMIN_TEXT.consoleEyebrow}</span>
        </div>
      </FieldGroup>
    </form>
  );
}
