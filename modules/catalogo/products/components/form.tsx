/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import { useRef } from "react";
import { FormProduct, type ProductKind } from "../scenes/formProduct";
import { validationProduct } from "../schemas/product.schema";
import type {
  IProduct,
  IProductCreateRequest,
  IProductUpdateRequest,
} from "../models/product.interface";
import { statusOf, type ITaxRateOption } from "../models/product.interface";
import type { IUnit } from "@/shared/units/units";
import {
  createProductServerAction,
  updateProductServerAction,
} from "@/app/[locale]/catalogo/products/actions";

/**
 * El estado editorial manda; `available` se envía derivado para clientes y
 * pantallas que aún lo leen. Slug vacío => lo genera el backend.
 */
const toPayload = <
  T extends { status?: string; slug?: string; net_content?: unknown; net_content_unit_id?: unknown; tax_rate_id?: unknown },
>(
  values: T,
) => {
  const unit = values.net_content_unit_id;
  const hasUnit = unit != null && unit !== "" && unit !== "none";
  const hasValue = values.net_content != null && values.net_content !== "";
  return {
    ...values,
    available: values.status === "ACTIVE",
    slug: values.slug ? values.slug : undefined,
    // Contenido neto: valor y unidad juntos; vacío = sin contenido (lo quita al editar).
    net_content: hasUnit && hasValue ? Number(values.net_content) : undefined,
    net_content_unit_id: hasUnit && hasValue ? Number(unit) : undefined,
    // Vacío = tarifa por defecto al crear (al editar se conserva la actual).
    tax_rate_id:
      values.tax_rate_id != null && values.tax_rate_id !== "" && values.tax_rate_id !== "default" ? Number(values.tax_rate_id) : undefined,
  };
};

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
  status: "DRAFT",
  slug: "",
  is_combo: "false",
  description: "",
  net_content: "",
  net_content_unit_id: "none",
  tax_rate_id: "default",
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
  net_content: values.net_content ?? "",
  net_content_unit_id: values.net_content_unit_id != null ? String(values.net_content_unit_id) : "none",
  tax_rate_id: values.tax_rate_id != null ? String(values.tax_rate_id) : "default",
});

export const RegisterProduct = ({
  handleClose,
  onCreated,
  units,
  taxRates,
}: IFormAddProps & { onCreated?: (id: number, kind: ProductKind) => void; units?: IUnit[]; taxRates?: ITaxRateOption[] }) => {
  const t = useTranslations("Administre.common");
  const tEditor = useTranslations("Administre.productEditor");
  const router = useRouter();
  const kind = useRef<ProductKind>("SIMPLE");

  const handleSubmit = async (values: IProductCreateRequest) => {
    const result = await createProductServerAction(toPayload(values));
    if (result.success) {
      notify.success(t("createdSuccess"), values.name);
      handleClose?.(true);
      // Tras crear, se continúa en el editor (variantes, ficha técnica, imágenes…).
      if (result.data?.id != null) onCreated?.(result.data.id, kind.current);
      else router.refresh();
    } else {
      notify.error(t("errorTitle"), result.error || t("unexpectedError"));
    }
  };

  return (
    <FormProduct
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationProduct()}
      submitLabel={tEditor("createAndContinue")}
      units={units}
      taxRates={taxRates}
      cancelHref='/catalogo/products'
      mode='create'
      onKindChange={(next) => {
        kind.current = next;
      }}
    />
  );
};

/** Pestaña "General" del editor: guarda y refresca la página (sin modal). */
export const UpdateProduct = ({
  product,
  units,
  taxRates,
}: {
  product: IProduct;
  units?: IUnit[];
  taxRates?: ITaxRateOption[];
}) => {
  const t = useTranslations("Administre.common");
  const router = useRouter();
  const validationSchema = validationProduct();
  const id = product.id;

  if (id == null) {
    return null;
  }

  const handleSubmit = async (values: Omit<IProductUpdateRequest, "id">) => {
    const result = await updateProductServerAction({ ...toPayload(values), id } as IProductUpdateRequest);
    if (result.success) {
      notify.success(t("updatedSuccess"), values.name);
      router.refresh();
    } else {
      notify.error(t("errorTitle"), result.error || t("unexpectedError"));
    }
  };

  return (
    <FormProduct
      initialValues={toFormValues(product)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      cancelHref='/catalogo/products'
      stockLocked={product.product_type === "VARIANT"}
      units={units}
      taxRates={taxRates}
      mode='edit'
      productType={product.product_type}
    />
  );
};
