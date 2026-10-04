/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import classNames from "classnames";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineTrash,
  HiOutlineCheckBadge,
  HiStar,
} from "react-icons/hi2";
import { EmptyState } from "@/components/feedback/empty-state";
import { MODERATION_STATUSES, reviewStatus, type IReview, type ModerationStatus } from "../models/review.interface";
import {
  moderateReviewServerAction,
  deleteReviewServerAction,
} from "@/app/[locale]/marketing/reviews/actions";

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

export const ReviewModeration = ({ initialData, products }: IReviewModerationProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.review");
  const tCommon = useTranslations("Administre.common");

  const [statusFilter, setStatusFilter] = useState<"ALL" | ModerationStatus>("PENDING");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const productNames = useMemo(
    () => new Map(products.map((product) => [product.id ?? -1, product.name ?? `#${product.id}`])),
    [products],
  );

  const metrics = useMemo(() => {
    const rated = initialData.filter((review) => review.rating != null);
    return {
      pending: initialData.filter((review) => reviewStatus(review) === "PENDING").length,
      approved: initialData.filter((review) => reviewStatus(review) === "APPROVED").length,
      total: initialData.length,
      average: rated.length
        ? (rated.reduce((acc, review) => acc + (review.rating ?? 0), 0) / rated.length).toFixed(1)
        : "—",
    };
  }, [initialData]);

  const data = useMemo(
    () =>
      initialData
        .filter((review) => statusFilter === "ALL" || reviewStatus(review) === statusFilter)
        .filter((review) => ratingFilter == null || review.rating === ratingFilter)
        .sort((a, b) => (b.reviewDate ?? "").localeCompare(a.reviewDate ?? "")),
    [initialData, statusFilter, ratingFilter],
  );

  const showError = (message?: string) =>
    Swal.fire({ title: tCommon("errorTitle"), text: message || tCommon("unexpectedError"), icon: "error" });

  const moderate = async (review: IReview, decision: ModerationStatus) => {
    if (review.id == null) return;
    let notes: string | undefined;

    if (decision === "REJECTED") {
      const prompt = await Swal.fire({
        title: t("rejectTitle"),
        input: "textarea",
        inputLabel: t("rejectNotes"),
        inputPlaceholder: t("rejectPlaceholder"),
        showCancelButton: true,
        confirmButtonText: t("reject"),
        cancelButtonText: tCommon("cancel"),
      });
      if (!prompt.isConfirmed) return;
      notes = prompt.value;
    }

    setBusyId(review.id);
    const response = await moderateReviewServerAction(review.id, decision, notes);
    setBusyId(null);
    if (response.success) router.refresh();
    else showError(response.error);
  };

  const remove = (review: IReview) => {
    if (review.id == null) return;
    const id = review.id;
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: review.title || t("reviewBy", { name: review.customerName ?? "—" }) }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteReviewServerAction(id);
      if (response.success) router.refresh();
      else showError(response.error);
    });
  };

  const summaryCards = [
    { label: t("pendingCount"), value: metrics.pending },
    { label: t("approvedCount"), value: metrics.approved },
    { label: t("total"), value: metrics.total },
    { label: t("averageRating"), value: metrics.average },
  ];

  const pill = (active: boolean) =>
    classNames(
      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-muted-foreground hover:text-foreground",
    );

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex items-center gap-4'>
        <div className='rounded-2xl bg-primary/10 p-3'>
          <HiOutlineChatBubbleLeftRight className='h-7 w-7 text-primary' aria-hidden='true' />
        </div>
        <div>
          <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
          <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {summaryCards.map((card) => (
          <div key={card.label} className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
            <p className='text-sm font-semibold text-muted-foreground'>{card.label}</p>
            <p className='mt-2 text-2xl font-semibold text-foreground'>{card.value}</p>
          </div>
        ))}
      </div>

      <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
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
        <div role='group' aria-label={t("ratingFilter")} className='flex flex-wrap gap-2'>
          <button type='button' aria-pressed={ratingFilter == null} onClick={() => setRatingFilter(null)} className={pill(ratingFilter == null)}>
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

      {data.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <ul className='grid gap-4 lg:grid-cols-2'>
          {data.map((review) => {
            const status = reviewStatus(review);
            const busy = busyId === review.id;
            return (
              <li key={review.id} className='flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <div className='space-y-1'>
                    <p className='text-sm font-semibold text-foreground'>
                      {productNames.get(review.productId ?? -1) ?? t("productFallback", { id: review.productId ?? "—" })}
                    </p>
                    <Rating
                      value={review.rating ?? 0}
                      label={t("ratingLabel", { count: review.rating ?? 0 })}
                    />
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
                    <Buttons size='sm' loading={busy} onClick={() => moderate(review, "APPROVED")}>
                      <HiOutlineCheck className='h-4 w-4' aria-hidden='true' />
                      {t("approve")}
                    </Buttons>
                  ) : null}
                  {status !== "REJECTED" ? (
                    <Buttons size='sm' variant='outline' disabled={busy} onClick={() => moderate(review, "REJECTED")}>
                      <HiOutlineXMark className='h-4 w-4' aria-hidden='true' />
                      {t("reject")}
                    </Buttons>
                  ) : null}
                  <Buttons
                    size='sm'
                    variant='ghost'
                    disabled={busy}
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
