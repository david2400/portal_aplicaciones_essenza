/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormFeature, type FeatureFormOptions } from "../scenes/formFeature";
import { validationFeature } from "../schemas/feature.schema";
import type {
  IFeature,
  IFeatureCreateRequest,
  IFeatureUpdateRequest,
} from "../models/feature.interface";
import {
  createFeatureServerAction,
  updateFeatureServerAction,
} from "@/app/[locale]/fichaTecnica/features/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
  unitId: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: IFeature) => ({
  name: values.name ?? "",
  unitId: values.unitId != null ? String(values.unitId) : "",
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

export const RegisterFeature = ({
  handleClose,
  options,
}: IFormAddProps & { options?: FeatureFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: IFeatureCreateRequest) => {
    const result = await createFeatureServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormFeature
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationFeature()}
      options={options}
    />
  );
};

export const UpdateFeature = ({
  initialValues,
  handleClose,
  options,
}: IFormUpdateProps<IFeature> & { options?: FeatureFormOptions }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationFeature();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<IFeatureUpdateRequest, "id">) => {
    const result = await updateFeatureServerAction({ ...values, id } as IFeatureUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormFeature
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      options={options}
    />
  );
};
