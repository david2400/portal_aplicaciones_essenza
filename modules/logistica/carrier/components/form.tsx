/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormCarrier, type CarrierFormOptions } from "../scenes/formCarrier";
import { validationCarrier } from "../schemas/carrier.schema";
import type {
  ICarrier,
  ICarrierCreateRequest,
  ICarrierUpdateRequest,
} from "../models/carrier.interface";
import {
  createCarrierServerAction,
  updateCarrierServerAction,
} from "@/app/[locale]/logistica/carriers/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
  code: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  baseRate: 0,
  ratePerKm: 0,
  maxDeliveryDays: 1,
  isActive: "true",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: ICarrier) => ({
  name: values.name ?? "",
  code: values.code ?? "",
  contactEmail: values.contactEmail ?? "",
  contactPhone: values.contactPhone ?? "",
  website: values.website ?? "",
  baseRate: values.baseRate ?? 0,
  ratePerKm: values.ratePerKm ?? 0,
  maxDeliveryDays: values.maxDeliveryDays ?? 0,
  isActive: String(Boolean(values.isActive)),
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

export const RegisterCarrier = ({
  handleClose,
  options,
}: IFormAddProps & { options?: CarrierFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: ICarrierCreateRequest) => {
    const result = await createCarrierServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormCarrier
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationCarrier()}
      options={options}
    />
  );
};

export const UpdateCarrier = ({
  initialValues,
  handleClose,
  options,
}: IFormUpdateProps<ICarrier> & { options?: CarrierFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationCarrier();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<ICarrierUpdateRequest, "id">) => {
    const result = await updateCarrierServerAction({ ...values, id } as ICarrierUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormCarrier
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      options={options}
    />
  );
};
