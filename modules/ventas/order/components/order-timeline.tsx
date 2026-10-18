/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineArrowPath,
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentCheck,
  HiOutlineClock,
  HiOutlinePencilSquare,
  HiOutlineReceiptPercent,
  HiOutlineShoppingCart,
  HiOutlineSparkles,
  HiOutlineTruck,
} from "react-icons/hi2";
import { SectionCard } from "@/components/form-sections";
import { notify } from "@/components/notifications";
import { formatApiDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EDITED_SECTIONS, isOrderState, pick, ORDER_EVENT_TYPES, type OrderEventType } from "../constants";
import type { IOrderEvent } from "../models/order.interface";
import { addOrderNoteServerAction } from "@/app/[locale]/ventas/orders/actions";

const ICONS: Record<OrderEventType, typeof HiOutlineClock> = {
  CREATED: HiOutlineSparkles,
  STATUS: HiOutlineArrowPath,
  EDITED: HiOutlinePencilSquare,
  LINES: HiOutlineShoppingCart,
  DISCOUNT: HiOutlineReceiptPercent,
  PICKED: HiOutlineClipboardDocumentCheck,
  SHIPPED: HiOutlineTruck,
  DELIVERED: HiOutlineCheckBadge,
  NOTE: HiOutlineChatBubbleLeftEllipsis,
};

const TONE: Partial<Record<OrderEventType, string>> = {
  CREATED: "bg-primary/10 text-primary",
  SHIPPED: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  DELIVERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  NOTE: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

/** Línea de tiempo auditable de la orden con notas internas. */
export const OrderTimeline = ({ orderId, events }: { orderId: number; events: IOrderEvent[] }) => {
  const t = useTranslations("Administre.order.timeline");
  const tStates = useTranslations("Administre.order.states");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const stateName = (state?: string | null) => (isOrderState(state ?? undefined) ? tStates(state as never) : (state ?? "—"));

  const describe = (event: IOrderEvent): string => {
    const type = pick(ORDER_EVENT_TYPES, event.type, "NOTE");
    const message = event.message ?? "";
    switch (type) {
      case "CREATED":
        return t("created");
      case "STATUS":
        return t("status", { from: stateName(event.from_state), to: stateName(event.to_state) });
      case "EDITED": {
        const parts = message
          .split(",")
          .map((part) => part.trim())
          .filter((part): part is (typeof EDITED_SECTIONS)[number] => (EDITED_SECTIONS as readonly string[]).includes(part))
          .map((part) => t(`sections.${part}`));
        return t("edited", { sections: parts.join(", ") || "—" });
      }
      case "LINES": {
        const sign = message.charAt(0);
        const detail = message.slice(1).trim();
        return sign === "+" ? t("lineAdded", { detail }) : sign === "-" ? t("lineRemoved", { detail }) : t("lineChanged", { detail });
      }
      case "DISCOUNT": {
        const [kind, value] = message.split(":");
        if (kind === "NONE") return t("discountRemoved");
        if (kind === "PERCENT") return t("discountPercent", { value: value ?? "" });
        if (kind === "AMOUNT") return t("discountAmount", { value: value ?? "" });
        return t("discountCoupon", { code: value ?? "" });
      }
      case "PICKED":
        return t("picked", { detail: message });
      case "SHIPPED":
        return t("shipped");
      case "DELIVERED":
        return t("delivered");
      default:
        return message;
    }
  };
  // Mensaje libre (motivo, nota, guía) que se muestra debajo del título.
  const detailOf = (event: IOrderEvent) =>
    ["STATUS", "SHIPPED", "DELIVERED"].includes(event.type ?? "") ? event.message : null;

  const addNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    const result = await addOrderNoteServerAction(orderId, note.trim());
    setSaving(false);
    if (result.success) {
      setNote("");
      notify.success(t("noteSaved"));
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error);
    }
  };

  const ordered = [...events].reverse();

  return (
    <SectionCard id='order-timeline' icon={HiOutlineClock} title={t("title")} hint={t("hint")} contentClassName='p-4'>
      <div className='col-span-12 grid gap-2'>
        <label htmlFor='order-note' className='text-sm font-medium text-foreground'>{t("addNote")}</label>
        <textarea id='order-note' value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} rows={2}
          placeholder={t("notePlaceholder")}
          className='w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' />
        <div className='flex justify-end'>
          <Buttons type='button' size='sm' className='rounded-full' loading={saving} disabled={!note.trim()} onClick={addNote}>
            {t("saveNote")}
          </Buttons>
        </div>
      </div>
      {ordered.length === 0 ? (
        <p className='col-span-12 text-sm text-muted-foreground'>{t("empty")}</p>
      ) : (
        <ol className='col-span-12 grid gap-0'>
          {ordered.map((event, index) => {
            const type = pick(ORDER_EVENT_TYPES, event.type, "NOTE");
            const Icon = ICONS[type];
            const detail = detailOf(event);
            return (
              <li key={event.id ?? index} className='relative flex gap-3 pb-4 last:pb-0'>
                {index < ordered.length - 1 ? <span className='absolute left-4 top-8 h-[calc(100%-2rem)] w-px bg-border' aria-hidden='true' /> : null}
                <span className={cn("relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground", TONE[type])}>
                  <Icon className='h-4 w-4' aria-hidden='true' />
                </span>
                <div className='min-w-0 flex-1 pt-1'>
                  <p className={cn("text-sm text-foreground", type === "NOTE" && "whitespace-pre-line")}>{describe(event)}</p>
                  {detail ? <p className='mt-0.5 text-xs text-muted-foreground'>{detail}</p> : null}
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {[event.created_at ? formatApiDate(event.created_at) : null, event.actor ?? t("system")].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SectionCard>
  );
};
