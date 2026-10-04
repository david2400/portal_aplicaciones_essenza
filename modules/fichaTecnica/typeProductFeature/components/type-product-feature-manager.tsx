/** @format */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { HiOutlineAdjustmentsHorizontal, HiOutlineRectangleStack, HiOutlineSwatch } from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { notify } from "@/components/notifications";
import type { ActionResult } from "@/shared/models/pagination";
import { FormTypeProductFeature } from "../scenes/formTypeProductFeature";
import { validationTypeProductFeature } from "../schemas/type-product-feature.schema";
import type { INamedItem, ITypeProductFeature } from "../models/type-product-feature.interface";
import {
  createTypeProductFeatureServerAction,
  deleteTypeProductFeatureServerAction,
  updateTypeProductFeatureServerAction,
} from "@/app/[locale]/fichaTecnica/type-product-features/actions";

interface ITypeProductFeatureManagerProps {
  initialData: ITypeProductFeature[];
  typeProducts: INamedItem[];
  features: INamedItem[];
}

/** Fila con `id` sintético: el backend identifica la relación por `typeProductId`. */
type Row = ITypeProductFeature & { id?: number };

const toOptions = (items: INamedItem[]) =>
  items
    .filter((item) => item.id != null)
    .map((item) => ({ id: String(item.id), value: String(item.id), label: item.name ?? `#${item.id}` }));

const toLookup = (items: INamedItem[]) => new Map(items.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`]));

/** Características asignadas a cada tipo de producto (una por tipo en el backend actual). */
export const TypeProductFeatureManager = ({ initialData, typeProducts, features }: ITypeProductFeatureManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.typeProductFeature");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");
  const validationSchema = validationTypeProductFeature();

  const data = useMemo<Row[]>(() => initialData.map((row) => ({ ...row, id: row.typeProductId })), [initialData]);
  const typeOptions = useMemo(() => toOptions(typeProducts), [typeProducts]);
  const featureOptions = useMemo(() => toOptions(features), [features]);
  const typeNames = useMemo(() => toLookup(typeProducts), [typeProducts]);
  const featureNames = useMemo(() => toLookup(features), [features]);

  const typeLabel = (row: Row) => row.typeProductName ?? typeNames.get(row.typeProductId ?? -1) ?? `#${row.typeProductId}`;
  const featureLabel = (row: Row) => row.featureName ?? featureNames.get(row.featureId ?? -1) ?? `#${row.featureId}`;

  const columns = useMemo<GridColumn<Row>[]>(
    () => [
      {
        id: "typeProductId",
        header: t("fields.typeProductId"),
        meta: { label: t("fields.typeProductId"), hideable: false, exportValue: (row) => typeLabel(row) },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{typeLabel(row.original)}</span>,
      },
      {
        id: "featureId",
        header: t("fields.featureId"),
        meta: { label: t("fields.featureId"), exportValue: (row) => featureLabel(row) },
        cell: ({ row }) => <Badge variant='secondary'>{featureLabel(row.original)}</Badge>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typeNames, featureNames, t],
  );

  const filters: GridFilter<Row>[] = [
    {
      id: "featureId",
      label: t("fields.featureId"),
      options: featureOptions.map(({ value, label }) => ({ value, label })),
      accessor: (row) => row.featureId,
    },
  ];

  const assignedTypes = new Set(initialData.map((row) => row.typeProductId)).size;

  const save = async (result: ActionResult, title: string, close: () => void) => {
    if (result.success) {
      notify.success(title);
      close();
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error);
    }
  };

  return (
    <CrudManager<Row>
      gridId='caracteristicas-por-tipo'
      namespace='Administre.typeProductFeature'
      icon={HiOutlineRectangleStack}
      eyebrow={tCrud("domains.specs")}
      data={data}
      columns={columns}
      filters={filters}
      stats={[
        { label: t("total"), value: initialData.length, icon: HiOutlineRectangleStack },
        {
          label: tCrud("typesWithFeature"),
          value: `${assignedTypes}/${typeProducts.length}`,
          icon: HiOutlineSwatch,
          tone: assignedTypes < typeProducts.length ? "warning" : "success",
        },
        { label: tCrud("featuresInCatalog"), value: features.length, icon: HiOutlineAdjustmentsHorizontal },
      ]}
      rowLabel={(row) => `${typeLabel(row)} · ${featureLabel(row)}`}
      searchText={(row) => `${typeLabel(row)} ${featureLabel(row)}`}
      renderForm={(item, close) => (
        <FormTypeProductFeature
          initialValues={{
            typeProductId: item?.typeProductId != null ? String(item.typeProductId) : "",
            featureId: item?.featureId != null ? String(item.featureId) : "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values: { typeProductId: number; featureId: number }) =>
            item
              ? save(await updateTypeProductFeatureServerAction(values), tCommon("updatedSuccess"), close)
              : save(await createTypeProductFeatureServerAction(values), tCommon("createdSuccess"), close)
          }
          typeProducts={typeOptions}
          features={featureOptions}
          lockTypeProduct={item !== null}
        />
      )}
      onDelete={(typeProductId) => deleteTypeProductFeatureServerAction(typeProductId)}
    />
  );
};
