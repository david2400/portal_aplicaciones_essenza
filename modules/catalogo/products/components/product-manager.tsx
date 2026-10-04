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
  HiOutlineCube,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineCheckBadge,
  HiOutlineArchiveBox,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { RegisterProduct, UpdateProduct } from "./form";
import type { IProduct } from "../models/product.interface";
import { deleteProductServerAction } from "@/app/[locale]/catalogo/products/actions";

type NamedItem = { id?: number; name?: string };

const toLookup = (items: NamedItem[]) =>
  new Map(items.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`]));

const toOptions = (items: NamedItem[]) =>
  items
    .filter((item) => item.id != null)
    .map((item) => ({
      id: String(item.id),
      value: String(item.id),
      label: item.name ?? `#${item.id}`,
    }));

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatMoney = (value?: number) => (value == null ? "—" : moneyFormatter.format(value));

interface IProductManagerProps {
  initialData: IProduct[];
  brands: NamedItem[];
  categories: NamedItem[];
  subcategories: NamedItem[];
  suppliers: NamedItem[];
}

const rowLabel = (row: IProduct) => row.name ?? `#${row.id}`;

export const ProductManager = ({ initialData, brands, categories, subcategories, suppliers }: IProductManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.product");
  const tCommon = useTranslations("Administre.common");

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<IProduct | null>(null);

  const lookups = useMemo(
    () => ({
      brands: toLookup(brands),
      categories: toLookup(categories),
      subcategories: toLookup(subcategories),
      suppliers: toLookup(suppliers),
    }),
    [brands, categories, subcategories, suppliers],
  );

  const formOptions = useMemo(
    () => ({
      brands: toOptions(brands),
      categories: toOptions(categories),
      subcategories: toOptions(subcategories),
      suppliers: toOptions(suppliers),
    }),
    [brands, categories, subcategories, suppliers],
  );

  const metrics = useMemo(
    () => ({
      total: initialData.length,
      active: initialData.filter((item) => !item.deleted).length,
      available: initialData.filter((item) => item.available).length,
      stock: initialData.reduce((acc, item) => acc + (item.stock ?? 0), 0),
    }),
    [initialData],
  );

  const handleDelete = (row: IProduct) => {
    if (row.id == null) return;
    const id = row.id;

    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: rowLabel(row) }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const response = await deleteProductServerAction(id);
      if (response.success) {
        Swal.fire({
          title: tCommon("deletedSuccess"),
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        router.refresh();
      } else {
        Swal.fire({
          title: tCommon("errorTitle"),
          text: response.error || tCommon("unexpectedError"),
          icon: "error",
        });
      }
    });
  };

  const columns: ColumnDef<IProduct>[] = [
    {
      accessorKey: "name",
      header: t("fields.name"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>{row.original.name}</span>
      ),
    },
    {
      accessorKey: "brandId",
      header: t("fields.brandId"),
      cell: ({ row }) => lookups.brands.get(row.original.brandId ?? -1) ?? "—",
    },
    {
      accessorKey: "categoryId",
      header: t("fields.categoryId"),
      cell: ({ row }) => lookups.categories.get(row.original.categoryId ?? -1) ?? "—",
    },
    {
      accessorKey: "stock",
      header: t("fields.stock"),
      cell: ({ row }) => row.original.stock ?? "—",
    },
    {
      accessorKey: "unitPrice",
      header: t("fields.unitPrice"),
      cell: ({ row }) => formatMoney(row.original.unitPrice),
    },
    {
      accessorKey: "available",
      header: t("fields.available"),
      cell: ({ row }) => (
        <Badge variant={row.original.available ? "default" : "outline"}>
          {row.original.available ? tCommon("yes") : tCommon("no")}
        </Badge>
      ),
    },
    {
      id: "status",
      header: tCommon("status"),
      cell: ({ row }) => (
        <Badge variant={row.original.deleted ? "destructive" : "default"}>
          {row.original.deleted ? tCommon("inactive") : tCommon("active")}
        </Badge>
      ),
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
            onClick={() => setEditing(row.original)}>
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

  const summaryCards = [
    { icon: HiOutlineCube, label: t("total"), value: metrics.total },
    { icon: HiOutlineCheckCircle, label: tCommon("activeCount"), value: metrics.active },
    { icon: HiOutlineCheckBadge, label: t("availableCount"), value: metrics.available },
    { icon: HiOutlineArchiveBox, label: t("stockTotal"), value: metrics.stock },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineCube className='h-7 w-7 text-primary' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
            <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
          </div>
        </div>
        <Buttons
          className='inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm'
          onClick={() => setOpenCreate(true)}>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Buttons>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
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

      <DataTable
        data={initialData}
        columns={columns}
        className='py-2'
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />

      <Modal
        size='lg'
        title={t("createTitle")}
        open={openCreate}
        onOpenChange={setOpenCreate}
        hideDefaultFooter={true}>
        <RegisterProduct
          handleClose={() => setOpenCreate(false)}
          options={formOptions}
        />
      </Modal>

      <Modal
        size='lg'
        title={t("editTitle")}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        hideDefaultFooter={true}>
        <UpdateProduct
          initialValues={editing}
          handleClose={() => setEditing(null)}
          options={formOptions}
        />
      </Modal>
    </section>
  );
};
