/** @format */

"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { isSupplierStatus, type SupplierStatus } from "../models/supplier.interface";

const VARIANT: Record<SupplierStatus, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  BLOCKED: "destructive",
  INACTIVE: "secondary",
};

export const SupplierStatusBadge = ({ status }: { status?: string }) => {
  const t = useTranslations("Administre.supplier.statuses");
  if (!isSupplierStatus(status)) return <Badge variant='outline'>{status || "—"}</Badge>;
  return <Badge variant={VARIANT[status]}>{t(status)}</Badge>;
};
