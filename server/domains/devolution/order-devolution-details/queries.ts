import 'server-only';

import { cache } from 'react';

import { order_devolution_details_repository } from './repository';

export const list_order_devolution_details = cache(async () => {
  return order_devolution_details_repository.list_order_devolution_details();
});

export const get_order_devolution_detail_by_id = cache(async ({ id }: { id: number }) => {
  return order_devolution_details_repository.get_order_devolution_detail_by_id(id);
});
