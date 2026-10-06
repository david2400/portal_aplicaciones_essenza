import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type AttributeDto = components['schemas']['AttributeDto'];
export type SaveAttributeDto = components['schemas']['SaveAttributeDto'];

export type UpdateAttributePayload = SaveAttributeDto & { id: number };
