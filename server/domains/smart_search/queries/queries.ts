import 'server-only';

import { cache } from 'react';

import { search_queries_repository } from './repository';

export const list_search_queries = cache(async () => {
  return search_queries_repository.list_search_queries();
});

export const get_search_query_by_id = cache(async ({ id }: { id: number }) => {
  return search_queries_repository.get_search_query_by_id(id);
});
