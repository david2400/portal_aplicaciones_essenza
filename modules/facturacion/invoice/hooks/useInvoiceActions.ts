/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify, prompt } from "@/components/notifications";
import type { IInvoice } from "../models/invoice.interface";
import { creditNoteServerAction, retryInvoiceServerAction } from "@/app/[locale]/facturacion/invoices/actions";

/** Reenviar un documento pendiente/rechazado y anular una factura con nota crédito. */
export function useInvoiceActions() {
  const router = useRouter();
  const t = useTranslations("Administre.billing.invoice");
  const tCommon = useTranslations("Administre.common");
  const [busy, setBusy] = useState<number | null>(null);

  const retry = async (invoice: IInvoice) => {
    if (invoice.id == null) return;
    setBusy(invoice.id);
    const result = await retryInvoiceServerAction(invoice.id);
    setBusy(null);
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    if (result.data.status === "ISSUED") notify.success(t("issue.issued", { number: result.data.full_number ?? "" }));
    else notify.warning(t("issue.notIssued", { number: result.data.full_number ?? "" }), result.data.status_detail ?? undefined);
    router.refresh();
  };

  const creditNote = async (invoice: IInvoice) => {
    if (invoice.id == null) return;
    const reason = await prompt({
      title: t("creditNote.title", { number: invoice.full_number ?? "" }),
      description: t("creditNote.description"),
      confirmLabel: t("creditNote.confirm"),
      tone: "danger",
      input: { label: t("creditNote.reason"), multiline: true, required: true },
    });
    if (reason == null || !reason.trim()) return;
    setBusy(invoice.id);
    const result = await creditNoteServerAction(invoice.id, reason.trim());
    setBusy(null);
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    if (result.data.status === "ISSUED") notify.success(t("creditNote.issued", { number: result.data.full_number ?? "" }));
    else notify.warning(t("issue.notIssued", { number: result.data.full_number ?? "" }), result.data.status_detail ?? undefined);
    router.refresh();
  };

  return { retry, creditNote, busy };
}
