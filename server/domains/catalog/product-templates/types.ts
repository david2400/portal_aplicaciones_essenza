import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type ProductTemplateDto = components['schemas']['ProductTemplateDto'];
export type SaveProductTemplateDto = components['schemas']['SaveProductTemplateDto'];

export type UpdateProductTemplatePayload = SaveProductTemplateDto & { id: number };
