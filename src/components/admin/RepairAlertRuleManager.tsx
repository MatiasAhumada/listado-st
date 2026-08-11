"use client";

import { useState } from "react";
import { BellRing, LoaderCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { REPAIR_LIMITS, REPAIR_STATUS_LABELS, REPAIR_TEXT } from "@/constants/repairOperations.constant";
import { RepairAlertRuleSummary } from "@/interfaces/repairOperations.interface";
import { updatePlatformRepairAlertRules } from "@/services/repair.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";

interface RepairAlertRuleManagerProps {
  initialRules: RepairAlertRuleSummary[];
}

const terminalStatuses = new Set(["DELIVERED", "CANCELLED"]);

export function RepairAlertRuleManager({ initialRules }: RepairAlertRuleManagerProps) {
  const [rules, setRules] = useState(initialRules);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const savedRules = await updatePlatformRepairAlertRules({
        rules: rules.map((rule) => ({
          status: rule.status,
          afterHours: rule.afterHours,
          isEnabled: terminalStatuses.has(rule.status) ? false : rule.isEnabled,
        })),
      });
      setRules(savedRules);
      clientSuccessHandler(REPAIR_TEXT.alertRulesSaved);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-foreground/15 bg-card/95 shadow-lg">
      <CardHeader>
        <CardTitle className="font-display text-3xl uppercase tracking-wide">{REPAIR_TEXT.alertRulesTitle}</CardTitle>
        <CardDescription>{REPAIR_TEXT.alertRulesDescription}</CardDescription>
        <CardAction>
          <BellRing />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          {rules.map((rule) => {
            const isTerminal = terminalStatuses.has(rule.status);
            return (
              <Card key={rule.id} className="gap-4 py-4 shadow-none">
                <CardHeader>
                  <CardTitle>{REPAIR_STATUS_LABELS[rule.status]}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <Field>
                    <FieldLabel htmlFor={`repair-alert-hours-${rule.status}`}>
                      {REPAIR_TEXT.alertAfterHoursLabel}
                    </FieldLabel>
                    <Input
                      id={`repair-alert-hours-${rule.status}`}
                      type="number"
                      min={REPAIR_LIMITS.minimumAlertHours}
                      max={REPAIR_LIMITS.maximumAlertHours}
                      value={rule.afterHours}
                      disabled={isTerminal}
                      onChange={(event) =>
                        setRules((currentRules) =>
                          currentRules.map((currentRule) =>
                            currentRule.id === rule.id
                              ? { ...currentRule, afterHours: Number(event.target.value) }
                              : currentRule
                          )
                        )
                      }
                    />
                  </Field>
                  <Field orientation="horizontal" className="h-9 items-center">
                    <Checkbox
                      id={`repair-alert-enabled-${rule.status}`}
                      checked={!isTerminal && rule.isEnabled}
                      disabled={isTerminal}
                      onCheckedChange={(checked) =>
                        setRules((currentRules) =>
                          currentRules.map((currentRule) =>
                            currentRule.id === rule.id ? { ...currentRule, isEnabled: checked === true } : currentRule
                          )
                        )
                      }
                    />
                    <FieldLabel htmlFor={`repair-alert-enabled-${rule.status}`}>
                      {REPAIR_TEXT.alertEnabledLabel}
                    </FieldLabel>
                  </Field>
                </CardContent>
              </Card>
            );
          })}
        </FieldGroup>
        <Button size="lg" disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          {isSubmitting ? REPAIR_TEXT.savingAlertRulesAction : REPAIR_TEXT.saveAlertRulesAction}
        </Button>
      </CardContent>
    </Card>
  );
}
