/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import { FormCoupon } from "../scenes/formCoupon";
import { validationCoupon } from "../schemas/coupon.schema";
import type { DiscountType, ICoupon, ICouponCreateRequest, INamedItem } from "../models/coupon.interface";
import { csvToList, fromInputDateTime, listToCsv, toInputDateTime } from "../utils";
import {
  createCouponServerAction,
  updateCouponServerAction,
} from "@/app/[locale]/marketing/coupons/actions";

type CouponFormValues = {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isPublic: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
};

/** Valores del formulario → contrato del backend (fechas ISO, listas como CSV). */
const toPayload = (values: CouponFormValues): ICouponCreateRequest => ({
  ...values,
  description: values.description || undefined,
  validFrom: fromInputDateTime(values.validFrom),
  validUntil: fromInputDateTime(values.validUntil),
  applicableCategories: listToCsv(values.applicableCategories),
  applicableProducts: listToCsv(values.applicableProducts),
  excludedCategories: listToCsv(values.excludedCategories),
  excludedProducts: listToCsv(values.excludedProducts),
});

const toFormValues = (coupon?: ICoupon | null) => {
  const now = new Date();
  const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const local = (date: Date) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return {
    code: coupon?.code ?? "",
    name: coupon?.name ?? "",
    description: coupon?.description ?? "",
    discountType: (coupon?.discountType as DiscountType) ?? "PERCENTAGE",
    discountValue: coupon?.discountValue ?? 10,
    minimumOrderAmount: coupon?.minimumOrderAmount ?? "",
    maximumDiscountAmount: coupon?.maximumDiscountAmount ?? "",
    usageLimit: coupon?.usageLimit ?? "",
    validFrom: coupon ? toInputDateTime(coupon.validFrom) : local(now),
    validUntil: coupon ? toInputDateTime(coupon.validUntil) : local(inThirtyDays),
    isActive: String(coupon?.isActive ?? true),
    isPublic: String(coupon?.isPublic ?? false),
    applicableCategories: csvToList(coupon?.applicableCategories),
    applicableProducts: csvToList(coupon?.applicableProducts),
    excludedCategories: csvToList(coupon?.excludedCategories),
    excludedProducts: csvToList(coupon?.excludedProducts),
  };
};

export const CouponForm = ({
  coupon,
  categories,
  products,
  handleClose,
}: IFormAddProps & { coupon?: ICoupon | null; categories: INamedItem[]; products: INamedItem[] }) => {
  const router = useRouter();
  const tCommon = useTranslations("Administre.common");
  const validationSchema = validationCoupon();

  const handleSubmit = async (values: CouponFormValues) => {
    const payload = toPayload(values);
    const result =
      coupon?.id != null
        ? await updateCouponServerAction({ ...payload, id: coupon.id })
        : await createCouponServerAction(payload);

    if (result.success) {
      notify.success(coupon?.id != null ? tCommon("updatedSuccess") : tCommon("createdSuccess"));
      handleClose?.(true);
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  return (
    <FormCoupon
      initialValues={toFormValues(coupon)}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      categories={categories}
      products={products}
    />
  );
};
