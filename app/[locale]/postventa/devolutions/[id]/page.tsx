/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_order_devolution_by_id } from "@/server/domains/devolution/order-devolutions/queries";
import { list_order_devolution_details } from "@/server/domains/devolution/order-devolution-details/queries";
import { list_order_devolution_evidences } from "@/server/domains/devolution/order-devolution-evidences/queries";
import { list_product_orders } from "@/server/domains/sales/product-orders/queries";
import { lookup_products } from "@/server/domains/lookups/queries";
import { ServerApiError } from "@/server/lib/types";
import { load_devolution_catalogs } from "../catalogs";
import { DevolutionDetail } from "@/modules/postventa/devolution";

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.devolution" });
  return { title: t("devolutionLabel", { id }) };
}

/**
 * Nombre de cada línea: el snapshot de la línea (F5) o, en líneas antiguas sin él,
 * el producto resuelto por id (solo esos ids, no el catálogo entero).
 */
async function line_names(items: Array<{ product_id?: number; product_name?: string }>) {
  const missing = [
    ...new Set(items.filter((item) => !item.product_name && item.product_id != null).map((item) => item.product_id as number)),
  ];
  const found = missing.length > 0 ? await lookup_products({ ids: missing }) : [];
  const names = new Map(found.map((product) => [product.id, product.name]));
  return (item: { product_id?: number; product_name?: string }) =>
    item.product_name ?? names.get(item.product_id) ?? `#${item.product_id}`;
}

const DevolutionDetailPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  const devolutionId = Number(id);
  if (!Number.isInteger(devolutionId) || devolutionId <= 0) notFound();

  const devolution = await get_order_devolution_by_id({ id: devolutionId }).catch(
    (error: unknown) => {
      if (error instanceof ServerApiError && error.is_not_found) notFound();
      throw error;
    },
  );

  const [details, evidences, productOrders, catalogs] = await Promise.all([
    list_order_devolution_details(),
    list_order_devolution_evidences(),
    list_product_orders(),
    load_devolution_catalogs(),
  ]);

  const orderItems = productOrders.filter((item) => item.order_id === devolution.order_id);
  const nameOf = await line_names(orderItems);

  // Líneas de la orden original: precio unitario congelado en la línea (F5) o, si es
  // antigua, total de la línea / cantidad.
  const lines = orderItems.map((item) => {
    const quantity = item.quantity ?? 0;
    return {
      id: item.id,
      product_name: nameOf(item),
      quantity,
      unit_price:
        item.unit_price ?? (quantity > 0 ? Math.round(((item.total ?? 0) / quantity) * 100) / 100 : 0),
    };
  });

  return (
    <DevolutionDetail
      devolution={devolution}
      details={details.filter((detail) => detail.order_devolution_id === devolutionId)}
      evidences={evidences.filter((evidence) => evidence.order_devolution_id === devolutionId)}
      lines={lines}
      catalogs={catalogs}
    />
  );
};

export default DevolutionDetailPage;
