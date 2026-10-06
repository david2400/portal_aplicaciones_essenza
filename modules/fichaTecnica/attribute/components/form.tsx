/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import { notify } from "@/components/notifications";
import { FormAttribute } from "../scenes/formAttribute";
import { validationAttribute, type AttributeFormValues } from "../schemas/attribute.schema";
import type { IAttribute, IAttributeSaveRequest, INamedItem } from "../models/attribute.interface";
import {
  createAttributeServerAction,
  updateAttributeServerAction,
} from "@/app/[locale]/fichaTecnica/attributes/actions";

const EMPTY_VALUES = {
  code: "",
  name: "",
  description: "",
  data_type: "TEXT",
  unit_id: "none",
  options: [{ value: "" }],
};

const toFormValues = (item: IAttribute) => ({
  code: item.code ?? "",
  name: item.name ?? "",
  description: item.description ?? "",
  data_type: item.data_type ?? "TEXT",
  unit_id: item.unit_id != null ? String(item.unit_id) : "none",
  options: (item.options ?? []).map((option) => ({ id: option.id, value: option.value ?? "" })),
});

const toPayload = (values: AttributeFormValues): IAttributeSaveRequest => ({
  code: values.code,
  name: values.name,
  description: values.description || undefined,
  data_type: values.data_type,
  unit_id: values.unit_id,
  options:
    values.data_type === "OPTION"
      ? values.options
          .filter((option) => option.value !== "")
          .map((option, index) => ({ id: option.id, value: option.value, position: index }))
      : [],
});

/** Alta / edición de atributo: avisa, cierra el modal y refresca la lista. */
export const AttributeForm = ({
  item,
  units,
  handleClose,
}: IFormAddProps & { item?: IAttribute | null; units: INamedItem[] }) => {
  const router = useRouter();
  const tCommon = useTranslations("Administre.common");
  const validationSchema = validationAttribute();

  const handleSubmit = async (values: AttributeFormValues) => {
    const payload = toPayload(values);
    const result =
      item?.id != null
        ? await updateAttributeServerAction(item.id, payload)
        : await createAttributeServerAction(payload);
    if (result.success) {
      notify.success(item?.id != null ? tCommon("updatedSuccess") : tCommon("createdSuccess"), values.name);
      handleClose?.(true);
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  return (
    <FormAttribute
      initialValues={item ? toFormValues(item) : EMPTY_VALUES}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      units={units}
      inUse={Boolean(item?.in_use)}
      isNew={!item}
    />
  );
};
