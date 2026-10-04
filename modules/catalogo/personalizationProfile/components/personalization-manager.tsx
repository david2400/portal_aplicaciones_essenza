/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineEye,
  HiOutlineFaceSmile,
  HiOutlineExclamationTriangle,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { BreakdownList } from "@/components/breakdown-list";
import { PersonalizationProfileForm } from "./form";
import { ProfileViewer } from "./profile-viewer";
import { SegmentBadge } from "./segment-badge";
import { SEGMENTS, formatDateTime, type Segment } from "../constants";
import type { IPersonalizationProfile } from "../models/personalizationProfile.interface";
import { deleteProfileServerAction } from "@/app/[locale]/administre/personalization/actions";

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; profile: IPersonalizationProfile }
  | { mode: "view"; profile: IPersonalizationProfile };

export const PersonalizationManager = ({ initialData }: { initialData: IPersonalizationProfile[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.personalization");
  const tSegments = useTranslations("Administre.personalization.segments");
  const tCommon = useTranslations("Administre.common");

  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [segment, setSegment] = useState<Segment | "ALL">("ALL");

  const data = useMemo(
    () =>
      initialData
        .filter((profile) => segment === "ALL" || profile.segment === segment)
        .sort((a, b) => (b.personalizationScore ?? 0) - (a.personalizationScore ?? 0)),
    [initialData, segment],
  );

  const metrics = useMemo(() => {
    const scores = initialData
      .map((profile) => profile.personalizationScore)
      .filter((value): value is number => value != null);
    return {
      total: initialData.length,
      avgScore: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      vip: initialData.filter((profile) => profile.segment === "VIP").length,
      churning: initialData.filter((profile) => profile.segment === "CHURNING").length,
    };
  }, [initialData]);

  const bySegment = useMemo(
    () =>
      SEGMENTS.map((value) => ({
        key: value,
        label: tSegments(value),
        value: initialData.filter((profile) => profile.segment === value).length,
      })),
    [initialData, tSegments],
  );

  const close = () => setModal({ mode: "closed" });

  const handleDelete = (profile: IPersonalizationProfile) => {
    if (profile.id == null) return;
    const id = profile.id;
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: t("profileLabel", { id: profile.customerId ?? id }) }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteProfileServerAction(id);
      if (response.success) router.refresh();
      else Swal.fire({ title: tCommon("errorTitle"), text: response.error || tCommon("unexpectedError"), icon: "error" });
    });
  };

  const columns: ColumnDef<IPersonalizationProfile>[] = [
    {
      accessorKey: "customerId",
      header: t("fields.customerId"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>#{row.original.customerId ?? "—"}</span>
      ),
    },
    {
      accessorKey: "segment",
      header: t("fields.segment"),
      cell: ({ row }) => <SegmentBadge segment={row.original.segment} />,
    },
    {
      accessorKey: "personalizationScore",
      header: t("fields.personalizationScore"),
      cell: ({ row }) => {
        const score = row.original.personalizationScore;
        if (score == null) return "—";
        return (
          <div className='flex items-center gap-2'>
            <div
              className='h-2 w-16 overflow-hidden rounded-full bg-muted'
              role='meter'
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={score}
              aria-label={t("fields.personalizationScore")}>
              <div className='h-full rounded-full bg-primary' style={{ width: `${score * 100}%` }} />
            </div>
            <span className='tabular-nums text-xs text-muted-foreground'>{score.toFixed(2)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("fields.status"),
      cell: ({ row }) => row.original.status || "—",
    },
    {
      accessorKey: "lastAnalysisAt",
      header: t("fields.lastAnalysisAt"),
      cell: ({ row }) => formatDateTime(row.original.lastAnalysisAt ?? row.original.updatedAt),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const name = t("profileLabel", { id: row.original.customerId ?? row.original.id ?? "—" });
        return (
          <div className='flex gap-2'>
            <Buttons
              size='sm'
              variant='outline'
              aria-label={t("viewAria", { name })}
              onClick={() => setModal({ mode: "view", profile: row.original })}>
              <HiOutlineEye className='h-4 w-4' aria-hidden='true' />
              {t("view")}
            </Buttons>
            <Buttons
              size='sm'
              variant='outline'
              aria-label={tCommon("editAria", { name })}
              onClick={() => setModal({ mode: "edit", profile: row.original })}>
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
    { icon: HiOutlineUserGroup, label: t("total"), value: metrics.total },
    { icon: HiOutlineSparkles, label: t("avgScore"), value: metrics.avgScore.toFixed(2) },
    { icon: HiOutlineFaceSmile, label: t("vipCount"), value: metrics.vip },
    { icon: HiOutlineExclamationTriangle, label: t("churningCount"), value: metrics.churning },
  ];

  const filters: Array<Segment | "ALL"> = ["ALL", ...SEGMENTS];

  const modalTitle =
    modal.mode === "create"
      ? t("createTitle")
      : modal.mode === "edit"
        ? t("editTitle")
        : modal.mode === "view"
          ? t("profileLabel", { id: modal.profile.customerId ?? modal.profile.id ?? "—" })
          : "";

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineUserGroup className='h-7 w-7 text-primary' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
            <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
          </div>
        </div>
        <Buttons
          className='inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm'
          onClick={() => setModal({ mode: "create" })}>
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

      <BreakdownList title={t("bySegment")} items={bySegment} emptyLabel={t("emptyBreakdown")} />

      <div role='group' aria-label={t("filterLabel")} className='flex flex-wrap gap-2'>
        {filters.map((value) => (
          <Buttons
            key={value}
            size='sm'
            variant={segment === value ? "default" : "outline"}
            aria-pressed={segment === value}
            onClick={() => setSegment(value)}>
            {value === "ALL" ? t("allSegments") : tSegments(value)}
          </Buttons>
        ))}
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
        title={modalTitle}
        open={modal.mode !== "closed"}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        hideDefaultFooter={true}>
        {modal.mode === "create" ? <PersonalizationProfileForm handleClose={close} /> : null}
        {modal.mode === "edit" ? (
          <PersonalizationProfileForm profile={modal.profile} handleClose={close} />
        ) : null}
        {modal.mode === "view" ? <ProfileViewer profile={modal.profile} /> : null}
      </Modal>
    </section>
  );
};
