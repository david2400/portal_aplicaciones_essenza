/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import { notify } from "@/components/notifications";
import { FormProductChild } from "../scenes/formProductChild";
import { validationProductChild, type ProductChildFormValues } from "../schemas/productChild.schema";
import type { INamedItem, IProductChild } from "../models/productChild.interface";
import {
  createProductChildServerAction,
  updateProductChildServerAction,
} from "@/app/[locale]/catalogo/variants/actions";

const toFormValues = (item?: IProductChild | null) => ({
  product_id: item?.product_id != null ? String(item.product_id) : "",
  name: item?.name ?? "",
  description: item?.description ?? "",
  stock: item?.stock ?? 0,
  unit_price: item?.unit_price ?? "",
  image_url: item?.image_url ?? "",
  available: String(item?.available ?? true),
});

/** Alta / edición de variante: avisa, cierra el modal y refresca la lista. */
export const ProductChildForm = ({
  item,
  products,
  defaultProductId,
  handleClose,
}: IFormAddProps & { item?: IProductChild | null; products: INamedItem[]; defaultProductId?: number }) => {
  const router = useRouter();
  const tCommon = useTranslations("Administre.common");
  const validationSchema = validationProductChild();

  const handleSubmit = async (values: ProductChildFormValues) => {
    const payload = {
      ...values,
      description: values.description || undefined,
      image_url: values.image_url || undefined,
    };
    const result =
      item?.id != null
        ? await updateProductChildServerAction({ ...payload, id: item.id })
        : await createProductChildServerAction(payload);

    if (result.success) {
      notify.success(item?.id != null ? tCommon("updatedSuccess") : tCommon("createdSuccess"), values.name);
      handleClose?.(true);
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  const initialValues = toFormValues(item);
  if (!item && defaultProductId != null) initialValues.product_id = String(defaultProductId);

  return (
    <FormProductChild
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      products={products}
    />
  );
};
