"use client";

import { FormEvent, useState } from "react";
import { KeyRound, LoaderCircle, LogIn, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ACCESS_FIELDS, ACCESS_TEXT } from "@/constants/access.constant";
import { AUTH_SECURITY } from "@/constants/auth.constant";
import { loginAccess } from "@/services/access.service";
import { clientErrorHandler } from "@/utils/handlers/clientError.handler";

export function UnifiedLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const session = await loginAccess({ username, password });
      router.replace(session.destination);
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
          <FieldLabel htmlFor={ACCESS_FIELDS.username}>{ACCESS_TEXT.usernameLabel}</FieldLabel>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={ACCESS_FIELDS.username}
              className="pl-10"
              autoComplete="username"
              minLength={AUTH_SECURITY.minimumUsernameLength}
              maxLength={AUTH_SECURITY.maximumUsernameLength}
              value={username}
              required
              autoFocus
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor={ACCESS_FIELDS.password}>{ACCESS_TEXT.passwordLabel}</FieldLabel>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <PasswordInput
              id={ACCESS_FIELDS.password}
              className="pl-10"
              autoComplete="current-password"
              minLength={AUTH_SECURITY.minimumPasswordLength}
              maxLength={AUTH_SECURITY.maximumPasswordLength}
              value={password}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </Field>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <LogIn data-icon="inline-start" />
          )}
          {isSubmitting ? ACCESS_TEXT.loginPending : ACCESS_TEXT.loginAction}
        </Button>
      </FieldGroup>
    </form>
  );
}
