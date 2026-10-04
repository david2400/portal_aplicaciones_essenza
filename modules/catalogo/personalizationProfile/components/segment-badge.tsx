/** @format */

"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { SEGMENT_VARIANT, isSegment } from "../constants";

export const SegmentBadge = ({ segment }: { segment?: string }) => {
  const t = useTranslations("Administre.personalization.segments");
  if (!isSegment(segment)) return <Badge variant='outline'>{segment || "—"}</Badge>;
  return <Badge variant={SEGMENT_VARIANT[segment]}>{t(segment)}</Badge>;
};
