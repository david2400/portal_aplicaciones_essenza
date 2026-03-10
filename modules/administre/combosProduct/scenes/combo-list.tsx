'use client';

import {Buttons} from '@repo/ui/buttons/scenes/index';
import { Card, CardContent, CardHeader } from '@repo/ui/card/scenes/card';
import { Badge } from '@repo/ui/badges/scenes/badge';
import {useState} from 'react';
import {BiEdit, BiPackage} from 'react-icons/bi';
import {BsEye, BsPercent, BsTrash2} from 'react-icons/bs';
import {CgShoppingCart} from 'react-icons/cg';

// Mock data para combos existentes
const mockCombos = [
  {
    id: 1,
    name: 'Pack Gaming Pro',
    description: 'Todo lo que necesitas para gaming profesional',
    products: [
      {name: 'Laptop Gaming', price: 1299.99, quantity: 1},
      {name: 'Mouse Inalámbrico', price: 29.99, quantity: 1},
      {name: 'Auriculares Gaming', price: 79.99, quantity: 1},
    ],
    originalPrice: 1409.97,
    discountPercent: 15,
    finalPrice: 1198.47,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Oficina Completa',
    description: 'Setup perfecto para trabajo remoto',
    products: [
      {name: 'Monitor 4K', price: 399.99, quantity: 1},
      {name: 'Teclado Mecánico', price: 89.99, quantity: 1},
      {name: 'Mouse Inalámbrico', price: 29.99, quantity: 1},
      {name: 'Webcam HD', price: 49.99, quantity: 1},
    ],
    originalPrice: 569.96,
    discountPercent: 12,
    finalPrice: 501.56,
    status: 'active',
    createdAt: '2024-01-10',
  },
  {
    id: 3,
    name: 'Starter Pack',
    description: 'Combo básico para empezar',
    products: [
      {name: 'Mouse Inalámbrico', price: 29.99, quantity: 1},
      {name: 'Teclado Mecánico', price: 89.99, quantity: 1},
    ],
    originalPrice: 119.98,
    discountPercent: 8,
    finalPrice: 110.38,
    status: 'draft',
    createdAt: '2024-01-08',
  },
];

export function ComboList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCombos = mockCombos.filter(combo => {
    const matchesSearch = combo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || combo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className='bg-success/10 text-success border-success/20'>Activo</Badge>;
      case 'draft':
        return <Badge /*variant='secondary'*/>Borrador</Badge>;
      case 'inactive':
        return <Badge /*variant='destructive'*/>Inactivo</Badge>;
      default:
        return <Badge /*variant='outline'*/>{status}</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold text-foreground'>Combos Creados</h2>
          <p className='text-muted-foreground'>Gestiona todos tus combos de productos</p>
        </div>
        <div className='flex items-center gap-3'>
          <Badge /* variant='outline' */ className='px-3 py-1'>
            {filteredCombos.length} combos
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                {/* <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar combos...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                /> */}
              </div>
            </div>
            <div className='flex gap-2'>
              {['all', 'active', 'draft', 'inactive'].map(status => (
                <Buttons
                  key={status}
                  //   variant={statusFilter === status ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all'
                    ? 'Todos'
                    : status === 'active'
                      ? 'Activos'
                      : status === 'draft'
                        ? 'Borradores'
                        : 'Inactivos'}
                </Buttons>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combos List */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {filteredCombos.map(combo => (
          <Card key={combo.id} className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <label className='text-lg'>{combo.name}</label>
                    {getStatusBadge(combo.status)}
                  </div>
                  <label>{combo.description}</label>
                </div>
                <div className='flex gap-1'>
                  <Buttons variant='ghost' size='sm'>
                    <BsEye className='h-4 w-4' />
                  </Buttons>
                  <Buttons variant='ghost' size='sm'>
                    <BiEdit className='h-4 w-4' />
                  </Buttons>
                  <Buttons variant='ghost' size='sm'>
                    <BsTrash2 className='h-4 w-4' />
                  </Buttons>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Productos en el combo */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium flex items-center gap-2'>
                  <BiPackage className='h-4 w-4' />
                  Productos ({combo.products.length})
                </h4>
                <div className='space-y-1'>
                  {combo.products.map((product, index) => (
                    <div key={index} className='flex justify-between text-sm text-muted-foreground'>
                      <span>
                        {product.name} × {product.quantity}
                      </span>
                      <span>${(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* <Separator /> */}

              {/* Pricing */}
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Precio original:</span>
                  <span className='line-through text-muted-foreground'>
                    ${combo.originalPrice.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='flex items-center gap-1'>
                    <BsPercent className='h-3 w-3' />
                    Descuento ({combo.discountPercent}%):
                  </span>
                  <span className='text-success'>
                    -${(combo.originalPrice - combo.finalPrice).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between font-semibold'>
                  <span>Precio final:</span>
                  <span className='text-primary text-lg'>${combo.finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* <Separator /> */}

              {/* Metadata */}
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>Creado: {combo.createdAt}</span>
                <span>ID: #{combo.id}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCombos.length === 0 && (
        <Card>
          <CardContent className='p-12 text-center'>
            <CgShoppingCart className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-medium mb-2'>No se encontraron combos</h3>
            <p className='text-muted-foreground'>
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea tu primer combo para empezar'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
