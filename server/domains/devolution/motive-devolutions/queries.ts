import 'server-only';

import { cache } from 'react';

import { motive_devolutions_repository } from './repository';

export const list_motive_devolutions = cache(async () => {
  return motive_devolutions_repository.list_motive_devolutions();
});

export const get_motive_devolution_by_id = cache(async ({ id }: { id: number }) => {
  return motive_devolutions_repository.get_motive_devolution_by_id(id);
});
