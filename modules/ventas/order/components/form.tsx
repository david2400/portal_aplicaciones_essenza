/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import { FormOrder } from "../scenes/formOrder";
import { FormOrderItem, computeItemAmounts } from "../scenes/formOrderItem";
import { validationOrder, validationOrderItem } from "../schemas/order.schema";
import { isOrderState } from "../constants";
import type {
  IOrder,
  IOrderCreateRequest,
  IOrderItem,
  IOrderProduct,
} from "../models/order.interface";
import {
  createOrderServerAction,
  updateOrderServerAction,
  createOrderItemServerAction,
  updateOrderItemServerAction,
} from "@/app/[locale]/ventas/orders/actions";

const useFeedback = (handleClose?: IFormAddProps["handleClose"]) => {
  const router = useRouter();
  const t = useTranslations("Administre.common");

  return {
    done: async (result: { success: boolean; error?: string }, title: string) => {
      if (result.success) {
        await Swal.fire({ title, icon: "success", timer: 2000, showConfirmButton: false });
        handleClose?.(true);
        router.refresh();
      } else {
        Swal.fire({
          title: t("errorTitle"),
          text: result.error || t("unexpectedError"),
          icon: "error",
        });
      }
    },
  };
};

type OrderFormValues = { complementaryOrder?: string; total: number; state: string };

export const RegisterOrder = ({ handleClose }: IFormAddProps) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: OrderFormValues) => {
    const result = await createOrderServerAction(values as IOrderCreateRequest);
    await feedback.done(result, t("createdSuccess"));
  };

  return (
    <FormOrder
      initialValues={{ complementaryOrder: "", total: 0, state: "PENDING" }}
      onSubmit={handleSubmit}
      validationSchema={validationOrder()}
    />
  );
};

export const UpdateOrder = ({
  order,
  handleClose,
}: IFormAddProps & { order: IOrder | null }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationOrder();

  if (order?.id == null) return null;
  const id = order.id;

  const handleSubmit = async (values: OrderFormValues) => {
    const result = await updateOrderServerAction({ ...values, id });
    await feedback.done(result, t("updatedSuccess"));
  };

  return (
    <FormOrder
      initialValues={{
        complementaryOrder: order.complementaryOrder ?? "",
        total: order.total ?? 0,
        state: isOrderState(order.state) ? order.state : "PENDING",
      }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    />
  );
};

type ItemFormValues = { productId: number; quantity: number; discount: number };

export const OrderItemForm = ({
  orderId,
  item,
  products,
  handleClose,
}: IFormAddProps & { orderId: number; item?: IOrderItem | null; products: IOrderProduct[] }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationOrderItem();

  const handleSubmit = async (values: ItemFormValues) => {
    const product = products.find((p) => p.id === values.productId);
    const { subtotal, total } = computeItemAmounts(product, values.quantity, values.discount);
    const payload = { ...values, orderId, subtotal, total };

    const result =
      item?.id != null
        ? await updateOrderItemServerAction({ ...payload, id: item.id })
        : await createOrderItemServerAction(payload);
    await feedback.done(result, item?.id != null ? t("updatedSuccess") : t("createdSuccess"));
  };

  return (
    <FormOrderItem
      initialValues={{
        productId: item?.productId != null ? String(item.productId) : "",
        quantity: item?.quantity ?? 1,
        discount: item?.discount ?? 0,
      }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      products={products}
    />
  );
};
