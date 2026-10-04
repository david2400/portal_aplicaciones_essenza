import 'server-only';

import { cache } from 'react';

import { pages_repository } from './repository';

export const list_pages = cache(async () => {
  return pages_repository.list_pages();
});

export const get_page_by_id = cache(async ({ id }: { id: number }) => {
  return pages_repository.get_page_by_id(id);
});
