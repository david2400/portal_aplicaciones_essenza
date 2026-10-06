/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_order_devolution_by_id } from "@/server/domains/devolution/order-devolutions/queries";
import { list_order_devolution_details } from "@/server/domains/devolution/order-devolution-details/queries";
import { list_order_devolution_evidences } from "@/server/domains/devolution/order-devolution-evidences/queries";
import { list_product_orders } from "@/server/domains/sales/product-orders/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
import { ServerApiError } from "@/server/lib/types";
import { load_devolution_catalogs } from "../catalogs";
import { DevolutionDetail } from "@/modules/postventa/devolution";

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.devolution" });
  return { title: t("devolutionLabel", { id }) };
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

  const [details, evidences, productOrders, products, catalogs] = await Promise.all([
    list_order_devolution_details(),
    list_order_devolution_evidences(),
    list_product_orders(),
    list_products({ size: 500 }),
    load_devolution_catalogs(),
  ]);

  const productNames = new Map(products.map((product) => [product.id, product.name]));

  // Líneas de la orden original: precio unitario = total de la línea / cantidad.
  const lines = productOrders
    .filter((item) => item.order_id === devolution.order_id)
    .map((item) => {
      const quantity = item.quantity ?? 0;
      return {
        id: item.id,
        product_name: productNames.get(item.product_id) ?? `#${item.product_id}`,
        quantity,
        unit_price: quantity > 0 ? Math.round(((item.total ?? 0) / quantity) * 100) / 100 : 0,
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
