"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-transparent shadow-xs outline-none transition-[color,box-shadow] dark:bg-input/30",
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
        "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20",
        className
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  );
}

function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn("order-last flex items-center justify-center pr-1", className)}
      {...props}
    />
  );
}

function InputGroupButton({ className, type = "button", ...props }: React.ComponentProps<typeof Button>) {
  return <Button type={type} size="icon-sm" variant="ghost" className={cn("shadow-none", className)} {...props} />;
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput };
