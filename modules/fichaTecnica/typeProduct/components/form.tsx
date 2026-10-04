/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormTypeProduct } from "../scenes/formTypeProduct";
import { validationTypeProduct } from "../schemas/typeProduct.schema";
import type {
  ITypeProduct,
  ITypeProductCreateRequest,
  ITypeProductUpdateRequest,
} from "../models/typeProduct.interface";
import {
  createTypeProductServerAction,
  updateTypeProductServerAction,
} from "@/app/[locale]/fichaTecnica/type-products/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: ITypeProduct) => ({
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

export const RegisterTypeProduct = ({
  handleClose,
}: IFormAddProps) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: ITypeProductCreateRequest) => {
    const result = await createTypeProductServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormTypeProduct
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationTypeProduct()}
    />
  );
};

export const UpdateTypeProduct = ({
  initialValues,
  handleClose,
}: IFormUpdateProps<ITypeProduct>) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationTypeProduct();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<ITypeProductUpdateRequest, "id">) => {
    const result = await updateTypeProductServerAction({ ...values, id } as ITypeProductUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormTypeProduct
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    />
  );
};
