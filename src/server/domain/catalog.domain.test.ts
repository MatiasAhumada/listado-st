import assert from "node:assert/strict";
import test from "node:test";
import {
  CATALOG_ROW_STATUS,
} from "@/constants/catalog.constant";
import {
  CATALOG_TEST_DATA,
  CATALOG_TEST_TEXT,
} from "@/constants/catalogTest.constant";
import { classifyCatalogSourceRow } from "@/server/domain/catalogImport.domain";
import {
  calculateCatalogSuggestedPrice,
  hasValidCatalogPricingOrder,
} from "@/server/domain/catalogPricing.domain";

const defaultRule = [
  {
    maximumCost: null,
    markupPercentage: CATALOG_TEST_DATA.defaultMarkup,
  },
];

const tieredRules = [
  {
    maximumCost: CATALOG_TEST_DATA.firstBandMaximum,
    markupPercentage: CATALOG_TEST_DATA.firstBandMarkup,
  },
  {
    maximumCost: null,
    markupPercentage: CATALOG_TEST_DATA.finalBandMarkup,
  },
];

test(CATALOG_TEST_TEXT.whiteAvailable, () => {
  assert.equal(
    classifyCatalogSourceRow({
      description: CATALOG_TEST_DATA.description,
      cost: CATALOG_TEST_DATA.cost,
      note: CATALOG_TEST_DATA.note,
      fillColor: CATALOG_TEST_DATA.whiteColor,
    }),
    CATALOG_ROW_STATUS.available
  );
});

test(CATALOG_TEST_TEXT.redUnavailable, () => {
  assert.equal(
    classifyCatalogSourceRow({
      description: CATALOG_TEST_DATA.description,
      cost: CATALOG_TEST_DATA.cost,
      note: CATALOG_TEST_DATA.note,
      fillColor: CATALOG_TEST_DATA.redColor,
    }),
    CATALOG_ROW_STATUS.unavailable
  );
});

test(CATALOG_TEST_TEXT.incomingNote, () => {
  assert.equal(
    classifyCatalogSourceRow({
      description: CATALOG_TEST_DATA.description,
      cost: CATALOG_TEST_DATA.cost,
      note: CATALOG_TEST_DATA.incomingNote,
      fillColor: CATALOG_TEST_DATA.whiteColor,
    }),
    CATALOG_ROW_STATUS.incoming
  );
});

test(CATALOG_TEST_TEXT.blueIncoming, () => {
  assert.equal(
    classifyCatalogSourceRow({
      description: CATALOG_TEST_DATA.description,
      cost: CATALOG_TEST_DATA.cost,
      note: CATALOG_TEST_DATA.note,
      fillColor: CATALOG_TEST_DATA.blueColor,
    }),
    CATALOG_ROW_STATUS.incoming
  );
});

test(CATALOG_TEST_TEXT.unsupportedColor, () => {
  assert.equal(
    classifyCatalogSourceRow({
      description: CATALOG_TEST_DATA.description,
      cost: CATALOG_TEST_DATA.cost,
      note: CATALOG_TEST_DATA.note,
      fillColor: CATALOG_TEST_DATA.yellowColor,
    }),
    CATALOG_ROW_STATUS.skipped
  );
});

test(CATALOG_TEST_TEXT.defaultSuggestion, () => {
  assert.equal(
    calculateCatalogSuggestedPrice(CATALOG_TEST_DATA.cost, defaultRule),
    CATALOG_TEST_DATA.firstBandMaximum
  );
});

test(CATALOG_TEST_TEXT.tieredSuggestion, () => {
  assert.equal(
    calculateCatalogSuggestedPrice(CATALOG_TEST_DATA.cost, tieredRules),
    CATALOG_TEST_DATA.firstBandSuggestion
  );
  assert.equal(
    calculateCatalogSuggestedPrice(CATALOG_TEST_DATA.expensiveCost, tieredRules),
    CATALOG_TEST_DATA.finalBandSuggestion
  );
});

test(CATALOG_TEST_TEXT.orderedRules, () => {
  assert.ok(hasValidCatalogPricingOrder(tieredRules));
});

test(CATALOG_TEST_TEXT.unorderedRules, () => {
  assert.ok(!hasValidCatalogPricingOrder([...tieredRules].reverse()));
});
