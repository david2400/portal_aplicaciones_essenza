import 'server-only';

import { list_orders } from '@/server/domains/sales/orders/queries';
import { list_motive_devolutions } from '@/server/domains/devolution/motive-devolutions/queries';
import { list_return_methods } from '@/server/domains/devolution/return-methods/queries';
import { list_refund_methods } from '@/server/domains/devolution/refund-methods/queries';

/**
 * Catálogos que comparten el listado y el detalle de devoluciones.
 * Los métodos inactivos se ocultan del formulario pero se conservan para
 * poder mostrar el nombre en devoluciones antiguas.
 */
export async function load_devolution_catalogs() {
  const [orders, motives, returnMethods, refundMethods] = await Promise.all([
    list_orders(),
    list_motive_devolutions(),
    list_return_methods(),
    list_refund_methods(),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      name: `#${order.id}${order.state ? ` · ${order.state}` : ''}`,
    })),
    motives: motives.map(({ id, name }) => ({ id, name })),
    returnMethods: returnMethods.map(({ id, name }) => ({ id, name })),
    refundMethods: refundMethods.map(({ id, name }) => ({ id, name })),
  };
}
