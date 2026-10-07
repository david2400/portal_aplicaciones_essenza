/** @format */

"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { TabsContent } from "@repo/ui/tabs/scenes/tabs";
import { HiOutlineCube } from "react-icons/hi2";
import { statusOf, type IProduct, type ProductStatus } from "../models/product.interface";
import type { IAttributeDefinition, IProductTemplateDefinition } from "../models/product-attributes.interface";
import {
  isEditorTab,
  type EditorTab,
  type IComboItem,
  type INamedItem,
  type IProductImage,
  type IProductVariant,
  type IStockLevel,
  type IStockReservation,
} from "../models/product-editor.interface";
import type { IUnit } from "@/shared/units/units";
import { UpdateProduct } from "../components/form";
import { ProductAttributesEditor } from "../components/product-attributes-editor";
import { VariantsTab } from "../components/editor/variants-tab";
import { ImagesTab } from "../components/editor/images-tab";
import { StockTab } from "../components/editor/stock-tab";
import { ComboTab } from "../components/editor/combo-tab";
import { ProductEditorLayout, type EditorTabItem } from "../components/editor/product-editor-layout";

const STATUS_VARIANT: Record<ProductStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  INACTIVE: "outline",
  ARCHIVED: "destructive",
};

export interface IProductEditorProps {
  product: IProduct;
  variants: IProductVariant[];
  images: IProductImage[];
  levels: IStockLevel[];
  reservations: IStockReservation[];
  warehouses: INamedItem[];
  templates: IProductTemplateDefinition[];
  attributes: IAttributeDefinition[];
  comboItems: IComboItem[];
  /** Unidades activas (medidas y contenido neto). */
  units?: IUnit[];
}

/**
 * Editor de producto por pestañas (Fase 6): datos generales, variantes y SKUs, ficha
 * técnica, imágenes, stock por bodega y, si es combo, sus componentes. La pestaña
 * activa vive en la URL (`?tab=`) para poder enlazarla y conservarla al refrescar.
 */
export const ProductEditor = ({
  product,
  variants,
  images,
  levels,
  reservations,
  warehouses,
  templates,
  attributes,
  comboItems,
  units = [],
}: IProductEditorProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Administre.productEditor");
  const tProduct = useTranslations("Administre.product");

  const isCombo = Boolean(product.is_combo);
  const requested = searchParams.get("tab");
  const initial: EditorTab = isEditorTab(requested) && (requested !== "combo" || isCombo) ? requested : "general";
  const [tab, setTab] = useState<EditorTab>(initial);

  const changeTab = (value: string) => {
    if (!isEditorTab(value)) return;
    setTab(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "general") params.delete("tab");
    else params.set("tab", value);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const status = statusOf(product);
  const tabs: EditorTabItem[] = [
    { id: "general", label: t("tabs.general") },
    { id: "variants", label: t("tabs.variants"), count: variants.length || undefined },
    { id: "specs", label: t("tabs.specs") },
    { id: "images", label: t("tabs.images"), count: images.filter((image) => image.sku_id == null).length || undefined },
    { id: "stock", label: t("tabs.stock") },
    ...(isCombo ? [{ id: "combo" as const, label: t("tabs.combo"), count: comboItems.length || undefined }] : []),
  ];

  return (
    <ProductEditorLayout
      title={product.name ?? `#${product.id}`}
      description={[`#${product.id}`, product.slug ? `/${product.slug}` : null, t(`types.${product.product_type ?? "SIMPLE"}`)]
        .filter(Boolean)
        .join(" · ")}
      icon={HiOutlineCube}
      actions={<Badge variant={STATUS_VARIANT[status]}>{tProduct(`statuses.${status}`)}</Badge>}
      tabs={tabs}
      tab={tab}
      onTabChange={changeTab}>
      <TabsContent value='general'>
        <UpdateProduct product={product} units={units} />
      </TabsContent>
      <TabsContent value='variants'>
        <VariantsTab product={product} variants={variants} units={units} />
      </TabsContent>
      <TabsContent value='specs'>
        {product.id != null && tab === "specs" ? (
          <ProductAttributesEditor productId={product.id} templates={templates} attributes={attributes} />
        ) : null}
      </TabsContent>
      <TabsContent value='images'>
        {product.id != null ? (
          <ImagesTab key={images.map((image) => image.id).join(",")} productId={product.id} images={images} variants={variants} />
        ) : null}
      </TabsContent>
      <TabsContent value='stock'>
        <StockTab product={product} levels={levels} reservations={reservations} warehouses={warehouses} />
      </TabsContent>
      {isCombo && product.id != null ? (
        <TabsContent value='combo'>
          <ComboTab comboId={product.id} items={comboItems} />
        </TabsContent>
      ) : null}
    </ProductEditorLayout>
  );
};
