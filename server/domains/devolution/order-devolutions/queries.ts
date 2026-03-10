import 'server-only';

import { cache } from 'react';

import { order_devolutions_repository } from './repository';

export const list_order_devolutions = cache(async () => {
  return order_devolutions_repository.list_order_devolutions();
});

export const get_order_devolution_by_id = cache(async ({ id }: { id: number }) => {
  return order_devolutions_repository.get_order_devolution_by_id(id);
});
