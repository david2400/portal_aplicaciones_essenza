import 'server-only';

import { cache } from 'react';

import { variant_matrix_repository } from './repository';

export const get_variant_matrix = cache(async (product_id: number) => variant_matrix_repository.get(product_id));
