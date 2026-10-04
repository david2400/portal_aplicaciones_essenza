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
  countryId: "",
  stateId: "",
  cityId: "",
  active: "true",
};

/** Ids del formulario (string del select) → número que espera el backend. */
type WarehouseFormValues = Omit<IWarehouseCreateRequest, "countryId" | "stateId" | "cityId"> & {
  countryId: string;
  stateId: string;
  cityId: string;
};

const toPayload = (values: WarehouseFormValues): IWarehouseCreateRequest => ({
  ...values,
  countryId: Number(values.countryId),
  stateId: Number(values.stateId),
  cityId: Number(values.cityId),
});

const idToString = (value?: number) => (value != null ? String(value) : "");

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: IWarehouse) => ({
  name: values.name ?? "",
  code: values.code ?? "",
  address: values.address ?? "",
  countryId: idToString(values.countryId),
  stateId: idToString(values.stateId),
  cityId: idToString(values.cityId),
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
