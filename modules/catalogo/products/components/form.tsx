/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormProduct, type ProductFormOptions } from "../scenes/formProduct";
import { validationProduct } from "../schemas/product.schema";
import type {
  IProduct,
  IProductCreateRequest,
  IProductUpdateRequest,
} from "../models/product.interface";
import {
  createProductServerAction,
  updateProductServerAction,
} from "@/app/[locale]/catalogo/products/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
  supplierId: "",
  brandId: "",
  categoryId: "",
  subcategoryId: "",
  stock: 0,
  realPrice: 0,
  unitPrice: 0,
  length: 0,
  width: 0,
  height: 0,
  weight: 0,
  imageUrl: "",
  available: "true",
  isCombo: "false",
  description: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: IProduct) => ({
  name: values.name ?? "",
  supplierId: values.supplierId != null ? String(values.supplierId) : "",
  brandId: values.brandId != null ? String(values.brandId) : "",
  categoryId: values.categoryId != null ? String(values.categoryId) : "",
  subcategoryId: values.subcategoryId != null ? String(values.subcategoryId) : "",
  stock: values.stock ?? 0,
  realPrice: values.realPrice ?? 0,
  unitPrice: values.unitPrice ?? 0,
  length: values.length ?? 0,
  width: values.width ?? 0,
  height: values.height ?? 0,
  weight: values.weight ?? 0,
  imageUrl: values.imageUrl ?? "",
  available: String(Boolean(values.available)),
  isCombo: String(Boolean(values.isCombo)),
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

export const RegisterProduct = ({
  handleClose,
  options,
}: IFormAddProps & { options?: ProductFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: IProductCreateRequest) => {
    const result = await createProductServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormProduct
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationProduct()}
      options={options}
    />
  );
};

export const UpdateProduct = ({
  initialValues,
  handleClose,
  options,
}: IFormUpdateProps<IProduct> & { options?: ProductFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationProduct();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<IProductUpdateRequest, "id">) => {
    const result = await updateProductServerAction({ ...values, id } as IProductUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormProduct
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      options={options}
    />
  );
};
