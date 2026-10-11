/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import type { IUnit } from "@/shared/units/units";
import { FormAttribute } from "../scenes/formAttribute";
import type { AttributeFormInput, AttributeFormValues } from "../schemas/attribute.schema";
import type { IAttribute, IAttributeSaveRequest, IAttributeUsage } from "../models/attribute.interface";
import {
  createAttributeServerAction,
  updateAttributeServerAction,
} from "@/app/[locale]/fichaTecnica/attributes/actions";

export const ATTRIBUTES_HREF = "/fichaTecnica/attributes";

const EMPTY_VALUES = {
  code: "",
  name: "",
  description: "",
  data_type: "TEXT",
  unit_id: "none",
  options: [{ value: "" }],
} satisfies AttributeFormInput;

const toFormValues = (item: IAttribute) =>
  ({
    code: item.code ?? "",
    name: item.name ?? "",
    description: item.description ?? "",
    data_type: item.data_type ?? "TEXT",
    unit_id: item.unit_id != null ? String(item.unit_id) : "none",
    options: (item.options ?? []).length
      ? (item.options ?? []).map((option) => ({ id: option.id, value: option.value ?? "" }))
      : [{ value: "" }],
  }) satisfies AttributeFormInput;

/** Payload del API: opciones con posición por orden y unidad solo para números. */
const toPayload = (values: AttributeFormValues): IAttributeSaveRequest => ({
  code: values.code,
  name: values.name,
  description: values.description || undefined,
  data_type: values.data_type,
  unit_id: values.data_type === "NUMBER" ? values.unit_id : undefined,
  options:
    values.data_type === "OPTION"
      ? values.options
          .filter((option) => option.value !== "")
          .map((option, index) => ({ id: option.id, value: option.value, position: index }))
      : [],
});

/** Alta en `/fichaTecnica/attributes/new`: al guardar vuelve a la lista. */
export const RegisterAttribute = ({ units }: { units: IUnit[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.attribute");
  const tCommon = useTranslations("Administre.common");

  const handleSubmit = async (values: AttributeFormValues) => {
    const result = await createAttributeServerAction(toPayload(values));
    if (result.success) {
      notify.success(tCommon("createdSuccess"), values.name);
      router.push(ATTRIBUTES_HREF);
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  return (
    <FormAttribute
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      units={units}
      isNew
      cancelHref={ATTRIBUTES_HREF}
      submitLabel={t("create")}
    />
  );
};

/** Edición en `/fichaTecnica/attributes/[id]`: guarda y se queda con los datos frescos. */
export const UpdateAttribute = ({
  attribute,
  usage,
  units,
}: {
  attribute: IAttribute;
  usage: IAttributeUsage | null;
  units: IUnit[];
}) => {
  const router = useRouter();
  const tCommon = useTranslations("Administre.common");

  const handleSubmit = async (values: AttributeFormValues) => {
    if (attribute.id == null) return;
    const result = await updateAttributeServerAction(attribute.id, toPayload(values));
    if (result.success) {
      notify.success(tCommon("updatedSuccess"), values.name);
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  return (
    <FormAttribute
      // Remonta el formulario cuando el servidor devuelve datos nuevos tras guardar.
      key={JSON.stringify([attribute, usage?.product_count, usage?.variant_count])}
      initialValues={toFormValues(attribute)}
      onSubmit={handleSubmit}
      units={units}
      usage={usage}
      typeLocked={Boolean(attribute.in_use)}
      cancelHref={ATTRIBUTES_HREF}
    />
  );
};
