export interface PrototypeCatalogItem {
  id: string;
  description: string;
  compatibleModels: string[];
  referenceCost: number;
  quality: string;
  frameIncluded: boolean;
}

export interface PrototypeQuoteAlternative {
  id: string;
  catalogItemId: string;
  description: string;
  supplier: string;
  referenceCost: number;
  selectedCost: number;
  suggestedPrice: number;
  finalPrice: number;
}

export type PrototypeQuoteStage = "DRAFT" | "SENT" | "ACCEPTED";
