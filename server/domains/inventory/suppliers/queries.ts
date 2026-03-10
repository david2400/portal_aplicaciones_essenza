import 'server-only';

import { cache } from 'react';

import { suppliers_repository } from './repository';

export const list_suppliers = cache(async () => {
  return suppliers_repository.list_suppliers();
});

export const get_supplier_by_id = cache(async ({ id }: { id: number }) => {
  return suppliers_repository.get_supplier_by_id(id);
});
