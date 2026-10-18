import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { payment_methods_tags } from '@/server/lib/cache-tags';
import type { GatewayProviderDto, PaymentMethodDto, SavePaymentMethodDto, UpdatePaymentMethodPayload } from './types';

const base_path = '/api/shop/sales/payment_methods';
const by_id = (id: number) => `${base_path}/${id}`;

export const payment_methods_repository = {
  /** Medios de pago; el panel pide también los inactivos. */
  async list_payment_methods(include_inactive = true, channel?: string): Promise<PaymentMethodDto[]> {
    const search = new URLSearchParams({ includeInactive: String(include_inactive) });
    if (channel) search.set('channel', channel);
    const response = await server_fetch.get<unknown>(`${base_path}?${search}`, {
      revalidate: 30,
      tags: [payment_methods_tags.list()],
    });
    return to_list<PaymentMethodDto>(response);
  },

  async get_payment_method_by_id(id: number): Promise<PaymentMethodDto> {
    return server_fetch.get<PaymentMethodDto>(by_id(id), { revalidate: 30, tags: [payment_methods_tags.item(id)] });
  },

  /** Pasarelas y si tienen credenciales (siempre fresco: depende de la configuración del servidor). */
  async list_gateway_providers(): Promise<GatewayProviderDto[]> {
    const response = await server_fetch.get<unknown>(`${base_path}/providers`, { revalidate: 0 });
    return to_list<GatewayProviderDto>(response);
  },

  async create_payment_method(payload: SavePaymentMethodDto): Promise<PaymentMethodDto> {
    return server_fetch.post<PaymentMethodDto>(base_path, payload, { revalidate: false });
  },

  async update_payment_method(payload: UpdatePaymentMethodPayload): Promise<PaymentMethodDto> {
    const { id, ...body } = payload;
    return server_fetch.put<PaymentMethodDto>(by_id(id), body, { revalidate: false });
  },

  async delete_payment_method(id: number): Promise<void> {
    return server_fetch.delete<void>(by_id(id), { revalidate: false });
  },
} as const;
