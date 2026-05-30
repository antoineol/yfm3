/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authHelper from "../authHelper.js";
import type * as deck from "../deck.js";
import type * as deckAggregate from "../deckAggregate.js";
import type * as diffHelpers from "../diffHelpers.js";
import type * as hand from "../hand.js";
import type * as importExport from "../importExport.js";
import type * as migrations from "../migrations.js";
import type * as modHelper from "../modHelper.js";
import type * as ownedCards from "../ownedCards.js";
import type * as userModSettings from "../userModSettings.js";
import type * as userSettings from "../userSettings.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authHelper: typeof authHelper;
  deck: typeof deck;
  deckAggregate: typeof deckAggregate;
  diffHelpers: typeof diffHelpers;
  hand: typeof hand;
  importExport: typeof importExport;
  migrations: typeof migrations;
  modHelper: typeof modHelper;
  ownedCards: typeof ownedCards;
  userModSettings: typeof userModSettings;
  userSettings: typeof userSettings;
  utils: typeof utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  deckAggregate: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"deckAggregate">;
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
};
