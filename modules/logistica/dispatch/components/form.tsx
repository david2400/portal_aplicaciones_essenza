/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import { FormDispatch } from "../scenes/formDispatch";
import { validationDispatch, type DispatchFormValues } from "../schemas/dispatch.schema";
import type { IDispatch, IDispatchOrder } from "../models/dispatch.interface";
import { todayIso } from "../constants";
import {
  createDispatchServerAction,
  updateDispatchServerAction,
} from "@/app/[locale]/logistica/dispatches/actions";

type Result = { success: true } | { success: false; error: string };

const useFeedback = (handleClose?: IFormAddProps["handleClose"]) => {
  const router = useRouter();
  const t = useTranslations("Administre.common");

  return (result: Result, successTitle: string) =>
    result.success
      ? Swal.fire({
          title: successTitle,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          willClose: () => {
            handleClose?.(true);
            router.refresh();
          },
        })
      : Swal.fire({ title: t("errorTitle"), text: result.error || t("unexpectedError"), icon: "error" });
};

const toFormValues = (dispatch?: IDispatch | null) => ({
  orderId: dispatch?.orderId != null ? String(dispatch.orderId) : "",
  guideNumber: dispatch?.guideNumber ?? "",
  address: dispatch?.address ?? "",
  departmentOrigin: dispatch?.departmentOrigin ?? "",
  cityOrigin: dispatch?.cityOrigin ?? "",
  departmentDestination: dispatch?.departmentDestination ?? "",
  cityDestination: dispatch?.cityDestination ?? "",
  estimatedDeliveryDate: dispatch?.estimatedDeliveryDate?.slice(0, 10) ?? todayIso(),
  realDeliveryDate: dispatch?.realDeliveryDate?.slice(0, 10) ?? todayIso(),
});

export const RegisterDispatch = ({
  handleClose,
  orders,
}: IFormAddProps & { orders: IDispatchOrder[] }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: DispatchFormValues) => {
    feedback(await createDispatchServerAction(values), t("createdSuccess"));
  };

  return (
    <FormDispatch
      initialValues={toFormValues()}
      onSubmit={handleSubmit}
      validationSchema={validationDispatch()}
      orders={orders}
    />
  );
};

export const UpdateDispatch = ({
  dispatch,
  handleClose,
  orders,
}: IFormAddProps & { dispatch: IDispatch; orders: IDispatchOrder[] }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationDispatch();

  if (dispatch.id == null) return null;
  const id = dispatch.id;

  const handleSubmit = async (values: DispatchFormValues) => {
    feedback(await updateDispatchServerAction({ ...values, id }), t("updatedSuccess"));
  };

  return (
    <FormDispatch
      initialValues={toFormValues(dispatch)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      orders={orders}
    />
  );
};
