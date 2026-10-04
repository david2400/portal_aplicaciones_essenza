/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormCombo, type ComboFormOptions } from "../scenes/formCombo";
import { validationCombo } from "../schemas/combo.schema";
import type {
  ICombo,
  IComboCreateRequest,
  IComboUpdateRequest,
} from "../models/combo.interface";
import {
  createComboServerAction,
  updateComboServerAction,
} from "@/app/[locale]/catalogo/combo/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  comboId: "",
  productId: "",
  quantity: 1,
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: ICombo) => ({
  comboId: values.comboId != null ? String(values.comboId) : "",
  productId: values.productId != null ? String(values.productId) : "",
  quantity: values.quantity ?? 0,
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

export const RegisterCombo = ({
  handleClose,
  options,
}: IFormAddProps & { options?: ComboFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: IComboCreateRequest) => {
    const result = await createComboServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormCombo
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationCombo()}
      options={options}
    />
  );
};

export const UpdateCombo = ({
  initialValues,
  handleClose,
  options,
}: IFormUpdateProps<ICombo> & { options?: ComboFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationCombo();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<IComboUpdateRequest, "id">) => {
    const result = await updateComboServerAction({ ...values, id } as IComboUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormCombo
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      options={options}
    />
  );
};
