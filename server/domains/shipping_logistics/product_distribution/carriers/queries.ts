import 'server-only';

import { cache } from 'react';

import { carriers_repository } from './repository';

export const list_carriers = cache(async () => {
  return carriers_repository.list_carriers();
});

export const get_carrier_by_id = cache(async ({ id }: { id: number }) => {
  return carriers_repository.get_carrier_by_id(id);
});
