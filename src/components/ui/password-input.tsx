"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { AUTH_TEXT } from "@/constants/auth.constant";

function PasswordInput(props: Omit<React.ComponentProps<"input">, "type">) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <InputGroup>
      <InputGroupInput type={isVisible ? "text" : "password"} {...props} />
      <InputGroupAddon>
        <InputGroupButton
          aria-label={isVisible ? AUTH_TEXT.hidePassword : AUTH_TEXT.showPassword}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((currentValue) => !currentValue)}
        >
          {isVisible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { PasswordInput };
