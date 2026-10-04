/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import type {
  IFormAddProps,
  IFormUpdateProps,
} from "@repo/ui/form/models/form.interface";
import { FormSupplier } from "../scenes/formSupplier";
import { validationSupplier } from "../schemas/supplier.schema";
import type {
  ISupplier,
  ISupplierCreateRequest,
  ISupplierUpdateRequest,
} from "../models/supplier.interface";
import {
  createSupplierServerAction,
  updateSupplierServerAction,
} from "@/app/[locale]/inventory/suppliers/actions";

/** Valores iniciales del formulario de creación. */
const EMPTY_VALUES = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

/** Convierte el DTO de la API en los valores que espera el formulario. */
const toFormValues = (values: ISupplier) => ({
  name: values.name ?? "",
  email: values.email ?? "",
  phone: values.phone ?? "",
  address: values.address ?? "",
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

export const RegisterSupplier = ({
  handleClose,
}: IFormAddProps) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: ISupplierCreateRequest) => {
    const result = await createSupplierServerAction(values);
    if (result.success) {
      feedback.success(t("createdSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormSupplier
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      validationSchema={validationSupplier()}
    />
  );
};

export const UpdateSupplier = ({
  initialValues,
  handleClose,
}: IFormUpdateProps<ISupplier>) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationSupplier();
  const id = initialValues?.id;

  if (id == null || !initialValues) {
    return null;
  }

  const handleSubmit = async (values: Omit<ISupplierUpdateRequest, "id">) => {
    const result = await updateSupplierServerAction({ ...values, id } as ISupplierUpdateRequest);
    if (result.success) {
      feedback.success(t("updatedSuccess"));
    } else {
      feedback.failure(result.error);
    }
  };

  return (
    <FormSupplier
      initialValues={toFormValues(initialValues)}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    />
  );
};
