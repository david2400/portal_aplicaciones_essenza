/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormBrand } from "../scenes/formBrand";
import { validationBrand } from "../schemas/brand.schema";
import type {
  IBrand,
  IBrandCreateRequest,
  IBrandUpdateRequest,
} from "../models/brand.interface";
import {
  createBrandServerAction,
  updateBrandServerAction,
} from "@/app/[locale]/catalogo/brand/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
  slug: "",
  description: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: IBrand) => ({
  name: values.name ?? "",
  slug: values.slug ?? "",
  description: values.description ?? "",
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

export const RegisterBrand = ({
  handleClose,
}: IFormAddProps) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: IBrandCreateRequest) => {
    const result = await createBrandServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormBrand
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationBrand()}
    />
  );
};

export const UpdateBrand = ({
  initialValues,
  handleClose,
}: IFormUpdateProps<IBrand>) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationBrand();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<IBrandUpdateRequest, "id">) => {
    const result = await updateBrandServerAction({ ...values, id } as IBrandUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormBrand
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    />
  );
};
