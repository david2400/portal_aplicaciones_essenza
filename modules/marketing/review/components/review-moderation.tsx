/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheck,
  HiOutlineCheckBadge,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineMagnifyingGlass,
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlineXMark,
  HiStar,
} from "react-icons/hi2";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatCards } from "@/components/stat-cards";
import { confirm, notify, prompt } from "@/components/notifications";
import { MODERATION_STATUSES, reviewStatus, type IReview, type ModerationStatus } from "../models/review.interface";
import { moderateReviewServerAction, deleteReviewServerAction } from "@/app/[locale]/marketing/reviews/actions";

interface IReviewModerationProps {
  initialData: IReview[];
  products: { id?: number; name?: string }[];
}

const STATUS_VARIANT: Record<ModerationStatus, "default" | "outline" | "destructive"> = {
  PENDING: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
};

/** Calificación con estrellas + texto: el dato nunca depende sólo del color. */
const Rating = ({ value, label }: { value: number; label: string }) => (
  <span className='inline-flex items-center gap-0.5' aria-label={label} role='img'>
    {Array.from({ length: 5 }).map((_, index) => (
      <HiStar
        key={index}
        aria-hidden='true'
        className={classNames("h-4 w-4", index < value ? "text-warning" : "text-muted-foreground/30")}
      />
    ))}
  </span>
);

type Outcome = { ok: number; failed: number };

