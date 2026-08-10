"use client";

import { FormEvent, useState } from "react";
import { KeyRound, LoaderCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  TECHNICIAN_FIELDS,
  TECHNICIAN_ROUTES,
  TECHNICIAN_SECURITY,
  TECHNICIAN_TEXT,
} from "@/constants/technician.constant";
import { loginTechnician } from "@/services/technician.service";
import { clientErrorHandler } from "@/utils/handlers/clientError.handler";

export function TechnicianLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await loginTechnician({ email, password });
      router.replace(TECHNICIAN_ROUTES.dashboard);
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
          <FieldLabel htmlFor={TECHNICIAN_FIELDS.loginEmail}>
            {TECHNICIAN_TEXT.emailLabel}
          </FieldLabel>
          <Input
            id={TECHNICIAN_FIELDS.loginEmail}
            type="email"
            autoComplete="email"
            maxLength={TECHNICIAN_SECURITY.maximumEmailLength}
            value={email}
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={TECHNICIAN_FIELDS.loginPassword}>
            {TECHNICIAN_TEXT.passwordLabel}
          </FieldLabel>
          <Input
            id={TECHNICIAN_FIELDS.loginPassword}
            type="password"
            autoComplete="current-password"
            minLength={TECHNICIAN_SECURITY.minimumPasswordLength}
            maxLength={TECHNICIAN_SECURITY.maximumPasswordLength}
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
          {isSubmitting ? TECHNICIAN_TEXT.loginPending : TECHNICIAN_TEXT.loginAction}
        </Button>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <KeyRound />
          <span>{TECHNICIAN_TEXT.loginEyebrow}</span>
        </div>
      </FieldGroup>
    </form>
  );
}
