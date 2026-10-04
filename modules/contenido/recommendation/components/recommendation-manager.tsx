/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineCursorArrowRays,
  HiOutlineLightBulb,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { BreakdownList } from "@/components/breakdown-list";
import { RecommendationForm } from "./form";
import {
  RECOMMENDATION_CONTEXTS,
  RECOMMENDATION_TYPES,
  formatMoney,
  formatPercent,
} from "../constants";
import type { IRecommendation, IRecommendationProduct } from "../models/recommendation.interface";
import { deleteRecommendationServerAction } from "@/app/[locale]/contenido/recommendations/actions";

interface IRecommendationManagerProps {
  initialData: IRecommendation[];
  products: IRecommendationProduct[];
}

type Filter = { type: string; context: string };

const rate = (part: number, total: number) => (total > 0 ? part / total : 0);

export const RecommendationManager = ({ initialData, products }: IRecommendationManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.recommendation");
  const tTypes = useTranslations("Administre.recommendation.types");
  const tContexts = useTranslations("Administre.recommendation.contexts");
  const tCommon = useTranslations("Administre.common");

  const [modal, setModal] = useState<{ open: boolean; item: IRecommendation | null }>({ open: false, item: null });
  const [filter, setFilter] = useState<Filter>({ type: "ALL", context: "ALL" });

  const data = useMemo(
    () =>
      [...initialData]
        .filter((item) => filter.type === "ALL" || item.recommendationType === filter.type)
        .filter((item) => filter.context === "ALL" || item.context === filter.context)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    [initialData, filter],
  );

  const metrics = useMemo(() => {
    const total = data.length;
    const clicked = data.filter((item) => item.isClicked).length;
    const purchased = data.filter((item) => item.isPurchased).length;
    const scores = data.map((item) => item.score ?? 0);
    return {
      total,
      ctr: rate(clicked, total),
      conversion: rate(purchased, total),
      clickToPurchase: rate(purchased, clicked),
      avgScore: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    };
  }, [data]);

  const byType = useMemo(
    () =>
      RECOMMENDATION_TYPES.map((type) => {
        const group = initialData.filter((item) => item.recommendationType === type);
        return {
          key: type,
          label: tTypes(type),
          value: group.length,
          hint: t("ctrHint", { value: formatPercent(rate(group.filter((i) => i.isClicked).length, group.length)) }),
        };
      }).filter((item) => item.value > 0),
    [initialData, t, tTypes],
  );

  const byContext = useMemo(
    () =>
      RECOMMENDATION_CONTEXTS.map((context) => {
        const group = initialData.filter((item) => item.context === context);
        return {
          key: context,
          label: tContexts(context),
          value: group.length,
          hint: t("conversionHint", {
            value: formatPercent(rate(group.filter((i) => i.isPurchased).length, group.length)),
          }),
        };
      }).filter((item) => item.value > 0),
    [initialData, t, tContexts],
  );

  const handleDelete = (item: IRecommendation) => {
    if (item.id == null) return;
    const id = item.id;
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: item.productName ?? `#${id}` }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteRecommendationServerAction(id);
      if (response.success) router.refresh();
      else Swal.fire({ title: tCommon("errorTitle"), text: response.error || tCommon("unexpectedError"), icon: "error" });
    });
  };

  const columns: ColumnDef<IRecommendation>[] = [
    {
      accessorKey: "productName",
      header: t("fields.productId"),
      cell: ({ row }) => (
        <div className='flex min-w-0 items-center gap-3'>
          {row.original.productImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.original.productImageUrl}
              alt=''
              className='h-10 w-10 shrink-0 rounded-lg border border-border object-cover'
            />
          ) : null}
          <div className='min-w-0'>
            <p className='truncate font-semibold text-foreground'>
              {row.original.productName ?? `#${row.original.productId}`}
            </p>
            <p className='text-xs text-muted-foreground'>{formatMoney(row.original.productPrice)}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "customerId",
      header: t("fields.customerId"),
      cell: ({ row }) => `#${row.original.customerId ?? "—"}`,
    },
    {
      accessorKey: "recommendationType",
      header: t("fields.recommendationType"),
      cell: ({ row }) =>
        row.original.recommendationType ? (
          <Badge variant='secondary'>{tTypes(row.original.recommendationType as never)}</Badge>
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "context",
      header: t("fields.context"),
      cell: ({ row }) => (row.original.context ? tContexts(row.original.context as never) : "—"),
    },
    {
      accessorKey: "score",
      header: t("fields.score"),
      cell: ({ row }) => {
        const score = row.original.score ?? 0;
        return (
          <div className='flex items-center gap-2'>
            <div
              className='h-2 w-16 overflow-hidden rounded-full bg-muted'
              role='meter'
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={score}
              aria-label={t("fields.score")}>
              <div className='h-full rounded-full bg-primary' style={{ width: `${score * 100}%` }} />
            </div>
            <span className='tabular-nums text-xs text-muted-foreground'>{score.toFixed(2)}</span>
          </div>
        );
      },
    },
    {
      id: "funnel",
      header: t("funnel"),
      cell: ({ row }) => (
        <div className='flex gap-1'>
          <Badge variant={row.original.isClicked ? "default" : "outline"}>{t("clicked")}</Badge>
          <Badge variant={row.original.isPurchased ? "default" : "outline"}>{t("purchased")}</Badge>
        </div>
      ),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const name = row.original.productName ?? `#${row.original.id}`;
        return (
          <div className='flex gap-2'>
            <Buttons
              size='sm'
              variant='outline'
              aria-label={tCommon("editAria", { name })}
              onClick={() => setModal({ open: true, item: row.original })}>
              <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
              {tCommon("edit")}
            </Buttons>
            <Buttons
              size='sm'
              variant='ghost'
              aria-label={tCommon("deleteAria", { name })}
              onClick={() => handleDelete(row.original)}>
              <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
              {tCommon("delete")}
            </Buttons>
          </div>
        );
      },
    },
  ];

  const summaryCards = [
    { icon: HiOutlineLightBulb, label: t("total"), value: metrics.total },
    { icon: HiOutlineCursorArrowRays, label: t("ctr"), value: formatPercent(metrics.ctr) },
    { icon: HiOutlineShoppingBag, label: t("conversion"), value: formatPercent(metrics.conversion) },
    { icon: HiOutlineSparkles, label: t("avgScore"), value: metrics.avgScore.toFixed(2) },
  ];

  const selectClass =
    "h-9 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineLightBulb className='h-7 w-7 text-primary' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
            <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
          </div>
        </div>
        <Buttons
          className='inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm'
          onClick={() => setModal({ open: true, item: null })}>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Buttons>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className='rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md'>
            <div className='flex items-center justify-between text-sm font-semibold text-muted-foreground'>
              <span>{card.label}</span>
              <card.icon className='h-5 w-5 text-primary' aria-hidden='true' />
            </div>
            <p className='mt-2 text-2xl font-semibold text-foreground'>{card.value}</p>
          </div>
        ))}
      </div>

      <p className='text-sm text-muted-foreground'>
        {t("clickToPurchase", { value: formatPercent(metrics.clickToPurchase) })}
      </p>

      <div className='grid gap-4 lg:grid-cols-2'>
        <BreakdownList title={t("byType")} items={byType} emptyLabel={t("emptyBreakdown")} />
        <BreakdownList title={t("byContext")} items={byContext} emptyLabel={t("emptyBreakdown")} />
      </div>

      <div className='flex flex-wrap items-end gap-4'>
        <label className='flex flex-col gap-1 text-sm font-medium text-muted-foreground'>
          {t("fields.recommendationType")}
          <select
            className={selectClass}
            value={filter.type}
            onChange={(event) => setFilter((prev) => ({ ...prev, type: event.target.value }))}>
            <option value='ALL'>{t("all")}</option>
            {RECOMMENDATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {tTypes(type)}
              </option>
            ))}
          </select>
        </label>
        <label className='flex flex-col gap-1 text-sm font-medium text-muted-foreground'>
          {t("fields.context")}
          <select
            className={selectClass}
            value={filter.context}
            onChange={(event) => setFilter((prev) => ({ ...prev, context: event.target.value }))}>
            <option value='ALL'>{t("all")}</option>
            {RECOMMENDATION_CONTEXTS.map((context) => (
              <option key={context} value={context}>
                {tContexts(context)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DataTable
        data={data}
        columns={columns}
        className='py-2'
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />

      <Modal
        size='lg'
        title={modal.item ? t("editTitle") : t("createTitle")}
        open={modal.open}
        onOpenChange={(open) => {
          if (!open) setModal({ open: false, item: null });
        }}
        hideDefaultFooter={true}>
        {modal.open ? (
          <RecommendationForm
            item={modal.item}
            products={products}
            handleClose={() => setModal({ open: false, item: null })}
          />
        ) : null}
      </Modal>
    </section>
  );
};
