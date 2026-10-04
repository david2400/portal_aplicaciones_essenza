import 'server-only';

import { cache } from 'react';

import { personalization_profiles_repository } from './repository';

export const list_personalization_profiles = cache(async () => {
  return personalization_profiles_repository.list_personalization_profiles();
});

export const get_personalization_profile_by_id = cache(async ({ id }: { id: number }) => {
  return personalization_profiles_repository.get_personalization_profile_by_id(id);
});
