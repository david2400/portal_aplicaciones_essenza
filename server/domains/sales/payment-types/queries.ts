import 'server-only';

import { cache } from 'react';

import { payment_types_repository } from './repository';

export const list_payment_types = cache(async () => {
  return payment_types_repository.list_payment_types();
});

export const get_payment_type_by_id = cache(async ({ id }: { id: number }) => {
  return payment_types_repository.get_payment_type_by_id(id);
});
