'use client';

import {Buttons} from '@repo/ui/buttons/scenes/index';
import { Card, CardContent, CardHeader } from '@repo/ui/card/scenes/card';
import { Badge } from '@repo/ui/badges/scenes/badge';
import {useState} from 'react';
import {BiPackage, BiPlus, BiX} from 'react-icons/bi';
import {BsPercent} from 'react-icons/bs';
import {CgShoppingCart} from 'react-icons/cg';

// Mock data para productos disponibles
const availableProducts = [
  {id: 1, name: 'Laptop Gaming', price: 1299.99, category: 'Electrónicos'},
  {id: 2, name: 'Mouse Inalámbrico', price: 29.99, category: 'Accesorios'},
  {id: 3, name: 'Teclado Mecánico', price: 89.99, category: 'Accesorios'},
  {id: 4, name: 'Monitor 4K', price: 399.99, category: 'Electrónicos'},
  {id: 5, name: 'Auriculares Gaming', price: 79.99, category: 'Audio'},
];

interface ComboProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export function ComboBuilder() {
  const [comboName, setComboName] = useState('');
  const [comboDescription, setComboDescription] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<ComboProduct[]>([]);
  const [discountPercent, setDiscountPercent] = useState(10);

  const addProduct = (product: (typeof availableProducts)[0]) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(prev =>
        prev.map(p => (p.id === product.id ? {...p, quantity: p.quantity + 1} : p))
      );
    } else {
      setSelectedProducts(prev => [...prev, {...product, quantity: 1}]);
    }
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }
    setSelectedProducts(prev => prev.map(p => (p.id === productId ? {...p, quantity} : p)));
  };

  const totalPrice = selectedProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const discountAmount = totalPrice * (discountPercent / 100);
  const finalPrice = totalPrice - discountAmount;

  const handleSaveCombo = () => {
    if (!comboName || selectedProducts.length === 0) return;

    const combo = {
      name: comboName,
      description: comboDescription,
      products: selectedProducts,
      originalPrice: totalPrice,
      discountPercent,
      finalPrice,
      createdAt: new Date().toISOString(),
    };

    console.log('Combo guardado:', combo);
    // Aquí guardarías el combo en tu base de datos

    // Reset form
    setComboName('');
    setComboDescription('');
    setSelectedProducts([]);
    setDiscountPercent(10);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h2 className='text-2xl font-semibold text-foreground'>Crear Nuevo Combo</h2>
        <p className='text-muted-foreground'>Combina productos para crear ofertas atractivas</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Productos Disponibles */}
        <Card>
          <CardHeader>
            {/* <CardTitle className='flex items-center gap-2'> */}
            <BiPackage className='h-5 w-5' />
            Productos Disponibles
            {/* </CardTitle> */}
            {/* <CardDescription> */}
            Selecciona los productos que quieres incluir en el combo
            {/* </CardDescription> */}
          </CardHeader>
          <CardContent className='space-y-3'>
            {availableProducts.map(product => (
              <div
                key={product.id}
                className='flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors'
              >
                <div className='flex-1'>
                  <h4 className='font-medium'>{product.name}</h4>
                  <div className='flex items-center gap-2 mt-1'>
                    <Badge /* variant='outline' */ className='text-xs'>{product.category}</Badge>
                    <span className='text-sm text-muted-foreground'>${product.price}</span>
                  </div>
                </div>
                <Buttons size='sm' onClick={() => addProduct(product)} className='ml-3'>
                  <BiPlus className='h-4 w-4' />
                </Buttons>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Constructor de Combo */}
        <Card>
          <CardHeader>
            {/* <CardTitle className='flex items-center gap-2'> */}
            <CgShoppingCart className='h-5 w-5' />
            Configuración del Combo
            {/* </CardTitle> */}
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Información básica */}
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label htmlFor='combo-name'>Nombre del Combo</label>
                {/* <Input
                  id='combo-name'
                  placeholder='Ej: Pack Gaming Completo'
                  value={comboName}
                  onChange={e => setComboName(e.target.value)}
                /> */}
              </div>

              <div className='space-y-2'>
                <label htmlFor='combo-description'>Descripción</label>
                {/* <Textarea
                  id='combo-description'
                  placeholder='Describe las ventajas de este combo...'
                  value={comboDescription}
                  onChange={e => setComboDescription(e.target.value)}
                  rows={3}
                /> */}
              </div>

              <div className='space-y-2'>
                <label htmlFor='discount'>Descuento (%)</label>
                <div className='flex items-center gap-2'>
                  {/* <Input
                    id='discount'
                    type='number'
                    min='0'
                    max='50'
                    value={discountPercent}
                    onChange={e => setDiscountPercent(Number(e.target.value))}
                    className='w-20'
                  /> */}
                  <BsPercent className='h-4 w-4 text-muted-foreground' />
                </div>
              </div>
            </div>

            {/* <Separator /> */}

            {/* Productos seleccionados */}
            <div className='space-y-3'>
              <h4 className='font-medium'>Productos en el Combo</h4>
              {selectedProducts.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  No hay productos seleccionados
                </p>
              ) : (
                <div className='space-y-2'>
                  {selectedProducts.map(product => (
                    <div
                      key={product.id}
                      className='flex items-center justify-between p-2 bg-muted rounded-lg'
                    >
                      <div className='flex-1'>
                        <span className='font-medium text-sm'>{product.name}</span>
                        <div className='text-xs text-muted-foreground'>
                          ${product.price} × {product.quantity} = $
                          {(product.price * product.quantity).toFixed(2)}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Buttons
                          variant='outline'
                          size='sm'
                          onClick={() => updateQuantity(product.id, product.quantity - 1)}
                        >
                          -
                        </Buttons>
                        <span className='w-8 text-center text-sm'>{product.quantity}</span>
                        <Buttons
                          variant='outline'
                          size='sm'
                          onClick={() => updateQuantity(product.id, product.quantity + 1)}
                        >
                          +
                        </Buttons>
                        <Buttons
                          variant='ghost'
                          size='sm'
                          onClick={() => removeProduct(product.id)}
                        >
                          <BiX className='h-4 w-4' />
                        </Buttons>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* <Separator /> */}

            {/* Resumen de precios */}
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Precio original:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-sm text-success'>
                <span>Descuento ({discountPercent}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
              {/* <Separator /> */}
              <div className='flex justify-between font-semibold'>
                <span>Precio final:</span>
                <span className='text-primary'>${finalPrice.toFixed(2)}</span>
              </div>
            </div>

            <Buttons
              className='w-full'
              onClick={handleSaveCombo}
              disabled={!comboName || selectedProducts.length === 0}
            >
              <BiPackage className='h-4 w-4 mr-2' />
              Guardar Combo
            </Buttons>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
