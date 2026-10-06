/** @format */

"use client";

import { useTranslations } from "next-intl";
import { SegmentBadge } from "./segment-badge";
import { JSON_FIELDS, formatDateTime, prettyJson } from "../constants";
import type { IPersonalizationProfile } from "../models/personalizationProfile.interface";

import { fieldKey } from "@/shared/i18n/field-key";
/** Vista de solo lectura del perfil con los datos JSON formateados. */
export const ProfileViewer = ({ profile }: { profile: IPersonalizationProfile }) => {
  const t = useTranslations("Administre.personalization");
  const filled = JSON_FIELDS.filter((field) => profile[field]?.trim());

  const summary = [
    { label: t("fields.customerId"), value: `#${profile.customer_id ?? "—"}` },
    { label: t("fields.segment"), value: <SegmentBadge segment={profile.segment} /> },
    {
      label: t("fields.personalizationScore"),
      value: profile.personalization_score != null ? profile.personalization_score.toFixed(2) : "—",
    },
    { label: t("fields.status"), value: profile.status || "—" },
    { label: t("fields.sessionId"), value: profile.session_id || "—" },
    { label: t("fields.lastAnalysisAt"), value: formatDateTime(profile.last_analysis_at) },
  ];

  return (
    <div className='space-y-6'>
      <dl className='grid gap-4 sm:grid-cols-3'>
        {summary.map((entry) => (
          <div key={entry.label}>
            <dt className='text-xs font-semibold text-muted-foreground'>{entry.label}</dt>
            <dd className='mt-1 break-all text-sm font-medium text-foreground'>{entry.value}</dd>
          </div>
        ))}
      </dl>

      {filled.length === 0 ? (
        <p className='text-sm text-muted-foreground'>{t("noPayloads")}</p>
      ) : (
        <div className='space-y-3'>
          {filled.map((field) => (
            <details key={field} className='rounded-xl border border-border'>
              <summary className='cursor-pointer px-4 py-2 text-sm font-semibold text-foreground'>
                {t(fieldKey(field) as never)}
              </summary>
              <pre className='max-h-64 overflow-auto border-t border-border bg-muted/30 p-4 text-xs'>
                {prettyJson(profile[field])}
              </pre>
            </details>
          ))}
        </div>
      )}
    </div>
  );
};
