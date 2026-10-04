/** @format */

"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { PAGE_STATUS_VARIANT, isPageStatus } from "../constants";

export const PageStatusBadge = ({ status }: { status?: string }) => {
  const t = useTranslations("Administre.cmsPage.statuses");
  const value = status || "DRAFT";
  if (!isPageStatus(value)) return <Badge variant='outline'>{value}</Badge>;
  return <Badge variant={PAGE_STATUS_VARIANT[value]}>{t(value)}</Badge>;
};
