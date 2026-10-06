/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormWarehouse, type WarehouseFormOptions } from "../scenes/formWarehouse";
import { validationWarehouse } from "../schemas/warehouse.schema";
import type {
  IWarehouse,
  IWarehouseCreateRequest,
  IWarehouseUpdateRequest,
} from "../models/warehouse.interface";
import {
  createWarehouseServerAction,
  updateWarehouseServerAction,
} from "@/app/[locale]/inventory/warehouses/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
  code: "",
  address: "",
  country_id: "",
  state_id: "",
  city_id: "",
  active: "true",
};

/** Ids del formulario (string del select) → número que espera el backend. */
type WarehouseFormValues = Omit<IWarehouseCreateRequest, "country_id" | "state_id" | "city_id"> & {
  country_id: string;
  state_id: string;
  city_id: string;
};

const toPayload = (values: WarehouseFormValues): IWarehouseCreateRequest => ({
  ...values,
  country_id: Number(values.country_id),
  state_id: Number(values.state_id),
  city_id: Number(values.city_id),
});

const idToString = (value?: number) => (value != null ? String(value) : "");

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: IWarehouse) => ({
  name: values.name ?? "",
  code: values.code ?? "",
  address: values.address ?? "",
  country_id: idToString(values.country_id),
  state_id: idToString(values.state_id),
  city_id: idToString(values.city_id),
  active: String(values.active !== false),
});

const useFeedback = (handleClose?: IFormAddProps["handleClose"]) => {
  const router = useRouter();
  const t = useTranslations("Administre.common");

  return {
    success: (title: string) => {
      notify.success(title);
      handleClose?.(true);
      router.refresh();
    },
    failure: (message?: string) => notify.error(t("errorTitle"), message || t("unexpectedError")),
  };
};

export const RegisterWarehouse = ({
  handleClose,
  options,
}: IFormAddProps & { options?: WarehouseFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: WarehouseFormValues) => {
    const result = await createWarehouseServerAction(toPayload(values));
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormWarehouse
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationWarehouse()}
      options={options}
    />
  );
};

export const UpdateWarehouse = ({
  initialValues,
  handleClose,
  options,
}: IFormUpdateProps<IWarehouse> & { options?: WarehouseFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationWarehouse();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: WarehouseFormValues) => {
    const result = await updateWarehouseServerAction({ ...toPayload(values), id } as IWarehouseUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormWarehouse
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      options={options}
    />
  );
};
