'use client';
import {Modal} from '@repo/ui/modals/scenes/dialog/modal';
import {CreditsCartItems} from '@modules/administre/creditCard/components/creditsCartsItems';
import {CreditCartList} from '@modules/administre/creditCard/scenes/creditCartList';
import {useState} from 'react';
import {AddCreditCard} from './formCreditCart';

export interface ICreditCartItemData {
  id: string;
  alias: string;
  holder: string;
  brand: string;
  last4: string;
  expiry: string;
  balance: number;
  limit: number;
  isDefault?: boolean;
  gradientFrom: string;
  gradientTo: string;
}

const itemsCreditCard = (item: ICreditCartItemData, _index: number) => {
  return <CreditsCartItems data={item} />;
};

export const CreditsCartList = () => {
  const [openModal, setopenModal] = useState(false);
  const data: ICreditCartItemData[] = [
    {
      id: 'card-main',
      alias: 'Tarjeta principal',
      holder: 'John Smith',
      brand: 'Visa',
      last4: '1111',
      expiry: '10/26',
      balance: 2450000,
      limit: 5000000,
      isDefault: true,
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-purple-500',
    },
    {
      id: 'card-travel',
      alias: 'Viajes',
      holder: 'John Smith',
      brand: 'Mastercard',
      last4: '9824',
      expiry: '04/27',
      balance: 860000,
      limit: 3000000,
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-400',
    },
    {
      id: 'card-shopping',
      alias: 'Compras online',
      holder: 'John Smith',
      brand: 'American Express',
      last4: '3021',
      expiry: '12/25',
      balance: 180000,
      limit: 2000000,
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-rose-500',
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h3 className='text-lg font-semibold text-foreground'>Mis tarjetas guardadas</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Gestiona tus tarjetas y consulta su saldo disponible de un vistazo.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button className='rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary'>
            Ver todas
          </button>
          <button onClick={() => setopenModal(true)} className='rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'>
            Añadir tarjeta
          </button>
        </div>
      </div>

      <CreditCartList
        cartItem={itemsCreditCard}
        data={data}
        getKey={item => item.id}
        columns={{md: 1, lg: 2, xl: 3}}
        gap={6}
        emptyState={
          <div className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground'>
            <span className='text-base font-semibold text-foreground'>
              Aún no tienes tarjetas guardadas
            </span>
            <span>
              Agrega tu primera tarjeta para pagar más rápido y llevar el control de tus gastos.
            </span>
          </div>
        }
      />

      <Modal title={'addCreditCart'} open={openModal} onOpenChange={setopenModal}>
        <AddCreditCard></AddCreditCard>
      </Modal>
    </div>
  );
};
