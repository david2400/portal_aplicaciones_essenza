/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormMotiveDevolution } from "../scenes/formMotiveDevolution";
import { validationMotiveDevolution } from "../schemas/motiveDevolution.schema";
import type {
  IMotiveDevolution,
  IMotiveDevolutionCreateRequest,
  IMotiveDevolutionUpdateRequest,
} from "../models/motiveDevolution.interface";
import {
  createMotiveDevolutionServerAction,
  updateMotiveDevolutionServerAction,
} from "@/app/[locale]/postventa/devolution-motives/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
  description: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: IMotiveDevolution) => ({
  name: values.name ?? "",
  description: values.description ?? "",
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

export const RegisterMotiveDevolution = ({
  handleClose,
}: IFormAddProps) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: IMotiveDevolutionCreateRequest) => {
    const result = await createMotiveDevolutionServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormMotiveDevolution
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationMotiveDevolution()}
    />
  );
};

export const UpdateMotiveDevolution = ({
  initialValues,
  handleClose,
}: IFormUpdateProps<IMotiveDevolution>) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationMotiveDevolution();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<IMotiveDevolutionUpdateRequest, "id">) => {
    const result = await updateMotiveDevolutionServerAction({ ...values, id } as IMotiveDevolutionUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormMotiveDevolution
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    />
  );
};
