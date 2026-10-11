/** @format */

"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { HiOutlineAdjustmentsHorizontal, HiOutlineArrowLeft, HiOutlinePlusCircle } from "react-icons/hi2";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/shared/i18n/routing";
import type { IUnit } from "@/shared/units/units";
import { ATTRIBUTES_HREF, RegisterAttribute, UpdateAttribute } from "../components/form";
import { ATTRIBUTE_DATA_TYPES, type AttributeDataType, type IAttribute, type IAttributeUsage } from "../models/attribute.interface";

const EditorShell = ({
  title,
  description,
  icon,
  actions,
  children,
}: {
  title: string;
  description?: string;
  icon: typeof HiOutlineAdjustmentsHorizontal;
  actions?: ReactNode;
  children: ReactNode;
}) => {
  const te = useTranslations("Administre.attribute.editor");
  const tCrud = useTranslations("Crud");
  return (
    <section className='flex w-full flex-col gap-6'>
      <Link
        href={ATTRIBUTES_HREF}
        className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {te("back")}
      </Link>
      <PageHeader title={title} description={description} icon={icon} eyebrow={tCrud("domains.specs")} actions={actions} />
      <div className='rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6'>{children}</div>
    </section>
  );
};

/** Alta de atributo en su propia ruta, con la misma estructura que la edición. */
export const AttributeCreate = ({ units }: { units: IUnit[] }) => {
  const t = useTranslations("Administre.attribute");
  const te = useTranslations("Administre.attribute.editor");
  return (
    <EditorShell title={t("createTitle")} description={te("createDescription")} icon={HiOutlinePlusCircle}>
      <RegisterAttribute units={units} />
    </EditorShell>
  );
};

/** Edición de atributo: formulario por secciones, vista previa y dónde se usa. */
export const AttributeEditor = ({
  attribute,
  usage,
  units,
}: {
  attribute: IAttribute;
  usage: IAttributeUsage | null;
  units: IUnit[];
}) => {
  const t = useTranslations("Administre.attribute");
  const type = attribute.data_type as AttributeDataType | undefined;
  const typeLabel = type && ATTRIBUTE_DATA_TYPES.includes(type) ? t(`types.${type}`) : null;
  return (
    <EditorShell
      title={attribute.name ?? `#${attribute.id}`}
      description={[`#${attribute.id}`, attribute.code, typeLabel].filter(Boolean).join(" · ")}
      icon={HiOutlineAdjustmentsHorizontal}
      actions={
        attribute.in_use ? <Badge variant='secondary'>{t("inUse")}</Badge> : <Badge variant='outline'>{t("notInUse")}</Badge>
      }>
      <UpdateAttribute attribute={attribute} usage={usage} units={units} />
    </EditorShell>
  );
};
