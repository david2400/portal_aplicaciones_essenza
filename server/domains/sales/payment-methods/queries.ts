import 'server-only';

import { cache } from 'react';

import { payment_methods_repository } from './repository';

export const list_payment_methods = cache(async (include_inactive: boolean = true, channel?: string) => {
  return payment_methods_repository.list_payment_methods(include_inactive, channel);
});

export const get_payment_method_by_id = cache(async ({ id }: { id: number }) => {
  return payment_methods_repository.get_payment_method_by_id(id);
});

export const list_gateway_providers = cache(async () => {
  return payment_methods_repository.list_gateway_providers();
});
