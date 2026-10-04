/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormCategory } from "../scenes/formCategory";
import { validationCategory } from "../schemas/category.schema";
import type {
  ICategory,
  ICategoryCreateRequest,
  ICategoryUpdateRequest,
} from "../models/category.interface";
import {
  createCategoryServerAction,
  updateCategoryServerAction,
} from "@/app/[locale]/catalogo/category/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
  slug: "",
  description: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: ICategory) => ({
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

export const RegisterCategory = ({
  handleClose,
}: IFormAddProps) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: ICategoryCreateRequest) => {
    const result = await createCategoryServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormCategory
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationCategory()}
    />
  );
};

export const UpdateCategory = ({
  initialValues,
  handleClose,
}: IFormUpdateProps<ICategory>) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationCategory();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<ICategoryUpdateRequest, "id">) => {
    const result = await updateCategoryServerAction({ ...values, id } as ICategoryUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormCategory
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    />
  );
};
