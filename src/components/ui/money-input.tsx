"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatMoneyInputValue, parseMoneyInputValue } from "@/utils/moneyInput.util";

interface MoneyInputProps extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> {
  value: string | number;
  onValueChange: (value: string) => void;
}

function MoneyInput({ value, onValueChange, ...props }: MoneyInputProps) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      value={formatMoneyInputValue(value)}
      onChange={(event) => onValueChange(parseMoneyInputValue(event.target.value))}
      {...props}
    />
  );
}

export { MoneyInput };
