/** @format */

"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { ORDER_STATE_VARIANT, isOrderState } from "../constants";

export const OrderStatusBadge = ({ state }: { state?: string }) => {
  const t = useTranslations("Administre.order.states");

  if (!isOrderState(state)) {
    return <Badge variant='outline'>{state || "—"}</Badge>;
  }

  return <Badge variant={ORDER_STATE_VARIANT[state]}>{t(state)}</Badge>;
};
