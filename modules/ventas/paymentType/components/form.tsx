/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormPaymentType } from "../scenes/formPaymentType";
import { validationPaymentType } from "../schemas/paymentType.schema";
import type {
  IPaymentType,
  IPaymentTypeCreateRequest,
  IPaymentTypeUpdateRequest,
} from "../models/paymentType.interface";
import {
  createPaymentTypeServerAction,
  updatePaymentTypeServerAction,
} from "@/app/[locale]/ventas/payment-types/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: IPaymentType) => ({
  name: values.name ?? "",
});

const useFeedback = (handleClose?: IFormAddProps["handleClose"]) => {
  const router = useRouter();
  const t = useTranslations("Administre.common");

  return {
    success: (title: string) =>
      Swal.fire({
        title,
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        willClose: () => {
          handleClose?.(true);
          router.refresh();
        },
      }),
    failure: (message?: string) =>
      Swal.fire({
        title: t("errorTitle"),
        text: message || t("unexpectedError"),
        icon: "error",
      }),
  };
};

export const RegisterPaymentType = ({
  handleClose,
}: IFormAddProps) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: IPaymentTypeCreateRequest) => {
    const result = await createPaymentTypeServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormPaymentType
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationPaymentType()}
    />
  );
};

export const UpdatePaymentType = ({
  initialValues,
  handleClose,
}: IFormUpdateProps<IPaymentType>) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationPaymentType();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<IPaymentTypeUpdateRequest, "id">) => {
    const result = await updatePaymentTypeServerAction({ ...values, id } as IPaymentTypeUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormPaymentType
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    />
  );
};
