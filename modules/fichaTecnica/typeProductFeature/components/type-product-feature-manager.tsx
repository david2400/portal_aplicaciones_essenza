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
  HiOutlineRectangleStack,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { FormTypeProductFeature } from "../scenes/formTypeProductFeature";
import { validationTypeProductFeature } from "../schemas/type-product-feature.schema";
import type { INamedItem, ITypeProductFeature } from "../models/type-product-feature.interface";
import {
  createTypeProductFeatureServerAction,
  updateTypeProductFeatureServerAction,
  deleteTypeProductFeatureServerAction,
} from "@/app/[locale]/fichaTecnica/type-product-features/actions";

interface ITypeProductFeatureManagerProps {
  initialData: ITypeProductFeature[];
  typeProducts: INamedItem[];
  features: INamedItem[];
}

const toOptions = (items: INamedItem[]) =>
  items
    .filter((item) => item.id != null)
    .map((item) => ({ id: String(item.id), value: String(item.id), label: item.name ?? `#${item.id}` }));

const toLookup = (items: INamedItem[]) => new Map(items.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`]));

type ModalState = { open: boolean; row: ITypeProductFeature | null };

export const TypeProductFeatureManager = ({
  initialData,
  typeProducts,
  features,
}: ITypeProductFeatureManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.typeProductFeature");
  const tCommon = useTranslations("Administre.common");
  const validationSchema = validationTypeProductFeature();
  const [modal, setModal] = useState<ModalState>({ open: false, row: null });

  const typeOptions = useMemo(() => toOptions(typeProducts), [typeProducts]);
  const featureOptions = useMemo(() => toOptions(features), [features]);
  const typeNames = useMemo(() => toLookup(typeProducts), [typeProducts]);
  const featureNames = useMemo(() => toLookup(features), [features]);

  const typeLabel = (row: ITypeProductFeature) =>
    row.typeProductName ?? typeNames.get(row.typeProductId ?? -1) ?? `#${row.typeProductId}`;
  const featureLabel = (row: ITypeProductFeature) =>
    row.featureName ?? featureNames.get(row.featureId ?? -1) ?? `#${row.featureId}`;

  const notify = async (result: { success: boolean; error?: string }, title: string) => {
    if (result.success) {
      await Swal.fire({ title, icon: "success", timer: 2000, showConfirmButton: false });
      setModal({ open: false, row: null });
      router.refresh();
    } else {
      Swal.fire({ title: tCommon("errorTitle"), text: result.error || tCommon("unexpectedError"), icon: "error" });
    }
  };

  const handleSubmit = async (values: { typeProductId: number; featureId: number }) => {
    if (modal.row) {
      await notify(await updateTypeProductFeatureServerAction(values), tCommon("updatedSuccess"));
    } else {
      await notify(await createTypeProductFeatureServerAction(values), tCommon("createdSuccess"));
    }
  };

  const handleDelete = (row: ITypeProductFeature) => {
    if (row.typeProductId == null) return;
    const typeProductId = row.typeProductId;
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: `${typeLabel(row)} · ${featureLabel(row)}` }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteTypeProductFeatureServerAction(typeProductId);
      if (response.success) router.refresh();
      else Swal.fire({ title: tCommon("errorTitle"), text: response.error, icon: "error" });
    });
  };

  const columns: ColumnDef<ITypeProductFeature>[] = [
    {
      accessorKey: "typeProductId",
      header: t("fields.typeProductId"),
      cell: ({ row }) => <span className='font-semibold text-foreground'>{typeLabel(row.original)}</span>,
    },
    { accessorKey: "featureId", header: t("fields.featureId"), cell: ({ row }) => featureLabel(row.original) },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const name = `${typeLabel(row.original)} · ${featureLabel(row.original)}`;
        return (
          <div className='flex gap-2'>
            <Buttons
              size='sm'
              variant='outline'
              aria-label={tCommon("editAria", { name })}
              onClick={() => setModal({ open: true, row: row.original })}>
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

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineRectangleStack className='h-7 w-7 text-primary' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
            <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
          </div>
        </div>
        <Buttons
          className='inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm'
          onClick={() => setModal({ open: true, row: null })}>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Buttons>
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        className='py-2'
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />

      <Modal
        size='lg'
        title={modal.row ? t("editTitle") : t("createTitle")}
        open={modal.open}
        onOpenChange={(open) => {
          if (!open) setModal({ open: false, row: null });
        }}
        hideDefaultFooter={true}>
        {modal.open ? (
          <FormTypeProductFeature
            initialValues={{
              typeProductId: modal.row?.typeProductId != null ? String(modal.row.typeProductId) : "",
              featureId: modal.row?.featureId != null ? String(modal.row.featureId) : "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            typeProducts={typeOptions}
            features={featureOptions}
            lockTypeProduct={modal.row !== null}
          />
        ) : null}
      </Modal>
    </section>
  );
};
