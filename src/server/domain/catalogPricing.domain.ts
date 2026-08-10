import { CATALOG_LIMITS } from "@/constants/catalog.constant";
import { CatalogPricingRuleInput } from "@/interfaces/catalog.interface";

export function hasValidCatalogPricingOrder(rules: CatalogPricingRuleInput[]): boolean {
  if (!rules.length || rules.length > CATALOG_LIMITS.maximumRules) return false;

  const finalRule = rules.at(-1);
  if (!finalRule || finalRule.maximumCost) return false;

  return rules.every((rule, position) => {
    const isFinalRule = position === rules.length - 1;
    if (isFinalRule) return !rule.maximumCost;
    if (!rule.maximumCost) return false;

    const previousMaximum = rules[position - 1]?.maximumCost;
    return !previousMaximum || rule.maximumCost > previousMaximum;
  });
}

export function calculateCatalogSuggestedPrice(
  cost: number,
  rules: CatalogPricingRuleInput[]
): number {
  const matchingRule = rules.find(
    (rule) => !rule.maximumCost || cost <= rule.maximumCost
  );
  if (!matchingRule) return cost;

  const multiplier =
    CATALOG_LIMITS.baseMultiplier +
    matchingRule.markupPercentage / CATALOG_LIMITS.percentageBase;
  return (
    Math.round(cost * multiplier * CATALOG_LIMITS.moneyPrecisionFactor) /
    CATALOG_LIMITS.moneyPrecisionFactor
  );
}
