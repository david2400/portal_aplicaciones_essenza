'use client';
import {useState} from 'react';
// import {FormattedMessage, useIntl} from 'next-intl';
import {useTranslations} from 'next-intl';
import {Modal} from '@repo/ui/modals/scenes/dialog/modal';
import {AddCreditCard} from '@modules/administre/creditCard/components/formCreditCart';
import {CreditsCartList} from '@modules/administre/creditCard/components/creditsCartList';
import {TransactionsList} from '@modules/sales/transactions/components/transactionsList';
// import {CreditCardIcon} from '@heroicons/react/24/outline';
// import {Toolbar} from 'primereact/toolbar';
import {Card} from '@repo/ui/card/scenes/card';
import {Buttons} from '@repo/ui/buttons/scenes/index';
import { TabViews } from '@repo/ui/tabs/scenes';

export const MyCreditCards = () => {
  const intl = useTranslations('Form');
  const [openModal, setopenModal] = useState(false);
  const [tab, setTab] = useState<'cards' | 'transactions'>('cards');

  const endContent = () => {
    return (
      <Buttons
        className='text-md rounded-full'
        onClick={() => {
          setopenModal(!openModal);
        }}
      >
        hola
        {/* <FormattedMessage id='addCreditCart' defaultMessage='addCreditCart' /> */}
      </Buttons>
    );
  };

  const startContent = () => {
    return (
      <p className='inline-flex items-center text-gray-400 text-md pt-2'>
        {/* <CreditCardIcon className='mx-2 h-7 w-7'></CreditCardIcon> */}
        {/* <FormattedMessage id='creditCards' defaultMessage='creditCards' /> */}
      </p>
    );
  };

  const headers = () => {
    return (
      <></>
      // <Toolbar
      //   className='w-full'
      //   aria-label='Actions'
      //   start={startContent}
      //   end={endContent}
      // ></Toolbar>
    );
  };

  return (
    <>
      <div className='w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8'>
        <div className='relative mb-6 sm:mb-8 overflow-hidden rounded-2xl border border-transparent bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-purple-500/10 p-5 sm:p-7'>
          <div className='relative z-10'>
            <h1 className='text-2xl sm:text-3xl font-semibold tracking-tight'>Tarjetas y transacciones</h1>
            <p className='mt-2 text-sm sm:text-base text-muted-foreground'>Administra tus métodos de pago y revisa tus movimientos recientes.</p>
          </div>
          <div className='pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl'></div>
          <div className='pointer-events-none absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl'></div>
        </div>

        <Card title='Gestión de pagos'>
          <div className='px-1 sm:px-2 pt-2'>
            <TabViews
              defaultValue='cards'
              value={tab}
              onValueChange={setTab as any}
              data={[
                {
                  title: 'Mis tarjetas',
                  value: 'cards',
                  children: (
                    <div className='pt-2'>
                      <CreditsCartList></CreditsCartList>
                    </div>
                  ),
                },
                {
                  title: 'Transacciones',
                  value: 'transactions',
                  children: (
                    <div className='pt-2'>
                      <TransactionsList></TransactionsList>
                    </div>
                  ),
                },
              ] as any}
              orientation='horizontal'
              className='gap-4'
            ></TabViews>
          </div>

          <div className='mt-6 border-t p-4 flex items-center justify-between gap-3 bg-background/50'>
            <div className='text-sm text-muted-foreground'>
              {/* <FormattedMessage id='creditCards' defaultMessage='creditCards' /> */}
            </div>
            <div className='flex items-center gap-3'>
              <Buttons variant='outline' onClick={() => setTab('cards')}>Mis tarjetas</Buttons>
              <Buttons variant='default' onClick={() => setopenModal((prev) => !prev)}>Añadir tarjeta</Buttons>
            </div>
          </div>
        </Card>
      </div>

      <Modal title={'addCreditCart'} open={openModal} onOpenChange={setopenModal}>
        <AddCreditCard></AddCreditCard>
      </Modal>
    </>
  );
};
