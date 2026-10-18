/** @format */

"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { INVOICE_STATUS_VARIANT, isInvoiceStatus } from "../models/invoice.interface";

export const InvoiceStatusBadge = ({ status }: { status?: string }) => {
  const t = useTranslations("Administre.billing.invoice.statuses");
  if (!isInvoiceStatus(status)) return <Badge variant='outline'>{status || "—"}</Badge>;
  return <Badge variant={INVOICE_STATUS_VARIANT[status]}>{t(status)}</Badge>;
};
