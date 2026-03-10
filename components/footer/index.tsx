'use client';

import {Buttons} from '@repo/ui/buttons/scenes/index';
import {FormField} from '@repo/ui/form/scenes/form-field';
import Link from 'next/link';
import {
  BiCreditCard,
  BiMailSend,
  BiMapPin,
  BiPhoneIncoming,
  BiRotateLeft,
  BiShield,
} from 'react-icons/bi';
import {BsInstagram, BsTruck, BsTwitter, BsYoutube} from 'react-icons/bs';
import {FaFacebook} from 'react-icons/fa';

export const Footer = () => (
  <footer className='bg-gray-900 text-gray-300'>
    {/* Main Footer Content */}
    <div className='container mx-auto px-4 py-12'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
        {/* Company Info */}
        <div className='space-y-4'>
          <h3 className='text-white text-lg font-semibold'>TiendaVirtual</h3>
          <p className='text-sm leading-relaxed'>
            Tu tienda online de confianza. Ofrecemos productos de calidad con la mejor atención al
            cliente y envíos rápidos a todo el país.
          </p>
          <div className='flex space-x-4'>
            <Link href='#' className='hover:text-white transition-colors'>
              <FaFacebook className='w-5 h-5' />
            </Link>
            <Link href='#' className='hover:text-white transition-colors'>
              <BsInstagram className='w-5 h-5' />
            </Link>
            <Link href='#' className='hover:text-white transition-colors'>
              <BsTwitter className='w-5 h-5' />
            </Link>
            <Link href='#' className='hover:text-white transition-colors'>
              <BsYoutube className='w-5 h-5' />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className='space-y-4'>
          <h3 className='text-white text-lg font-semibold'>Enlaces Rápidos</h3>
          <ul className='space-y-2'>
            <li>
              <Link href='/productos' className='text-sm hover:text-white transition-colors'>
                Todos los Productos
              </Link>
            </li>
            <li>
              <Link href='/ofertas' className='text-sm hover:text-white transition-colors'>
                Ofertas Especiales
              </Link>
            </li>
            <li>
              <Link href='/nuevos' className='text-sm hover:text-white transition-colors'>
                Nuevos Productos
              </Link>
            </li>
            <li>
              <Link href='/marcas' className='text-sm hover:text-white transition-colors'>
                Marcas
              </Link>
            </li>
            <li>
              <Link href='/blog' className='text-sm hover:text-white transition-colors'>
                Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className='space-y-4'>
          <h3 className='text-white text-lg font-semibold'>Atención al Cliente</h3>
          <ul className='space-y-2'>
            <li>
              <Link href='/contacto' className='text-sm hover:text-white transition-colors'>
                Contacto
              </Link>
            </li>
            <li>
              <Link href='/ayuda' className='text-sm hover:text-white transition-colors'>
                Centro de Ayuda
              </Link>
            </li>
            <li>
              <Link href='/envios' className='text-sm hover:text-white transition-colors'>
                Información de Envíos
              </Link>
            </li>
            <li>
              <Link href='/devoluciones' className='text-sm hover:text-white transition-colors'>
                Devoluciones
              </Link>
            </li>
            <li>
              <Link href='/garantia' className='text-sm hover:text-white transition-colors'>
                Garantía
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className='space-y-4'>
          <h3 className='text-white text-lg font-semibold'>Newsletter</h3>
          <p className='text-sm'>Suscríbete para recibir ofertas exclusivas y novedades.</p>
          <div className='space-y-2'>
            <FormField
              type='email'
              placeholder='Tu email'
              className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-400'
            />
            <Buttons className='w-full bg-blue-600 hover:bg-blue-700'>Suscribirse</Buttons>
          </div>
        </div>
      </div>

      {/* <Separator className='my-8 bg-gray-700' /> */}

      {/* Contact Info */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='flex items-center space-x-3'>
          <BiPhoneIncoming className='w-5 h-5 text-blue-400' />
          <div>
            <p className='text-sm font-medium text-white'>Teléfono</p>
            <p className='text-sm'>+1 (555) 123-4567</p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <BiMailSend className='w-5 h-5 text-blue-400' />
          <div>
            <p className='text-sm font-medium text-white'>Email</p>
            <p className='text-sm'>info@tiendavirtual.com</p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <BiMapPin className='w-5 h-5 text-blue-400' />
          <div>
            <p className='text-sm font-medium text-white'>Dirección</p>
            <p className='text-sm'>Calle Principal 123, Ciudad</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <div className='flex items-center space-x-2'>
          <BsTruck className='w-5 h-5 text-green-400' />
          <span className='text-sm'>Envío Gratis</span>
        </div>
        <div className='flex items-center space-x-2'>
          <BiShield className='w-5 h-5 text-green-400' />
          <span className='text-sm'>Compra Segura</span>
        </div>
        <div className='flex items-center space-x-2'>
          <BiRotateLeft className='w-5 h-5 text-green-400' />
          <span className='text-sm'>30 Días Devolución</span>
        </div>
        <div className='flex items-center space-x-2'>
          <BiCreditCard className='w-5 h-5 text-green-400' />
          <span className='text-sm'>Pago Seguro</span>
        </div>
      </div>

      {/* <Separator className='my-8 bg-gray-700' /> */}

      {/* Bottom Footer */}
      <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
        <div className='flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6'>
          <p className='text-sm'>
            © {new Date().getFullYear()} TiendaVirtual. Todos los derechos reservados.
          </p>
          <div className='flex space-x-4'>
            <Link href='/privacidad' className='text-sm hover:text-white transition-colors'>
              Política de Privacidad
            </Link>
            <Link href='/terminos' className='text-sm hover:text-white transition-colors'>
              Términos y Condiciones
            </Link>
            <Link href='/cookies' className='text-sm hover:text-white transition-colors'>
              Política de Cookies
            </Link>
          </div>
        </div>

        {/* Payment Methods */}
        <div className='flex items-center space-x-2'>
          <span className='text-sm'>Métodos de pago:</span>
          <div className='flex space-x-2'>
            <div className='w-8 h-5 bg-blue-600 rounded flex items-center justify-center'>
              <span className='text-xs text-white font-bold'>VISA</span>
            </div>
            <div className='w-8 h-5 bg-red-600 rounded flex items-center justify-center'>
              <span className='text-xs text-white font-bold'>MC</span>
            </div>
            <div className='w-8 h-5 bg-blue-500 rounded flex items-center justify-center'>
              <span className='text-xs text-white font-bold'>PP</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </footer>
);
