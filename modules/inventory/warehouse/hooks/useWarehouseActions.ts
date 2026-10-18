/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { confirm, notify } from "@/components/notifications";
import type { IWarehouse } from "../models/warehouse.interface";
import { setMainWarehouseServerAction, setWarehouseActiveServerAction } from "@/app/[locale]/inventory/warehouses/actions";

/** Activar o desactivar y marcar como principal, con confirmación y refresco de la ruta. */
export const useWarehouseActions = () => {
  const t = useTranslations("Administre.warehouse.actions");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  const finish = (ok: boolean, error: string | undefined, title: string, name: string) => {
    setBusy(null);
    if (!ok) {
      notify.error(tCommon("errorTitle"), error);
      return;
    }
    notify.success(title, name);
    router.refresh();
  };

  const setActive = async (warehouse: IWarehouse, active: boolean) => {
    if (warehouse.id == null) return;
    const name = warehouse.name ?? "";
    if (!active) {
      const ok = await confirm({
        title: t("deactivateTitle", { name }),
        description: t("deactivateText"),
        confirmLabel: t("deactivate"),
        tone: "danger",
      });
      if (!ok) return;
    }
    setBusy(warehouse.id);
    const result = await setWarehouseActiveServerAction(warehouse.id, active);
    finish(result.success, result.success ? undefined : result.error, active ? t("activated") : t("deactivated"), name);
  };

  const setMain = async (warehouse: IWarehouse) => {
    if (warehouse.id == null) return;
    const name = warehouse.name ?? "";
    const ok = await confirm({ title: t("mainTitle", { name }), description: t("mainText"), confirmLabel: t("makeMain") });
    if (!ok) return;
    setBusy(warehouse.id);
    const result = await setMainWarehouseServerAction(warehouse.id);
    finish(result.success, result.success ? undefined : result.error, t("mainDone"), name);
  };

  return { setActive, setMain, busy };
};
