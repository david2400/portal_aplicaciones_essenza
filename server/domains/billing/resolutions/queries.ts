import 'server-only';

import { cache } from 'react';

import { resolutions_repository } from './repository';

export const list_resolutions = cache(async (kind?: string) => resolutions_repository.list_resolutions(kind));
