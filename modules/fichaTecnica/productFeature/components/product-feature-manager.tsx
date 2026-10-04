/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import {
  HiOutlineClipboardDocumentList,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { FormProductFeature } from "../scenes/formProductFeature";
import { validationProductFeature } from "../schemas/product-feature.schema";
import type { IFeatureOption, INamedItem, IProductFeature } from "../models/product-feature.interface";
import {
  createProductFeatureServerAction,
  updateProductFeatureServerAction,
  deleteProductFeatureServerAction,
} from "@/app/[locale]/fichaTecnica/product-features/actions";

interface IProductFeatureManagerProps {
  initialData: IProductFeature[];
  products: INamedItem[];
  features: IFeatureOption[];
}

type ModalState = { open: boolean; row: IProductFeature | null };

const ALL = "all";

export const ProductFeatureManager = ({ initialData, products, features }: IProductFeatureManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.productFeature");
  const tCommon = useTranslations("Administre.common");
  const validationSchema = validationProductFeature();
  const [modal, setModal] = useState<ModalState>({ open: false, row: null });
  const [productFilter, setProductFilter] = useState<string>(ALL);

  const productNames = useMemo(
    () => new Map(products.map((p) => [p.id ?? -1, p.name ?? `#${p.id}`])),
    [products],
  );
  const featureById = useMemo(() => new Map(features.map((f) => [f.id ?? -1, f])), [features]);

  const productOptions = useMemo(
    () =>
      products
        .filter((p) => p.id != null)
        .map((p) => ({ id: String(p.id), value: String(p.id), label: p.name ?? `#${p.id}` })),
    [products],
  );
  const featureOptions = useMemo(
    () =>
      features
        .filter((f) => f.id != null)
        .map((f) => ({
          id: String(f.id),
          value: String(f.id),
          label: f.unitName ? `${f.name} (${f.unitName})` : (f.name ?? `#${f.id}`),
        })),
    [features],
  );

  const data = useMemo(
    () =>
      productFilter === ALL
        ? initialData
        : initialData.filter((row) => String(row.productId) === productFilter),
    [initialData, productFilter],
  );

  const featureLabel = (row: IProductFeature) => featureById.get(row.featureId ?? -1)?.name ?? `#${row.featureId}`;
  const rowLabel = (row: IProductFeature) =>
    `${productNames.get(row.productId ?? -1) ?? `#${row.productId}`} · ${featureLabel(row)}`;

  const notify = async (result: { success: boolean; error?: string }, title: string) => {
    if (result.success) {
      await Swal.fire({ title, icon: "success", timer: 2000, showConfirmButton: false });
      setModal({ open: false, row: null });
      router.refresh();
    } else {
      Swal.fire({ title: tCommon("errorTitle"), text: result.error || tCommon("unexpectedError"), icon: "error" });
    }
  };

  const handleSubmit = async (values: { productId: number; featureId: number; value: number }) => {
    if (modal.row) {
      await notify(await updateProductFeatureServerAction(values), tCommon("updatedSuccess"));
    } else {
      await notify(await createProductFeatureServerAction(values), tCommon("createdSuccess"));
    }
  };

  const handleDelete = (row: IProductFeature) => {
    if (row.productId == null || row.featureId == null) return;
    const { productId, featureId } = row;
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: rowLabel(row) }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteProductFeatureServerAction(productId, featureId);
      if (response.success) router.refresh();
      else Swal.fire({ title: tCommon("errorTitle"), text: response.error, icon: "error" });
    });
  };

  const columns: ColumnDef<IProductFeature>[] = [
    {
      accessorKey: "productId",
      header: t("fields.productId"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>
          {productNames.get(row.original.productId ?? -1) ?? `#${row.original.productId}`}
        </span>
      ),
    },
    { accessorKey: "featureId", header: t("fields.featureId"), cell: ({ row }) => featureLabel(row.original) },
    {
      accessorKey: "value",
      header: t("fields.value"),
      cell: ({ row }) => {
        const unit = featureById.get(row.original.featureId ?? -1)?.unitName;
        return `${row.original.value ?? "—"}${unit ? ` ${unit}` : ""}`;
      },
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex gap-2'>
          <Buttons
            size='sm'
            variant='outline'
            aria-label={tCommon("editAria", { name: rowLabel(row.original) })}
            onClick={() => setModal({ open: true, row: row.original })}>
            <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
            {tCommon("edit")}
          </Buttons>
          <Buttons
            size='sm'
            variant='ghost'
            aria-label={tCommon("deleteAria", { name: rowLabel(row.original) })}
            onClick={() => handleDelete(row.original)}>
            <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
            {tCommon("delete")}
          </Buttons>
        </div>
      ),
    },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineClipboardDocumentList className='h-7 w-7 text-primary' aria-hidden='true' />
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

      <FormSelectField
        id='product-feature-filter'
        label={t("filterLabel")}
        data={[{ id: ALL, value: ALL, label: t("allProducts") }, ...productOptions]}
        value={productFilter}
        onValueChange={setProductFilter}
        searchable
        className='w-full max-w-sm'
        triggerClassName='!w-full'
      />

      <DataTable
        data={data}
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
          <FormProductFeature
            initialValues={{
              productId:
                modal.row?.productId != null
                  ? String(modal.row.productId)
                  : productFilter !== ALL
                    ? productFilter
                    : "",
              featureId: modal.row?.featureId != null ? String(modal.row.featureId) : "",
              value: modal.row?.value ?? "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            products={productOptions}
            features={featureOptions}
            lockKeys={modal.row !== null}
          />
        ) : null}
      </Modal>
    </section>
  );
};
