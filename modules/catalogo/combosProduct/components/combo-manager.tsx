/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineCube,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineSquare3Stack3D,
  HiOutlineSquares2X2,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataGrid, type BulkAction, type GridColumn, type GridFilter, type RowAction } from "@/components/data-grid";
import { PageHeader } from "@/components/page-header";
import { StatCards } from "@/components/stat-cards";
import { confirm, notify } from "@/components/notifications";
import { RegisterCombo, UpdateCombo } from "./form";
import type { ICombo } from "../models/combo.interface";
import { deleteComboServerAction } from "@/app/[locale]/catalogo/combo/actions";

type NamedItem = { id?: number; name?: string };

const toOptions = (items: NamedItem[]) =>
  items
    .filter((item) => item.id != null)
    .map((item) => ({ id: String(item.id), value: String(item.id), label: item.name ?? `#${item.id}` }));

interface IComboManagerProps {
  initialData: ICombo[];
  products: NamedItem[];
}

/**
 * Componentes de combos. El API no pagina este recurso, así que la tabla
 * trabaja en modo cliente (misma UX: búsqueda, filtros, orden, lote, CSV).
 */
export const ComboManager = ({ initialData, products }: IComboManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.combo");
  const tc = useTranslations("Administre.comboGrid");
  const tCommon = useTranslations("Administre.common");

  const [modal, setModal] = useState<{ open: boolean; item: ICombo | null }>({ open: false, item: null });
  const closeModal = () => setModal({ open: false, item: null });

  const productNames = useMemo(
    () => new Map(products.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`])),
    [products],
  );
  const name = (id?: number) => productNames.get(id ?? -1) ?? (id != null ? `#${id}` : "—");
  const formOptions = useMemo(() => ({ products: toOptions(products) }), [products]);

  const stats = useMemo(() => {
    const combos = new Set(initialData.map((item) => item.combo_id));
    return {
      components: initialData.length,
      combos: combos.size,
      average: combos.size ? (initialData.length / combos.size).toFixed(1) : "0",
    };
  }, [initialData]);

  const label = (row: ICombo) => `${name(row.combo_id)} → ${name(row.product_id)}`;

  const deleteMany = async (rows: ICombo[]) => {
    const ids = rows.map((row) => row.id).filter((id): id is number => id != null);
    const results = await Promise.allSettled(ids.map((id) => deleteComboServerAction(id)));
    const failed = results.filter((result) => result.status === "rejected" || !result.value.success).length;
    if (failed === 0) notify.success(tc("bulkDeleted", { count: ids.length }));
    else notify.warning(tc("bulkPartial", { ok: ids.length - failed, failed }));
    router.refresh();
  };

  const handleDelete = async (row: ICombo) => {
    const ok = await confirm({
      title: tCommon("deleteConfirmTitle"),
      description: tCommon("deleteConfirmText", { name: label(row) }),
      confirmLabel: tCommon("deleteConfirmButton"),
      tone: "danger",
    });
    if (ok) await deleteMany([row]);
  };

  const bulkActions: BulkAction<ICombo>[] = [
    {
      label: tc("deleteSelected"),
      icon: HiOutlineTrash,
      tone: "danger",
      onAction: async (rows) => {
        const ok = await confirm({
          title: tc("bulkConfirmTitle", { count: rows.length }),
          description: tc("bulkConfirmText"),
          confirmLabel: tCommon("deleteConfirmButton"),
          tone: "danger",
        });
        if (ok) await deleteMany(rows);
      },
    },
  ];

  const rowActions = (row: ICombo): RowAction[] => [
    { label: tCommon("edit"), icon: HiOutlinePencilSquare, onSelect: () => setModal({ open: true, item: row }) },
    { label: tCommon("delete"), icon: HiOutlineTrash, tone: "danger", separated: true, onSelect: () => handleDelete(row) },
  ];

  const columns = useMemo<GridColumn<ICombo>[]>(
    () => [
      {
        id: "combo_id",
        header: t("fields.comboId"),
        meta: { label: t("fields.comboId"), hideable: false, exportValue: (row) => name(row.combo_id) },
        cell: ({ row }) => (
          <span className='inline-flex items-center gap-2 font-semibold text-foreground'>
            <HiOutlineSquare3Stack3D className='h-4 w-4 text-primary' aria-hidden='true' />
            {name(row.original.combo_id)}
          </span>
        ),
      },
      {
        id: "product_id",
        header: t("fields.productId"),
        meta: { label: t("fields.productId"), exportValue: (row) => name(row.product_id) },
        cell: ({ row }) => name(row.original.product_id),
      },
      {
        id: "quantity",
        header: t("fields.quantity"),
        meta: { label: t("fields.quantity"), align: "right", exportValue: (row) => row.quantity },
        cell: ({ row }) => <Badge variant='secondary'>× {row.original.quantity ?? 0}</Badge>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productNames, t],
  );

  const comboOptions = useMemo(
    () =>
      [...new Set(initialData.map((item) => item.combo_id).filter((id): id is number => id != null))].map((id) => ({
        value: String(id),
        label: name(id),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialData, productNames],
  );

  const filters: GridFilter<ICombo>[] = [
    { id: "combo_id", label: t("fields.comboId"), options: comboOptions, accessor: (row) => row.combo_id },
  ];

  const createButton = (
    <Buttons onClick={() => setModal({ open: true, item: null })} className='rounded-full'>
      <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
      {t("create")}
    </Buttons>
  );

  return (
    <section className='flex w-full flex-col gap-6'>
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={HiOutlineSquare3Stack3D}
        eyebrow={tc("eyebrow")}
        actions={createButton}
      />

      <div className='flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6'>
        <StatCards
          items={[
            { label: tc("combos"), value: stats.combos, icon: HiOutlineSquare3Stack3D },
            { label: t("total"), value: stats.components, icon: HiOutlineCube },
            { label: tc("average"), value: stats.average, icon: HiOutlineSquares2X2, hint: tc("averageHint") },
          ]}
        />

        <DataGrid<ICombo>
          mode='client'
          embedded
          id='combos'
        caption={t("title")}
        data={initialData}
        columns={columns}
        getRowId={(row) => String(row.id)}
        searchPlaceholder={tc("searchPlaceholder")}
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        exportName='combos'
        emptyState={{ title: t("emptyTitle"), description: t("emptyDescription"), action: createButton }}
      />
      </div>

      <Modal
        size='lg'
        title={modal.item ? t("editTitle") : t("createTitle")}
        open={modal.open}
        onOpenChange={(open) => !open && closeModal()}
        hideDefaultFooter={true}>
        {modal.open ? (
          modal.item ? (
            <UpdateCombo initialValues={modal.item} handleClose={closeModal} options={formOptions} />
          ) : (
            <RegisterCombo handleClose={closeModal} options={formOptions} />
          )
        ) : null}
      </Modal>
    </section>
  );
};
