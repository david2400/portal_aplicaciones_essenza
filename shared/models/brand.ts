import {IBaseEntity} from '@/lib/entitys/base.entity';

export interface IBrand extends IBaseEntity {
  id: number;
  name: string;
  slug: string;
  description: string;
}
