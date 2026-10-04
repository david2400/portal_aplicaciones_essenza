/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormUnitMeasurement } from "../scenes/formUnitMeasurement";
import { validationUnitMeasurement } from "../schemas/unitMeasurement.schema";
import type {
  IUnitMeasurement,
  IUnitMeasurementCreateRequest,
  IUnitMeasurementUpdateRequest,
} from "../models/unitMeasurement.interface";
import {
  createUnitMeasurementServerAction,
  updateUnitMeasurementServerAction,
} from "@/app/[locale]/fichaTecnica/unit-measurements/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: IUnitMeasurement) => ({
  name: values.name ?? "",
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

export const RegisterUnitMeasurement = ({
  handleClose,
}: IFormAddProps) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: IUnitMeasurementCreateRequest) => {
    const result = await createUnitMeasurementServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormUnitMeasurement
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationUnitMeasurement()}
    />
  );
};

export const UpdateUnitMeasurement = ({
  initialValues,
  handleClose,
}: IFormUpdateProps<IUnitMeasurement>) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationUnitMeasurement();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<IUnitMeasurementUpdateRequest, "id">) => {
    const result = await updateUnitMeasurementServerAction({ ...values, id } as IUnitMeasurementUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormUnitMeasurement
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    />
  );
};
