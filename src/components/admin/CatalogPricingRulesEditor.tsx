"use client";

import { useState } from "react";
import { LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Separator } from "@/components/ui/separator";
import { CATALOG_DEFAULTS, CATALOG_FIELDS, CATALOG_LIMITS, CATALOG_TEXT } from "@/constants/catalog.constant";
import { CatalogAdminDashboard, CatalogPricingRuleInput } from "@/interfaces/catalog.interface";
import { replacePlatformCatalogPricingRules } from "@/services/platformAdmin.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";

interface CatalogPricingRulesEditorProps {
  initialRules: CatalogPricingRuleInput[];
  onUpdated: (dashboard: CatalogAdminDashboard) => void;
}

export function CatalogPricingRulesEditor({ initialRules, onUpdated }: CatalogPricingRulesEditorProps) {
  const [rules, setRules] = useState<CatalogPricingRuleInput[]>(initialRules);
  const [isSaving, setIsSaving] = useState(false);

  const updateMaximumCost = (position: number, maximumCost: number) => {
    setRules((currentRules) =>
      currentRules.map((rule, rulePosition) => (rulePosition === position ? { ...rule, maximumCost } : rule))
    );
  };

  const updateMarkup = (position: number, markupPercentage: number) => {
    setRules((currentRules) =>
      currentRules.map((rule, rulePosition) => (rulePosition === position ? { ...rule, markupPercentage } : rule))
    );
  };

  const addRule = () => {
    setRules((currentRules) => {
      const finalRule = currentRules.at(-1) ?? CATALOG_DEFAULTS.rules[0];
      const previousMaximum = currentRules.at(-2)?.maximumCost ?? CATALOG_DEFAULTS.emptyMetric;
      const newRule = {
        maximumCost: previousMaximum + CATALOG_LIMITS.defaultNewMaximumCost,
        markupPercentage: finalRule.markupPercentage,
      };
      return [...currentRules.slice(0, -1), newRule, finalRule];
    });
  };

  const removeRule = (position: number) => {
    setRules((currentRules) => currentRules.filter((_, rulePosition) => rulePosition !== position));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dashboard = await replacePlatformCatalogPricingRules({ rules });
      setRules(dashboard.pricingRules);
      onUpdated(dashboard);
      clientSuccessHandler(CATALOG_TEXT.pricingSaved);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FieldGroup>
      {rules.map((rule, position) => {
        const isFinalRule = position === rules.length - 1;
        const maximumFieldId = `${CATALOG_FIELDS.pricingMaximumPrefix}-${position}`;
        const markupFieldId = `${CATALOG_FIELDS.pricingMarkupPrefix}-${position}`;
        return (
          <Field key={maximumFieldId}>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)_auto] sm:items-end">
              <Field>
                <FieldLabel htmlFor={maximumFieldId}>{CATALOG_TEXT.maximumCostLabel}</FieldLabel>
                {isFinalRule ? (
                  <Input id={maximumFieldId} value={CATALOG_TEXT.unlimitedCostLabel} disabled />
                ) : (
                  <MoneyInput
                    id={maximumFieldId}
                    value={rule.maximumCost ?? CATALOG_DEFAULTS.emptyMetric}
                    required
                    onValueChange={(value) => updateMaximumCost(position, Number(value))}
                  />
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor={markupFieldId}>{CATALOG_TEXT.markupLabel}</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id={markupFieldId}
                    type="number"
                    min={CATALOG_LIMITS.minimumMarkupPercentage}
                    max={CATALOG_LIMITS.maximumMarkupPercentage}
                    step={CATALOG_LIMITS.percentageInputStep}
                    value={rule.markupPercentage}
                    required
                    onChange={(event) => updateMarkup(position, Number(event.target.value))}
                  />
                  <span className="font-mono text-sm text-muted-foreground">{CATALOG_TEXT.percentageSuffix}</span>
                </div>
              </Field>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={CATALOG_TEXT.removeRuleAction}
                disabled={isFinalRule}
                onClick={() => removeRule(position)}
              >
                <Trash2 />
              </Button>
            </div>
            {!isFinalRule ? <Separator /> : null}
          </Field>
        );
      })}
      <FieldDescription>{CATALOG_TEXT.pricingDescription}</FieldDescription>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={rules.length >= CATALOG_LIMITS.maximumRules || isSaving}
          onClick={addRule}
        >
          <Plus data-icon="inline-start" />
          {CATALOG_TEXT.addRuleAction}
        </Button>
        <Button type="button" disabled={isSaving} onClick={handleSave}>
          {isSaving ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          {isSaving ? CATALOG_TEXT.savingRulesAction : CATALOG_TEXT.saveRulesAction}
        </Button>
      </div>
    </FieldGroup>
  );
}
