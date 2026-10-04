/** @format */

import type {
  CalculateShippingCostParams,
  ShippingCostDto,
} from "@/server/domains/shipping_logistics/product_distribution/shipping-costs/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IShippingCost = ShippingCostDto;
export type IShippingCostCalculateRequest = CalculateShippingCostParams;

/** Transportadora disponible para cotizar. */
export interface IShippingCarrier {
  id?: number;
  name?: string;
  baseRate?: number;
  ratePerKm?: number;
  isActive?: boolean;
}
