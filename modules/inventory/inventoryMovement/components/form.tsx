/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import type { ISelectOption } from "@repo/ui/form/models";
import { FormInventoryMovement } from "../scenes/formInventoryMovement";
import { validationInventoryMovement } from "../schemas/inventory-movement.schema";
import type { IInventoryMovement, MovementType } from "../models/inventory-movement.interface";
import { registerMovementServerAction } from "@/app/[locale]/inventory/inventory-movements/actions";

type MovementFormValues = {
  type: MovementType;
  productId: number;
  fromWarehouseId?: number;
  toWarehouseId?: number;
  quantity: number;
  reason?: string;
};

export const RegisterInventoryMovement = ({
  handleClose,
  products,
  warehouses,
}: IFormAddProps & { products: ISelectOption[]; warehouses: ISelectOption[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.inventoryMovement");
  const tCommon = useTranslations("Administre.common");

  const handleSubmit = async (values: MovementFormValues) => {
    // Sólo se envían las bodegas que aplican al tipo de movimiento.
    const payload: IInventoryMovement = {
      type: values.type,
      productId: values.productId,
      quantity: values.quantity,
      reason: values.reason || undefined,
      fromWarehouseId: values.type === "ENTRY" ? undefined : values.fromWarehouseId,
      toWarehouseId: values.type === "EXIT" ? undefined : values.toWarehouseId,
    };

    const result = await registerMovementServerAction(payload);
    if (result.success) {
      await Swal.fire({ title: t("registered"), icon: "success", timer: 2000, showConfirmButton: false });
      handleClose?.(true);
      router.refresh();
    } else {
      Swal.fire({ title: tCommon("errorTitle"), text: result.error || tCommon("unexpectedError"), icon: "error" });
    }
  };

  return (
    <FormInventoryMovement
      initialValues={{
        type: "ENTRY",
        productId: "",
        fromWarehouseId: "",
        toWarehouseId: "",
        quantity: 1,
        reason: "",
      }}
      onSubmit={handleSubmit}
      validationSchema={validationInventoryMovement()}
      products={products}
      warehouses={warehouses}
    />
  );
};
