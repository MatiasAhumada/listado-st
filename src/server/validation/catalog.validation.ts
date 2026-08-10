import { z } from "zod";
import {
  CATALOG_LIMITS,
  CATALOG_STATUS,
} from "@/constants/catalog.constant";

const catalogPricingRuleSchema = z.object({
  maximumCost: z
    .number()
    .min(CATALOG_LIMITS.minimumMaximumCost)
    .max(CATALOG_LIMITS.maximumCost)
    .nullable(),
  markupPercentage: z
    .number()
    .min(CATALOG_LIMITS.minimumMarkupPercentage)
    .max(CATALOG_LIMITS.maximumMarkupPercentage),
});

export const replaceCatalogPricingRulesSchema = z.object({
  rules: z
    .array(catalogPricingRuleSchema)
    .min(1)
    .max(CATALOG_LIMITS.maximumRules),
});

export const publishCatalogBatchSchema = z.object({
  status: z.literal(CATALOG_STATUS.published),
});

export const catalogSearchSchema = z.object({
  query: z.string().trim().max(CATALOG_LIMITS.maximumSearchLength),
});
