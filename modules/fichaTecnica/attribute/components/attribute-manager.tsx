/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { HiOutlineAdjustmentsHorizontal, HiOutlineListBullet, HiOutlineSwatch } from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { AttributeForm } from "./form";
import { ATTRIBUTE_DATA_TYPES, type AttributeDataType, type IAttribute, type INamedItem } from "../models/attribute.interface";
import { deleteAttributeServerAction } from "@/app/[locale]/fichaTecnica/attributes/actions";

interface IAttributeManagerProps {
  initialData: IAttribute[];
  units: INamedItem[];
}

/** Atributos del catálogo: tipo de dato, unidad y opciones (ejes de variante). */
export const AttributeManager = ({ initialData, units }: IAttributeManagerProps) => {
  const t = useTranslations("Administre.attribute");
  const tCrud = useTranslations("Crud");

  const typeLabel = (row: IAttribute) =>
    ATTRIBUTE_DATA_TYPES.includes(row.data_type as AttributeDataType)
      ? t(`types.${row.data_type as AttributeDataType}`)
      : (row.data_type ?? "—");

  const columns = useMemo<GridColumn<IAttribute>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name ?? "",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => (
          <div className='min-w-0'>
            <span className='font-semibold text-foreground'>{row.original.name ?? "—"}</span>
            <p className='font-mono text-xs text-muted-foreground'>{row.original.code}</p>
          </div>
        ),
      },
      {
        id: "data_type",
        header: t("fields.dataType"),
        enableSorting: false,
        meta: { label: t("fields.dataType"), exportValue: (row) => typeLabel(row) },
        cell: ({ row }) => <Badge variant='outline'>{typeLabel(row.original)}</Badge>,
      },
      {
        id: "unit",
        header: t("fields.unitId"),
        enableSorting: false,
        meta: { label: t("fields.unitId"), exportValue: (row) => row.unit_name ?? "" },
        cell: ({ row }) => row.original.unit_name || "—",
      },
      {
        id: "options",
        header: t("fields.options"),
        enableSorting: false,
        meta: {
          label: t("fields.options"),
          exportValue: (row) => (row.options ?? []).map((option) => option.value).join(", "),
        },
        cell: ({ row }) => {
          const options = row.original.options ?? [];
          if (options.length === 0) return "—";
          const shown = options.slice(0, 4).map((option) => option.value).join(", ");
          return (
            <span className='text-sm'>
              {shown}
              {options.length > 4 ? ` ${t("moreOptions", { count: options.length - 4 })}` : ""}
            </span>
          );
        },
      },
      {
        id: "in_use",
        header: t("fields.inUse"),
        enableSorting: false,
        meta: { label: t("fields.inUse"), exportValue: (row) => (row.in_use ? t("inUse") : t("notInUse")) },
        cell: ({ row }) =>
          row.original.in_use ? <Badge variant='secondary'>{t("inUse")}</Badge> : <span className='text-muted-foreground'>{t("notInUse")}</span>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const filters: GridFilter<IAttribute>[] = [
    {
      id: "data_type",
      label: t("fields.dataType"),
      options: ATTRIBUTE_DATA_TYPES.map((type) => ({ value: type, label: t(`types.${type}`) })),
      accessor: (row) => row.data_type,
    },
  ];

  const stats = [
    { label: t("total"), value: initialData.length, icon: HiOutlineAdjustmentsHorizontal },
    {
      label: t("optionAttributes"),
      value: initialData.filter((item) => item.data_type === "OPTION").length,
      icon: HiOutlineSwatch,
      hint: t("optionAttributesHint"),
    },
    {
      label: t("unused"),
      value: initialData.filter((item) => !item.in_use).length,
      icon: HiOutlineListBullet,
    },
  ];

  return (
    <CrudManager<IAttribute>
      gridId='atributos'
      namespace='Administre.attribute'
      icon={HiOutlineAdjustmentsHorizontal}
      eyebrow={tCrud("domains.specs")}
      data={initialData}
      columns={columns}
      filters={filters}
      stats={stats}
      rowLabel={(row) => row.name ?? `#${row.id}`}
      searchPlaceholder={t("searchPlaceholder")}
      searchText={(row) =>
        `${row.name ?? ""} ${row.code ?? ""} ${(row.options ?? []).map((option) => option.value).join(" ")}`
      }
      renderForm={(item, close) => <AttributeForm item={item} units={units} handleClose={close} />}
      onDelete={(id) => deleteAttributeServerAction(id)}
    />
  );
};
