/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { HiOutlinePlusCircle } from "react-icons/hi2";
import type { IUnit } from "@/shared/units/units";
import { RegisterProduct } from "../components/form";
import { ProductEditorLayout, type EditorTabItem } from "../components/editor/product-editor-layout";

/**
 * Alta de producto en su propia ruta (`/catalogo/products/new`), con la misma
 * estructura que el editor: solo "General" está activa hasta guardar; al crear
 * se continúa en el editor con el resto de pestañas.
 */
export const ProductCreate = ({ units = [] }: { units?: IUnit[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.product");
  const tEditor = useTranslations("Administre.productEditor");

  const tabs: EditorTabItem[] = [
    { id: "general", label: tEditor("tabs.general") },
    { id: "variants", label: tEditor("tabs.variants"), disabled: true },
    { id: "specs", label: tEditor("tabs.specs"), disabled: true },
    { id: "images", label: tEditor("tabs.images"), disabled: true },
    { id: "stock", label: tEditor("tabs.stock"), disabled: true },
  ];

  return (
    <ProductEditorLayout
      title={t("createTitle")}
      description={tEditor("createDescription")}
      icon={HiOutlinePlusCircle}
      actions={<Badge variant='secondary'>{tEditor("newBadge")}</Badge>}
      tabs={tabs}
      tab='general'
      notice={tEditor("createNotice")}>
      <RegisterProduct units={units} onCreated={(id) => router.replace(`/catalogo/products/${id}`)} />
    </ProductEditorLayout>
  );
};
