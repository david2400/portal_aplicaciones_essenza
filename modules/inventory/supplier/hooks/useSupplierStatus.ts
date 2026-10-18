/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { confirm, notify, prompt } from "@/components/notifications";
import type { ISupplier, SupplierStatus } from "../models/supplier.interface";
import { changeSupplierStatusServerAction } from "@/app/[locale]/inventory/suppliers/actions";

/**
 * Cambios de estado del proveedor: bloquear pide el motivo, desactivar pide
 * confirmación y activar es directo. Al terminar refresca la ruta.
 */
export const useSupplierStatus = () => {
  const t = useTranslations("Administre.supplier.statusActions");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  const change = async (supplier: ISupplier, status: SupplierStatus) => {
    if (supplier.id == null) return;
    const name = supplier.display_name ?? supplier.name ?? "";
    let reason: string | undefined;
    if (status === "BLOCKED") {
      const value = await prompt({
        title: t("blockTitle", { name }),
        description: t("blockDescription"),
        confirmLabel: t("block"),
        tone: "danger",
        input: { label: t("reason"), multiline: true, required: true, placeholder: t("reasonPlaceholder") },
      });
      if (value == null || !value.trim()) return;
      reason = value.trim();
    } else if (status === "INACTIVE") {
      const ok = await confirm({
        title: t("inactivateTitle", { name }),
        description: t("inactivateDescription"),
        confirmLabel: t("inactivate"),
        tone: "danger",
      });
      if (!ok) return;
    }
    setBusy(supplier.id);
    const result = await changeSupplierStatusServerAction(supplier.id, { status, reason });
    setBusy(null);
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(t(`done.${status}`), name);
    router.refresh();
  };

  return { change, busy };
};
