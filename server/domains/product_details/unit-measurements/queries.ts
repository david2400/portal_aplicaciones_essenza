import 'server-only';

import { cache } from 'react';

import { unit_measurements_repository } from './repository';

export const list_unit_measurements = cache(async () => {
  return unit_measurements_repository.list_unit_measurements();
});

export const get_unit_measurement_by_id = cache(async ({ id }: { id: number }) => {
  return unit_measurements_repository.get_unit_measurement_by_id(id);
});
