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
      productId: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive(required),
      fromWarehouseId: optionalId,
      toWarehouseId: optionalId,
      quantity: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().min(1, required),
      reason: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      const needsFrom = values.type === "EXIT" || values.type === "TRANSFER";
      const needsTo = values.type === "ENTRY" || values.type === "TRANSFER";
      if (needsFrom && !values.fromWarehouseId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fromWarehouseId"], ...required });
      }
      if (needsTo && !values.toWarehouseId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["toWarehouseId"], ...required });
      }
      if (
        values.type === "TRANSFER" &&
        values.fromWarehouseId &&
        values.fromWarehouseId === values.toWarehouseId
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["toWarehouseId"],
          message: t("sameWarehouse"),
        });
      }
    });
};
