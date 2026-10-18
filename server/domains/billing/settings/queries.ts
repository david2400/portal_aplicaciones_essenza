import 'server-only';

import { cache } from 'react';

import { billing_settings_repository } from './repository';

export const get_billing_settings = cache(async () => billing_settings_repository.get_billing_settings());
