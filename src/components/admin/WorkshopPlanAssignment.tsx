"use client";

import { useState } from "react";
import { LoaderCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { SAAS_PLAN_TEXT } from "@/constants/saasPlan.constant";
import { WorkshopSummary } from "@/interfaces/platformAdmin.interface";
import { SaasPlanSummary } from "@/interfaces/saasPlan.interface";
import { updatePlatformWorkshopPlan } from "@/services/platformAdmin.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";

interface WorkshopPlanAssignmentProps {
  workshop: WorkshopSummary;
  plans: SaasPlanSummary[];
  onUpdated: (workshop: WorkshopSummary) => void;
}

export function WorkshopPlanAssignment({ workshop, plans, onUpdated }: WorkshopPlanAssignmentProps) {
  const activePlans = plans.filter((plan) => plan.isActive);
  const [planId, setPlanId] = useState(workshop.plan.id);
  const [agreedPrice, setAgreedPrice] = useState(workshop.agreedPrice);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasCurrentOption = activePlans.some((plan) => plan.id === workshop.plan.id);

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      const updatedWorkshop = await updatePlatformWorkshopPlan(workshop.id, { planId, agreedPrice });
      onUpdated(updatedWorkshop);
      clientSuccessHandler(SAAS_PLAN_TEXT.assignmentSuccess);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-w-72 grid-cols-[minmax(8rem,1fr)_7rem_auto] items-center gap-2">
      <NativeSelect
        size="sm"
        value={planId}
        disabled={isSubmitting || !activePlans.length}
        aria-label={SAAS_PLAN_TEXT.planColumn}
        onChange={(event) => {
          const selectedPlan = activePlans.find((plan) => plan.id === event.target.value);
          setPlanId(event.target.value);
          if (selectedPlan) setAgreedPrice(selectedPlan.billingPrice);
        }}
      >
        {!hasCurrentOption ? (
          <NativeSelectOption value={workshop.plan.id} disabled>
            {workshop.plan.name}
          </NativeSelectOption>
        ) : null}
        {activePlans.map((plan) => (
          <NativeSelectOption key={plan.id} value={plan.id}>
            {plan.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <MoneyInput
        className="h-8"
        value={agreedPrice}
        disabled={isSubmitting}
        aria-label={SAAS_PLAN_TEXT.assignedPriceLabel}
        onValueChange={setAgreedPrice}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={isSubmitting || !planId || !agreedPrice || !activePlans.length}
        onClick={handleAssign}
      >
        {isSubmitting ? (
          <LoaderCircle data-icon="inline-start" className="animate-spin" />
        ) : (
          <RefreshCcw data-icon="inline-start" />
        )}
        {isSubmitting ? SAAS_PLAN_TEXT.assigningAction : SAAS_PLAN_TEXT.assignAction}
      </Button>
    </div>
  );
}
