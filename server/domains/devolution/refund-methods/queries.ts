import 'server-only';

import { cache } from 'react';

import { refund_methods_repository } from './repository';

export const list_refund_methods = cache(async () => {
  return refund_methods_repository.list_refund_methods();
});

export const get_refund_method_by_id = cache(async ({ id }: { id: number }) => {
  return refund_methods_repository.get_refund_method_by_id(id);
});
