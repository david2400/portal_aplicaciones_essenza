import 'server-only';

import { cache } from 'react';

import { tax_rates_repository } from './repository';

export const list_tax_rates = cache(async (include_inactive: boolean = true) => tax_rates_repository.list_tax_rates(include_inactive));
