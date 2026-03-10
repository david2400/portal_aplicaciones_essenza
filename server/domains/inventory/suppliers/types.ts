import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type SupplierDto = components['schemas']['SupplierDto'];
export type CreateSupplierDto = components['schemas']['CreateSupplierDto'];
export type UpdateSupplierDto = components['schemas']['UpdateSupplierDto'];

export type UpdateSupplierPayload = UpdateSupplierDto;

export type DeleteSupplierPayload = {
  id: number;
};
