import {IBaseEntity} from '@/lib/entitys/base.entity';

export interface ICategory extends IBaseEntity {
  id: number;
  name: string;
  slug: string;
  description: string;
}
