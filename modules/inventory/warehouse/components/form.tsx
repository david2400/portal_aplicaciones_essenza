/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
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
  active: "true",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: IWarehouse) => ({
  name: values.name ?? "",
  code: values.code ?? "",
  address: values.address ?? "",
  active: String(values.active !== false),
});

const useFeedback = (handleClose?: IFormAddProps["handleClose"]) => {
  const router = useRouter();
  const t = useTranslations("Administre.common");

  return {
    success: (title: string) =>
      Swal.fire({
        title,
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        willClose: () => {
          handleClose?.(true);
          router.refresh();
        },
      }),
    failure: (message?: string) =>
      Swal.fire({
        title: t("errorTitle"),
        text: message || t("unexpectedError"),
        icon: "error",
      }),
  };
};

export const RegisterWarehouse = ({
  handleClose,
  options,
}: IFormAddProps & { options?: WarehouseFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: IWarehouseCreateRequest) => {
    const result = await createWarehouseServerAction(values);
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

  const handleSubmit = async (values: Omit<IWarehouseUpdateRequest, "id">) => {
    const result = await updateWarehouseServerAction({ ...values, id } as IWarehouseUpdateRequest);
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
