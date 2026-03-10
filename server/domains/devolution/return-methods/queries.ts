import 'server-only';

import { cache } from 'react';

import { return_methods_repository } from './repository';

export const list_return_methods = cache(async () => {
  return return_methods_repository.list_return_methods();
});

export const get_return_method_by_id = cache(async ({ id }: { id: number }) => {
  return return_methods_repository.get_return_method_by_id(id);
});
