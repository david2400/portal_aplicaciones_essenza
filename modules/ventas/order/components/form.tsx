/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import { FormOrderItem } from "../scenes/formOrderItem";
import { validationOrderItem } from "../schemas/order.schema";
import type { IOrderItem } from "../models/order.interface";
import { createOrderItemServerAction, updateOrderItemServerAction } from "@/app/[locale]/ventas/orders/actions";

const useFeedback = (handleClose?: IFormAddProps["handleClose"]) => {
  const router = useRouter();
  const t = useTranslations("Administre.common");

  return {
    done: async (result: { success: boolean; error?: string }, title: string) => {
      if (result.success) {
        notify.success(title);
        handleClose?.(true);
        router.refresh();
      } else {
        notify.error(t("errorTitle"), result.error || t("unexpectedError"));
      }
    },
  };
};

type ItemFormValues = { sku_id: number; quantity: number; discount: number };

export const OrderItemForm = ({
  orderId,
  item,
  handleClose,
}: IFormAddProps & { orderId: number; item?: IOrderItem | null }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationOrderItem();

  const handleSubmit = async (values: ItemFormValues) => {
    // El backend congela el precio del SKU y calcula subtotal, total y el total de la orden.
    const payload = { order_id: orderId, sku_id: values.sku_id, quantity: values.quantity, discount: values.discount };

    const result =
      item?.id != null
        ? await updateOrderItemServerAction({ ...payload, id: item.id })
        : await createOrderItemServerAction(payload);
    await feedback.done(result, item?.id != null ? t("updatedSuccess") : t("createdSuccess"));
  };

  return (
    <FormOrderItem
      initialValues={{
        sku_id: item?.sku_id != null ? String(item.sku_id) : "",
        quantity: item?.quantity ?? 1,
        discount: item?.discount ?? 0,
      }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      frozen={item ?? null}
    />
  );
};
