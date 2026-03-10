import 'server-only';

import { cache } from 'react';

import { payment_types_repository } from './repository';

export const list_payment_types = cache(async () => {
  return payment_types_repository.list_payment_types();
});
