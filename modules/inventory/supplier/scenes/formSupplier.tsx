/** @format */

"use client";

import { useTranslations } from "next-intl";
import { HiOutlineArrowLeft, HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/shared/i18n/routing";
import { SupplierForm } from "../components/form";
import { SUPPLIERS_HREF, type ISupplier } from "../models/supplier.interface";

/** Alta o edición del proveedor en su propia ruta (`/new` y `/[id]/edit`). */
export const SupplierEditor = ({ supplier }: { supplier?: ISupplier | null }) => {
  const t = useTranslations("Administre.supplier");
  const tf = useTranslations("Administre.supplier.form");
  const tCrud = useTranslations("Crud");
  const isNew = supplier?.id == null;
  return (
    <section className='flex w-full flex-col gap-6'>
      <Link href={isNew ? SUPPLIERS_HREF : `${SUPPLIERS_HREF}/${supplier!.id}`}
        className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {isNew ? tf("back") : tf("backToDetail")}
      </Link>
      <PageHeader
        icon={HiOutlineBuildingOffice2}
        eyebrow={tCrud("domains.inventory")}
        title={isNew ? t("createTitle") : (supplier!.display_name ?? supplier!.name ?? `#${supplier!.id}`)}
        description={isNew ? tf("createDescription") : [supplier!.code, supplier!.document].filter(Boolean).join(" · ")}
      />
      <SupplierForm supplier={supplier} />
    </section>
  );
};
