/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_order_by_id } from "@/server/domains/sales/orders/queries";
import { ServerApiError } from "@/server/lib/types";
import { OrderEditor } from "@/modules/ventas/order";
import { load_order_catalogs } from "../../catalogs";

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.order" });
  return { title: t("editTitle") + ` #${id}` };
}

const EditOrderPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();
  const [order, catalogs] = await Promise.all([
    get_order_by_id({ id: orderId }).catch((error: unknown) => {
      if (error instanceof ServerApiError && error.is_not_found) notFound();
      throw error;
    }),
    load_order_catalogs(),
  ]);
  return <OrderEditor order={order} {...catalogs} />;
};

export default EditOrderPage;
