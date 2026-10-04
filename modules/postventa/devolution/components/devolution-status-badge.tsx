/** @format */

"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { DEVOLUTION_STATE_VARIANT, isDevolutionState } from "../constants";

export const DevolutionStatusBadge = ({ state }: { state?: string }) => {
  const t = useTranslations("Administre.devolution.states");

  if (!isDevolutionState(state)) {
    return <Badge variant='outline'>{state || "—"}</Badge>;
  }

  return <Badge variant={DEVOLUTION_STATE_VARIANT[state]}>{t(state)}</Badge>;
};
