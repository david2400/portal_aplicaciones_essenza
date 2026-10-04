/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormSubcategory, type SubcategoryFormOptions } from "../scenes/formSubcategory";
import { validationSubcategory } from "../schemas/subcategory.schema";
import type {
  ISubcategory,
  ISubcategoryCreateRequest,
  ISubcategoryUpdateRequest,
} from "../models/subcategory.interface";
import {
  createSubcategoryServerAction,
  updateSubcategoryServerAction,
} from "@/app/[locale]/catalogo/subcategory/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
  categoryId: "",
  slug: "",
  description: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: ISubcategory) => ({
  name: values.name ?? "",
  categoryId: values.categoryId != null ? String(values.categoryId) : "",
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

export const RegisterSubcategory = ({
  handleClose,
  options,
}: IFormAddProps & { options?: SubcategoryFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: ISubcategoryCreateRequest) => {
    const result = await createSubcategoryServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormSubcategory
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationSubcategory()}
      options={options}
    />
  );
};

export const UpdateSubcategory = ({
  initialValues,
  handleClose,
  options,
}: IFormUpdateProps<ISubcategory> & { options?: SubcategoryFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationSubcategory();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<ISubcategoryUpdateRequest, "id">) => {
    const result = await updateSubcategoryServerAction({ ...values, id } as ISubcategoryUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormSubcategory
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      options={options}
    />
  );
};
