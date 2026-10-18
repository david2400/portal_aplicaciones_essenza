/** @format */

"use client";

import { useTranslations } from "next-intl";
import { HiOutlineArrowLeft, HiOutlineShoppingBag } from "react-icons/hi2";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/shared/i18n/routing";
import { OrderForm } from "../components/order-form";
import { ORDERS_HREF, type INamedItem, type IOrder, type IOrderStore } from "../models/order.interface";

/** Alta o edición de la orden en su propia ruta (`/new` y `/[id]/edit`). */
export const OrderEditor = ({
  order,
  stores,
  warehouses,
  carriers,
}: {
  order?: IOrder | null;
  stores: IOrderStore[];
  warehouses: INamedItem[];
  carriers: INamedItem[];
}) => {
  const t = useTranslations("Administre.order");
  const tf = useTranslations("Administre.order.form");
  const tCrud = useTranslations("Crud");
  const isNew = order?.id == null;
  return (
    <section className='flex w-full flex-col gap-6'>
      <Link href={isNew ? ORDERS_HREF : `${ORDERS_HREF}/${order!.id}`}
        className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {isNew ? t("backToList") : tf("backToDetail")}
      </Link>
      <PageHeader
        icon={HiOutlineShoppingBag}
        eyebrow={tCrud("domains.sales")}
        title={isNew ? t("createTitle") : tf("editTitle", { number: order!.order_number ?? `#${order!.id}` })}
        description={isNew ? tf("createDescription") : (order!.customer_name ?? undefined)}
      />
      <OrderForm order={order} stores={stores} warehouses={warehouses} carriers={carriers} />
    </section>
  );
};
