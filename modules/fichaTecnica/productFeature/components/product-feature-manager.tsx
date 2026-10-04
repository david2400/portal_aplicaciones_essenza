/** @format */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { HiOutlineAdjustmentsHorizontal, HiOutlineCube, HiOutlineListBullet } from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { notify } from "@/components/notifications";
import type { ActionResult } from "@/shared/models/pagination";
import { FormProductFeature } from "../scenes/formProductFeature";
import { validationProductFeature } from "../schemas/product-feature.schema";
import type { IFeatureOption, INamedItem, IProductFeature } from "../models/product-feature.interface";
import {
  createProductFeatureServerAction,
  deleteProductFeatureServerAction,
  updateProductFeatureServerAction,
} from "@/app/[locale]/fichaTecnica/product-features/actions";

interface IProductFeatureManagerProps {
  initialData: IProductFeature[];
  products: INamedItem[];
  features: IFeatureOption[];
}

/** Clave compuesta (producto, característica) codificada en un `id` sintético. */
const KEY_FACTOR = 1_000_000;
type Row = IProductFeature & { id?: number };
const toId = (row: IProductFeature) =>
  row.productId != null && row.featureId != null ? row.productId * KEY_FACTOR + row.featureId : undefined;

/** Valores de la ficha técnica por producto (p. ej. "Volumen: 100 ml"). */
export const ProductFeatureManager = ({ initialData, products, features }: IProductFeatureManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.productFeature");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");
  const validationSchema = validationProductFeature();

  const data = useMemo<Row[]>(() => initialData.map((row) => ({ ...row, id: toId(row) })), [initialData]);
  const productNames = useMemo(() => new Map(products.map((p) => [p.id ?? -1, p.name ?? `#${p.id}`])), [products]);
  const featureById = useMemo(() => new Map(features.map((f) => [f.id ?? -1, f])), [features]);

  const productOptions = useMemo(
    () => products.filter((p) => p.id != null).map((p) => ({ id: String(p.id), value: String(p.id), label: p.name ?? `#${p.id}` })),
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

  const productLabel = (row: Row) => productNames.get(row.productId ?? -1) ?? `#${row.productId}`;
  const featureLabel = (row: Row) => featureById.get(row.featureId ?? -1)?.name ?? `#${row.featureId}`;
  const valueLabel = (row: Row) => {
    const unit = featureById.get(row.featureId ?? -1)?.unitName;
    return `${row.value ?? "—"}${unit ? ` ${unit}` : ""}`;
  };

  const columns = useMemo<GridColumn<Row>[]>(
    () => [
      {
        id: "productId",
        header: t("fields.productId"),
        meta: { label: t("fields.productId"), hideable: false, exportValue: (row) => productLabel(row) },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{productLabel(row.original)}</span>,
      },
      {
        id: "featureId",
        header: t("fields.featureId"),
        meta: { label: t("fields.featureId"), exportValue: (row) => featureLabel(row) },
        cell: ({ row }) => featureLabel(row.original),
      },
      {
        id: "value",
        header: t("fields.value"),
        meta: { label: t("fields.value"), align: "right", exportValue: (row) => valueLabel(row) },
        cell: ({ row }) => <span className='tabular-nums'>{valueLabel(row.original)}</span>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productNames, featureById, t],
  );

  const filters: GridFilter<Row>[] = [
    { id: "productId", label: t("fields.productId"), options: productOptions.map(({ value, label }) => ({ value, label })), accessor: (row) => row.productId },
    { id: "featureId", label: t("fields.featureId"), options: featureOptions.map(({ value, label }) => ({ value, label })), accessor: (row) => row.featureId },
  ];

  const productsWithSpecs = new Set(initialData.map((row) => row.productId)).size;

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
      gridId='valores-por-producto'
      namespace='Administre.productFeature'
      icon={HiOutlineListBullet}
      eyebrow={tCrud("domains.specs")}
      data={data}
      columns={columns}
      filters={filters}
      stats={[
        { label: t("total"), value: initialData.length, icon: HiOutlineListBullet },
        {
          label: tCrud("productsWithSpecs"),
          value: `${productsWithSpecs}/${products.length}`,
          icon: HiOutlineCube,
          tone: productsWithSpecs < products.length ? "warning" : "success",
          hint: tCrud("productsWithSpecsHint"),
        },
        { label: tCrud("featuresInCatalog"), value: features.length, icon: HiOutlineAdjustmentsHorizontal },
      ]}
      rowLabel={(row) => `${productLabel(row)} · ${featureLabel(row)}`}
      searchText={(row) => `${productLabel(row)} ${featureLabel(row)} ${row.value ?? ""}`}
      renderForm={(item, close) => (
        <FormProductFeature
          initialValues={{
            productId: item?.productId != null ? String(item.productId) : "",
            featureId: item?.featureId != null ? String(item.featureId) : "",
            value: item?.value ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values: { productId: number; featureId: number; value: number }) =>
            item
              ? save(await updateProductFeatureServerAction(values), tCommon("updatedSuccess"), close)
              : save(await createProductFeatureServerAction(values), tCommon("createdSuccess"), close)
          }
          products={productOptions}
          features={featureOptions}
          lockKeys={item !== null}
        />
      )}
      onDelete={(id) => deleteProductFeatureServerAction(Math.floor(id / KEY_FACTOR), id % KEY_FACTOR)}
    />
  );
};
