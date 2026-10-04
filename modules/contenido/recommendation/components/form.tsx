/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import { FormRecommendation } from "../scenes/formRecommendation";
import {
  validationRecommendation,
  type RecommendationFormValues,
} from "../schemas/recommendation.schema";
import type { IRecommendation, IRecommendationProduct } from "../models/recommendation.interface";
import {
  createRecommendationServerAction,
  updateRecommendationServerAction,
} from "@/app/[locale]/contenido/recommendations/actions";

type Result = { success: true } | { success: false; error: string };

const toFormValues = (item?: IRecommendation | null) => ({
  customerId: item?.customerId ?? "",
  productId: item?.productId != null ? String(item.productId) : "",
  recommendationType: item?.recommendationType ?? "CROSS_SELL",
  context: item?.context ?? "PRODUCT_PAGE",
  score: item?.score ?? 0.5,
  position: item?.position ?? 1,
  reason: item?.reason ?? "",
  isClicked: String(Boolean(item?.isClicked)),
  isPurchased: String(Boolean(item?.isPurchased)),
});

/**
 * Formulario de creación/edición. Al guardar se copian nombre, precio e
 * imagen del producto elegido (el backend los guarda desnormalizados).
 */
export const RecommendationForm = ({
  item,
  products,
  handleClose,
}: IFormAddProps & { item?: IRecommendation | null; products: IRecommendationProduct[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.common");
  const validationSchema = validationRecommendation();
  const id = item?.id;

  const done = (result: Result, title: string) => {
    if (result.success) {
      notify.success(title);
      handleClose?.(true);
      router.refresh();
    } else {
      notify.error(t("errorTitle"), result.error || t("unexpectedError"));
    }
  };

  const handleSubmit = async (values: RecommendationFormValues) => {
    const product = products.find((p) => p.id === values.productId);
    const payload = {
      ...values,
      reason: values.reason?.trim() ?? "",
      productName: product?.name ?? item?.productName,
      productPrice: product?.unitPrice ?? item?.productPrice,
      productImageUrl: product?.imageUrl ?? item?.productImageUrl,
    };
    if (id != null) {
      done(await updateRecommendationServerAction({ ...payload, id }), t("updatedSuccess"));
    } else {
      done(await createRecommendationServerAction(payload), t("createdSuccess"));
    }
  };

  return (
    <FormRecommendation
      initialValues={toFormValues(item)}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      products={products}
      lockIdentity={id != null}
    />
  );
};
