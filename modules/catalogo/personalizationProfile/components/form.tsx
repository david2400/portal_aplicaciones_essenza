/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import { FormPersonalizationProfile } from "../scenes/formPersonalizationProfile";
import {
  validationPersonalizationProfile,
  type PersonalizationProfileFormValues,
} from "../schemas/personalizationProfile.schema";
import type { IPersonalizationProfile } from "../models/personalizationProfile.interface";
import { JSON_FIELDS, prettyJson, type JsonField } from "../constants";
import {
  createProfileServerAction,
  updateProfileServerAction,
} from "@/app/[locale]/administre/personalization/actions";

type Result = { success: true } | { success: false; error: string };

const toFormValues = (profile?: IPersonalizationProfile | null) => ({
  customerId: profile?.customerId ?? "",
  segment: profile?.segment ?? "NEW_CUSTOMER",
  personalizationScore: profile?.personalizationScore ?? "",
  status: profile?.status ?? "",
  sessionId: profile?.sessionId ?? "",
  ...Object.fromEntries(JSON_FIELDS.map((field) => [field, prettyJson(profile?.[field])])),
});

/** JSON compacto para no gastar el límite de 4000 caracteres en espacios. */
const compactJson = (value?: string) => {
  if (!value?.trim()) return "";
  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return value;
  }
};

export const PersonalizationProfileForm = ({
  profile,
  handleClose,
}: IFormAddProps & { profile?: IPersonalizationProfile | null }) => {
  const router = useRouter();
  const t = useTranslations("Administre.common");
  const validationSchema = validationPersonalizationProfile();
  const id = profile?.id;

  const done = (result: Result, title: string) => {
    if (result.success) {
      notify.success(title);
      handleClose?.(true);
      router.refresh();
    } else {
      notify.error(t("errorTitle"), result.error || t("unexpectedError"));
    }
  };

  const handleSubmit = async (values: PersonalizationProfileFormValues) => {
    // El PUT ignora `null`: los textos vacíos se envían como "" para poder borrarlos.
    const jsonPayload: Partial<Record<JsonField, string>> = {};
    for (const field of JSON_FIELDS) jsonPayload[field] = compactJson(values[field]);
    const payload = {
      ...values,
      ...jsonPayload,
      status: values.status?.trim() ?? "",
      sessionId: values.sessionId?.trim() ?? "",
    };
    if (id != null) {
      done(await updateProfileServerAction({ ...payload, id }), t("updatedSuccess"));
    } else {
      done(await createProfileServerAction(payload), t("createdSuccess"));
    }
  };

  return (
    <FormPersonalizationProfile
      initialValues={toFormValues(profile)}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    />
  );
};
