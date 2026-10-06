import 'server-only';

import { cache } from 'react';

import { attributes_repository } from './repository';

export const list_attributes = cache(async () => {
  return attributes_repository.list_attributes();
});

export const get_attribute_by_id = cache(async ({ id }: { id: number }) => {
  return attributes_repository.get_attribute_by_id(id);
});