/** Cola de moderación de reseñas: filtros, búsqueda, selección múltiple y decisiones en lote. */
export const ReviewModeration = ({ initialData, products }: IReviewModerationProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.review");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");

  const [statusFilter, setStatusFilter] = useState<"ALL" | ModerationStatus>("PENDING");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const productNames = useMemo(
    () => new Map(products.map((product) => [product.id ?? -1, product.name ?? `#${product.id}`])),
    [products],
  );
  const productName = (review: IReview) =>
    productNames.get(review.productId ?? -1) ?? t("productFallback", { id: review.productId ?? "—" });

  const rated = initialData.filter((review) => review.rating != null);
  const pending = initialData.filter((review) => reviewStatus(review) === "PENDING").length;
  const approved = initialData.filter((review) => reviewStatus(review) === "APPROVED").length;
  const average = rated.length
    ? (rated.reduce((acc, review) => acc + (review.rating ?? 0), 0) / rated.length).toFixed(1)
    : "—";

  const data = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialData
      .filter((review) => statusFilter === "ALL" || reviewStatus(review) === statusFilter)
      .filter((review) => ratingFilter == null || review.rating === ratingFilter)
      .filter(
        (review) =>
          !needle ||
          [review.title, review.comment, review.customerName, review.customerEmail, productName(review)]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(needle)),
      )
      .sort((a, b) => (b.reviewDate ?? "").localeCompare(a.reviewDate ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, statusFilter, ratingFilter, query, productNames]);

  const visibleIds = data.map((review) => review.id).filter((id): id is number => id != null);
  const selectedVisible = visibleIds.filter((id) => selected.has(id));
  const allSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visibleIds));

  const markBusy = (ids: number[], value: boolean) =>
    setBusy((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (value ? next.add(id) : next.delete(id)));
      return next;
    });

  /** Ejecuta en tandas de 5 para no saturar el backend. */
  const runAll = async (ids: number[], task: (id: number) => Promise<{ success: boolean }>): Promise<Outcome> => {
    markBusy(ids, true);
    let ok = 0;
    for (let index = 0; index < ids.length; index += 5) {
      const results = await Promise.allSettled(ids.slice(index, index + 5).map(task));
      ok += results.filter((result) => result.status === "fulfilled" && result.value.success).length;
    }
    markBusy(ids, false);
    return { ok, failed: ids.length - ok };
  };

  const askNotes = () =>
    prompt({
      title: t("rejectTitle"),
      description: t("rejectPlaceholder"),
      confirmLabel: t("reject"),
      tone: "danger",
      input: { label: t("rejectNotes"), multiline: true },
    });

  const moderate = async (review: IReview, decision: ModerationStatus) => {
    if (review.id == null) return;
    let notes: string | undefined;
    if (decision === "REJECTED") {
      const value = await askNotes();
      if (value == null) return;
      notes = value || undefined;
    }
    markBusy([review.id], true);
    const response = await moderateReviewServerAction(review.id, decision, notes);
    markBusy([review.id], false);
    if (response.success) {
      notify.success(decision === "APPROVED" ? t("approvedOk") : t("rejectedOk"), review.title || productName(review));
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), response.error || tCommon("unexpectedError"));
    }
  };

  const report = ({ ok, failed }: Outcome) => {
    if (failed === 0) notify.success(tCrud("bulkUpdated", { count: ok }));
    else notify.warning(tCrud("bulkPartial", { ok, failed }));
    setSelected(new Set());
    router.refresh();
  };

  const bulkModerate = async (decision: ModerationStatus) => {
    const ids = selectedVisible;
    if (ids.length === 0) return;
    let notes: string | undefined;
    if (decision === "REJECTED") {
      const value = await askNotes();
      if (value == null) return;
      notes = value || undefined;
    } else {
      const ok = await confirm({ title: t("bulkApproveTitle", { count: ids.length }), confirmLabel: t("approve") });
      if (!ok) return;
    }
    report(await runAll(ids, (id) => moderateReviewServerAction(id, decision, notes)));
  };

  const remove = async (review: IReview) => {
    if (review.id == null) return;
    const ok = await confirm({
      title: tCommon("deleteConfirmTitle"),
      description: tCommon("deleteConfirmText", {
        name: review.title || t("reviewBy", { name: review.customerName ?? "—" }),
      }),
      confirmLabel: tCommon("deleteConfirmButton"),
      tone: "danger",
    });
    if (!ok) return;
    const response = await deleteReviewServerAction(review.id);
    if (response.success) {
      notify.success(tCommon("deletedSuccess"));
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), response.error || tCommon("unexpectedError"));
    }
  };

  const bulkDelete = async () => {
    const ids = selectedVisible;
    if (ids.length === 0) return;
    const ok = await confirm({
      title: tCrud("bulkConfirmTitle", { count: ids.length }),
      description: tCrud("bulkConfirmText"),
      confirmLabel: tCommon("deleteConfirmButton"),
      tone: "danger",
    });
    if (!ok) return;
    report(await runAll(ids, (id) => deleteReviewServerAction(id)));
  };

  const pill = (active: boolean) =>
    classNames(
      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-muted-foreground hover:text-foreground",
    );

  return (
    <section className='flex w-full flex-col gap-6'>
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={HiOutlineChatBubbleLeftRight}
        eyebrow={tCrud("domains.marketing")}
      />

      <StatCards
        items={[
          {
            label: t("pendingCount"),
            value: pending,
            icon: HiOutlineClock,
            tone: pending > 0 ? "warning" : "success",
          },
          { label: t("approvedCount"), value: approved, icon: HiOutlineCheckCircle, tone: "success" },
          { label: t("total"), value: initialData.length, icon: HiOutlineChatBubbleLeftRight },
          { label: t("averageRating"), value: average, icon: HiOutlineStar },
        ]}
      />

      <div className='flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <label className='relative w-full lg:max-w-sm'>
            <span className='sr-only'>{t("searchPlaceholder")}</span>
            <HiOutlineMagnifyingGlass
              className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden='true'
            />
            <input
              type='search'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className='h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30'
            />
          </label>
          <div role='group' aria-label={t("ratingFilter")} className='flex flex-wrap gap-2'>
            <button
              type='button'
              aria-pressed={ratingFilter == null}
              onClick={() => setRatingFilter(null)}
              className={pill(ratingFilter == null)}>
              {t("allRatings")}
            </button>
            {[5, 4, 3, 2, 1].map((value) => (
              <button
                key={value}
                type='button'
                aria-pressed={ratingFilter === value}
                onClick={() => setRatingFilter(value)}
                className={pill(ratingFilter === value)}>
                {t("stars", { count: value })}
              </button>
            ))}
          </div>
        </div>
        <div role='group' aria-label={t("statusFilter")} className='flex flex-wrap gap-2'>
          {(["ALL", ...MODERATION_STATUSES] as const).map((status) => (
            <button
              key={status}
              type='button'
              aria-pressed={statusFilter === status}
              onClick={() => setStatusFilter(status)}
              className={pill(statusFilter === status)}>
              {status === "ALL" ? t("allStatuses") : t(`status.${status}`)}
            </button>
          ))}
        </div>
      </div>

      {data.length > 0 ? (
        <div
          className={classNames(
            "sticky top-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 shadow-sm transition-colors",
            selectedVisible.length > 0 ? "border-primary/40 bg-primary/5 backdrop-blur" : "border-border bg-card",
          )}>
          <label className='inline-flex items-center gap-2 text-sm font-medium text-foreground'>
            <input
              type='checkbox'
              className='h-4 w-4 accent-primary'
              checked={allSelected}
              onChange={toggleAll}
              aria-label={t("selectAll")}
            />
            {selectedVisible.length > 0
              ? t("selectedCount", { count: selectedVisible.length })
              : t("visibleCount", { count: data.length })}
          </label>
          {selectedVisible.length > 0 ? (
            <div className='flex flex-wrap gap-2' aria-live='polite'>
              <Buttons size='sm' onClick={() => bulkModerate("APPROVED")}>
                <HiOutlineCheck className='h-4 w-4' aria-hidden='true' />
                {t("approve")}
              </Buttons>
              <Buttons size='sm' variant='outline' onClick={() => bulkModerate("REJECTED")}>
                <HiOutlineXMark className='h-4 w-4' aria-hidden='true' />
                {t("reject")}
              </Buttons>
              <Buttons size='sm' variant='danger' onClick={bulkDelete}>
                <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
                {tCrud("deleteSelected")}
              </Buttons>
            </div>
          ) : null}
        </div>
      ) : null}

      {data.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <ul className='grid gap-4 lg:grid-cols-2'>
          {data.map((review) => {
            const status = reviewStatus(review);
            const id = review.id ?? -1;
            const isBusy = busy.has(id);
            const isSelected = selected.has(id);
            return (
              <li
                key={id}
                aria-busy={isBusy}
                className={classNames(
                  "flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-all",
                  isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
                  isBusy && "opacity-60",
                )}>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <div className='flex items-start gap-3'>
                    <input
                      type='checkbox'
                      className='mt-1 h-4 w-4 accent-primary'
                      checked={isSelected}
                      onChange={() => toggle(id)}
                      aria-label={t("selectReview", { name: review.title || productName(review) })}
                    />
                    <div className='space-y-1'>
                      <p className='text-sm font-semibold text-foreground'>{productName(review)}</p>
                      <Rating value={review.rating ?? 0} label={t("ratingLabel", { count: review.rating ?? 0 })} />
                    </div>
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    {review.isVerifiedPurchase ? (
                      <Badge variant='secondary'>
                        <HiOutlineCheckBadge className='h-3.5 w-3.5' aria-hidden='true' /> {t("verified")}
                      </Badge>
                    ) : null}
                    <Badge variant={STATUS_VARIANT[status]}>{t(`status.${status}`)}</Badge>
                  </div>
                </div>

                {review.title ? <h3 className='text-base font-semibold text-foreground'>{review.title}</h3> : null}
                <p className='whitespace-pre-line text-sm text-muted-foreground'>{review.comment}</p>

                <p className='text-xs text-muted-foreground'>
                  {t("reviewBy", { name: review.customerName ?? "—" })}
                  {review.customerEmail ? ` · ${review.customerEmail}` : ""}
                  {review.reviewDate ? ` · ${new Date(review.reviewDate).toLocaleDateString("es-CO")}` : ""}
                  {" · "}
                  {t("helpful", { yes: review.helpfulCount ?? 0, no: review.notHelpfulCount ?? 0 })}
                </p>

                {review.moderationNotes ? (
                  <p className='rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground'>
                    <span className='font-semibold'>{t("notes")}:</span> {review.moderationNotes}
                  </p>
                ) : null}

                <div className='mt-auto flex flex-wrap gap-2 pt-1'>
                  {status !== "APPROVED" ? (
                    <Buttons size='sm' loading={isBusy} onClick={() => moderate(review, "APPROVED")}>
                      <HiOutlineCheck className='h-4 w-4' aria-hidden='true' />
                      {t("approve")}
                    </Buttons>
                  ) : null}
                  {status !== "REJECTED" ? (
                    <Buttons size='sm' variant='outline' disabled={isBusy} onClick={() => moderate(review, "REJECTED")}>
                      <HiOutlineXMark className='h-4 w-4' aria-hidden='true' />
                      {t("reject")}
                    </Buttons>
                  ) : null}
                  <Buttons
                    size='sm'
                    variant='ghost'
                    disabled={isBusy}
                    aria-label={tCommon("deleteAria", { name: review.title || review.customerName || "" })}
                    onClick={() => remove(review)}>
                    <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
                    {tCommon("delete")}
                  </Buttons>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
