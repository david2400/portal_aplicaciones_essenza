'use client';

import {Buttons} from '@repo/ui/buttons/scenes/index';
import { Card, CardContent, CardHeader } from '@repo/ui/card/scenes/card';
import { Badge } from '@repo/ui/badges/scenes/badge';
import {useState} from 'react';
import {BiEdit, BiPlus, BiSearch} from 'react-icons/bi';
import { BsTrash2 } from 'react-icons/bs';
import { FaDollarSign } from 'react-icons/fa';

// Mock data para productos
const mockProducts = [
  {
    id: 1,
    name: 'Laptop Gaming',
    price: 1299.99,
    category: 'Electrónicos',
    stock: 15,
    image: '/gaming-laptop.png',
  },
  {
    id: 2,
    name: 'Mouse Inalámbrico',
    price: 29.99,
    category: 'Accesorios',
    stock: 50,
    image: '/wireless-mouse.png',
  },
  {
    id: 3,
    name: 'Teclado Mecánico',
    price: 89.99,
    category: 'Accesorios',
    stock: 25,
    image: '/mechanical-keyboard.png',
  },
  {
    id: 4,
    name: 'Monitor 4K',
    price: 399.99,
    category: 'Electrónicos',
    stock: 8,
    image: '/placeholder-h5udd.png',
  },
  {
    id: 5,
    name: 'Auriculares Gaming',
    price: 79.99,
    category: 'Audio',
    stock: 30,
    image: '/placeholder-rm58w.png',
  },
  {
    id: 6,
    name: 'Webcam HD',
    price: 49.99,
    category: 'Accesorios',
    stock: 20,
    image: '/placeholder-6sc9k.png',
  },
];

export function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.category)))];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold text-foreground'>Catálogo de Productos</h2>
          <p className='text-muted-foreground'>Gestiona tu inventario de productos disponibles</p>
        </div>
        <Buttons>
          <BiPlus className='h-4 w-4 mr-2' />
          Agregar Producto
        </Buttons>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <BiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                {/* <Input
                  placeholder='Buscar productos...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                /> */}
              </div>
            </div>
            <div className='flex gap-2'>
              {categories.map(category => (
                <Buttons
                  key={category}
                //   variant={selectedCategory === category ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Todos' : category}
                </Buttons>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProducts.map(product => (
          <Card key={product.id} className='group hover:shadow-lg transition-shadow'>
            <CardHeader className='pb-3'>
              <div className='aspect-square w-full bg-muted rounded-lg mb-3 overflow-hidden'>
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                />
              </div>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <CardHeader className='text-lg'>{product.name}</CardHeader>
                  <Badge className='text-xs'>{product.category}</Badge>
                </div>
                <div className='flex gap-1'>
                  <Buttons variant='ghost' size='sm'>
                    <BiEdit className='h-4 w-4' />
                  </Buttons>
                  <Buttons variant='ghost' size='sm'>
                    <BsTrash2 className='h-4 w-4' />
                  </Buttons>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <FaDollarSign className='h-4 w-4 text-muted-foreground' />
                  <span className='text-xl font-semibold'>${product.price}</span>
                </div>
                <Badge //variant={product.stock > 10 ? 'default' : 'destructive'}
                    >
                  Stock: {product.stock}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
