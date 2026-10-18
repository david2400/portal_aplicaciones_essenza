/** @format */

"use client";

import { useTranslations } from "next-intl";
import { HiOutlineArchiveBox, HiOutlineArrowLeft } from "react-icons/hi2";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/shared/i18n/routing";
import { WarehouseForm } from "../components/form";
import { WAREHOUSES_HREF, type IWarehouse } from "../models/warehouse.interface";

/** Alta o edición de la bodega en su propia ruta (`/new` y `/[id]/edit`). */
export const WarehouseEditor = ({ warehouse }: { warehouse?: IWarehouse | null }) => {
  const t = useTranslations("Administre.warehouse");
  const tf = useTranslations("Administre.warehouse.form");
  const tCrud = useTranslations("Crud");
  const isNew = warehouse?.id == null;
  return (
    <section className='flex w-full flex-col gap-6'>
      <Link href={isNew ? WAREHOUSES_HREF : `${WAREHOUSES_HREF}/${warehouse!.id}`}
        className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {isNew ? tf("back") : tf("backToDetail")}
      </Link>
      <PageHeader
        icon={HiOutlineArchiveBox}
        eyebrow={tCrud("domains.inventory")}
        title={isNew ? t("createTitle") : (warehouse!.name ?? `#${warehouse!.id}`)}
        description={isNew ? tf("createDescription") : warehouse!.code}
      />
      <WarehouseForm warehouse={warehouse} />
    </section>
  );
};
