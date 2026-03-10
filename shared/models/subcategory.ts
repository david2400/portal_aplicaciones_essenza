import {IBaseEntity} from '@/lib/entitys/base.entity';

export interface ISubcategory extends IBaseEntity {
  id?: number;
  name: string;
  category_id?: number;
  slug: string;
  description: string;
}
