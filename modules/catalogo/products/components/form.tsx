/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
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
import { statusOf } from "../models/product.interface";
import {
  createProductServerAction,
  updateProductServerAction,
} from "@/app/[locale]/catalogo/products/actions";

/**
 * El estado editorial manda; `available` se envía derivado para clientes y
 * pantallas que aún lo leen. Slug vacío => lo genera el backend.
 */
const toPayload = <T extends { status?: string; slug?: string }>(values: T) => ({
  ...values,
  available: values.status === "ACTIVE",
  slug: values.slug ? values.slug : undefined,
});

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
  supplier_id: "",
  brand_id: "",
  category_id: "",
  subcategory_id: "",
  stock: 0,
  real_price: 0,
  unit_price: 0,
  length: 0,
  width: 0,
  height: 0,
  weight: 0,
  image_url: "",
  status: "ACTIVE",
  slug: "",
  is_combo: "false",
  description: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: IProduct) => ({
  name: values.name ?? "",
  supplier_id: values.supplier_id != null ? String(values.supplier_id) : "",
  brand_id: values.brand_id != null ? String(values.brand_id) : "",
  category_id: values.category_id != null ? String(values.category_id) : "",
  subcategory_id: values.subcategory_id != null ? String(values.subcategory_id) : "",
  stock: values.stock ?? 0,
  real_price: values.real_price ?? 0,
  unit_price: values.unit_price ?? 0,
  length: values.length ?? 0,
  width: values.width ?? 0,
  height: values.height ?? 0,
  weight: values.weight ?? 0,
  image_url: values.image_url ?? "",
  status: statusOf(values),
  slug: values.slug ?? "",
  is_combo: String(Boolean(values.is_combo)),
  description: values.description ?? "",
});

const useFeedback = (handleClose?: IFormAddProps["handleClose"]) => {
  const router = useRouter();
  const t = useTranslations("Administre.common");

  return {
    success: (title: string, name?: string) => {
      notify.success(title, name);
      handleClose?.(true);
      router.refresh();
    },
    failure: (message?: string) => notify.error(t("errorTitle"), message || t("unexpectedError")),
  };
};

export const RegisterProduct = ({
  handleClose,
  options,
}: IFormAddProps & { options?: ProductFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: IProductCreateRequest) => {
    const result = await createProductServerAction(toPayload(values));
    if (result.success) {
      feedback.success(t("createdSuccess"), values.name);
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
    const result = await updateProductServerAction({ ...toPayload(values), id } as IProductUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"), values.name);
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
