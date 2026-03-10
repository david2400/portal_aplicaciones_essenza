import { IBaseEntity } from '@/lib/entitys/base.entity';

export interface IPetitionPqrs extends IBaseEntity {
    fullName: number;
    cardId: string;
    email: string;
    phone: string;
    requestType: string;
    category: string;
    address: string;
}
