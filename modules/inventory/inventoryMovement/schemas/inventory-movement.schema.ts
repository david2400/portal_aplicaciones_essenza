/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { MOVEMENT_TYPES } from "../models/inventory-movement.interface";

/**
 * Las bodegas requeridas dependen del tipo:
 * entrada → destino; salida → origen; traslado → ambas y distintas.
 */
export const validationInventoryMovement = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.inventoryMovement");
  const required = { message: intl("requiredField") };
  const optionalId = z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().positive().optional(),
  );

  return z
    .object({
      type: z.enum(MOVEMENT_TYPES, { errorMap: () => required }),
      // El SKU (producto simple o variante) se elige en el buscador; el producto sale del SKU.
      sku_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive(required),
      product_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive(required),
      from_warehouse_id: optionalId,
      to_warehouse_id: optionalId,
      quantity: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().min(1, required),
      reason: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      const needsFrom = values.type === "EXIT" || values.type === "TRANSFER";
      const needsTo = values.type === "ENTRY" || values.type === "TRANSFER";
      if (needsFrom && !values.from_warehouse_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["from_warehouse_id"], ...required });
      }
      if (needsTo && !values.to_warehouse_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["to_warehouse_id"], ...required });
      }
      if (
        values.type === "TRANSFER" &&
        values.from_warehouse_id &&
        values.from_warehouse_id === values.to_warehouse_id
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["to_warehouse_id"],
          message: t("sameWarehouse"),
        });
      }
    });
};
