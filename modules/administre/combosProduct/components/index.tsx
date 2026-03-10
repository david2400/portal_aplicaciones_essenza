'use client';

import {Buttons} from '@repo/ui/buttons/scenes/index';
import {Card} from '@repo/ui/card/scenes/card';
import {TabViews} from '@repo/ui/tabs/scenes';
import {useState} from 'react';
import {BiPackage, BiPlus, BiSearch} from 'react-icons/bi';
import {ProductCatalog} from '../scenes/combo-catalog';
import {ComboBuilder} from '../scenes/combo-builder';
import {ComboList} from '../scenes/combo-list';

export function ComboManager() {
  const [activeTab, setActiveTab] = useState('catalog');

  const tabs = [
    {
      title: 'Catálogo',
      value: 'catalog',
      children: <ProductCatalog></ProductCatalog>,
    },
    {
      title: 'builder',
      value: 'builder',
      children: <ComboBuilder></ComboBuilder>,
    },
    {
      title: 'Credit Card',
      value: 'creditcard',
      children: <ComboList></ComboList>,
    },
  ];

  return (
    <div className='w-full bg-background'>
      {/* Header */}
      <div className='container mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary'>
              <BiPackage className='h-5 w-5 text-primary-foreground' />
            </div>
            <div>
              <h1 className='text-xl font-semibold text-foreground'>Gestor de Combos</h1>
              <p className='text-sm text-muted-foreground'>
                Sistema de gestión de productos y combos
              </p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <Buttons variant='outline' size='sm'>
              <BiSearch className='h-4 w-4 mr-2' />
              Buscar
            </Buttons>
            <Buttons size='sm'>
              <BiPlus className='h-4 w-4 mr-2' />
              Nuevo Combo
            </Buttons>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className='w-full my-4'>
        <TabViews className='w-full' defaultValue='catalog' data={tabs}></TabViews>
      </Card>
    </div>
  );
}
