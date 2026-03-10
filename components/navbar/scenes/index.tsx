"use client";

import * as React from 'react';
import {BiCloset, BiMenu, BiLogOut, BiUser, BiCog, BiHelpCircle} from 'react-icons/bi';
import {Menus} from '@repo/ui/menu/scenes/menus';
import {MenuModal} from '@repo/ui/modals/scenes/menu/menuModal';
import {FaShoppingCart} from 'react-icons/fa';
import {BsSkipStart} from 'react-icons/bs';
import {Buttons} from '@repo/ui/buttons/scenes/index';
import {Badge} from '@repo/ui/badges/scenes/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/menu/scenes/dropdown-menu';
import {Avatar, AvatarFallback, AvatarImage} from '@repo/ui/avatar/scenes/avatar';
import {cn} from '@/lib/utils';

const NAV_ITEMS = [
  {
    label: 'Inicio',
    href: '#',
    icon: <BiCloset className='h-4 w-4' />,
  },
  {
    label: 'Categorías',
    options: [
      {label: 'Dashboard', href: '#', icon: <BiCloset className='h-4 w-4' />},
      {
        label: 'Settings',
        options: [
          {label: 'Profile', href: '#', icon: <BiCloset className='h-4 w-4' />},
          {
            label: 'Account',
            options: [
              {label: 'Privacy', href: '#', icon: <BiCloset className='h-4 w-4' />},
              {label: 'Security', href: '#', icon: <BiCloset className='h-4 w-4' />},
            ],
          },
        ],
      },
      {
        label: 'Support',
        options: [
          {label: 'Documentation', href: '#', icon: <BiCloset className='h-4 w-4' />},
          {label: 'Contact Us', href: '#', icon: <BiCloset className='h-4 w-4' />},
        ],
      },
    ],
  },
  {
    label: 'Docs',
    href: '#',
    icon: <BiCloset className='h-4 w-4' />,
  },
];

type NavItem = (typeof NAV_ITEMS)[number];

function NavbarItem({item, onNavigate}: {item: NavItem; onNavigate?: () => void}) {
  if (item.options && item.options.length > 0) {
    return (
      <li>
        <Menus title={item.label} items={item as any} />
      </li>
    );
  }
  return (
    <li>
      <a
        href={item.href}
        onClick={onNavigate}
        className='group flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:-translate-y-[1px] hover:border-border/70 hover:bg-background/80 hover:text-foreground'
      >
        {item.icon}
        <span>{item.label}</span>
      </a>
    </li>
  );
}

function NavList({orientation = 'horizontal', onNavigate}: {orientation?: 'horizontal' | 'vertical'; onNavigate?: () => void}) {
  const baseClasses =
    orientation === 'vertical'
      ? 'flex flex-col gap-2'
      : 'flex flex-row items-center gap-2';

  return (
    <ul className={cn('relative z-40', baseClasses)}>
      {NAV_ITEMS.map(item => (
        <NavbarItem key={item.label} item={item} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

function ProfileMenu() {
  const [openFavorite, setOpenFavorite] = React.useState(false);
  const [openCart, setOpenCart] = React.useState(false);

  return (
    <div className='flex items-center gap-4'>
      <div className='group relative'>
        <Buttons
          variant='ghost'
          size='icon'
          aria-label='Abrir carrito'
          className='relative overflow-hidden text-foreground transition-all before:absolute before:inset-[-40%] before:-z-10 before:rounded-full before:bg-[radial-gradient(circle_at_top,_hsl(var(--primary)_/_0.12),_transparent_65%)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100'
          onClick={() => setOpenCart(open => !open)}
        >
          <FaShoppingCart className='h-5 w-5 text-primary' />
        </Buttons>
        <Badge
          variant='counter'
          className='absolute -right-1 -top-1 min-w-[1.6rem] justify-center px-2 py-1 text-[10px] uppercase tracking-[0.24em]'
        >
          5
        </Badge>
      </div>

      <div className='group relative'>
        <Buttons
          variant='ghost'
          size='icon'
          aria-label='Abrir favoritos'
          className='relative overflow-hidden text-foreground transition-all before:absolute before:inset-[-40%] before:-z-10 before:rounded-full before:bg-[radial-gradient(circle_at_top,_hsl(var(--secondary)_/_0.18),_transparent_65%)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100'
          onClick={() => setOpenFavorite(open => !open)}
        >
          <BsSkipStart className='h-5 w-5 text-secondary-foreground/90' />
        </Buttons>
        <Badge
          variant='outline'
          className='absolute -right-1 -top-1 min-w-[1.6rem] justify-center border-secondary/50 bg-secondary px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-secondary-foreground shadow-[0_18px_40px_-25px_hsl(var(--ring))]'
        >
          5
        </Badge>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Buttons
            variant='ghost'
            size='icon'
            className='rounded-full border border-transparent p-0 transition hover:border-border/70'
          >
            <Avatar className='h-10 w-10 border border-border/70 shadow-sm shadow-primary/30'>
              <AvatarImage
                src='https://raw.githubusercontent.com/creativetimofficial/public-assets/master/ct-assets/team-4.jpg'
                alt='profile'
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Buttons>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-52 p-2' align='end'>
          <DropdownMenuItem className='rounded-lg px-3 py-2 text-sm'>
            <BiUser className='mr-2 h-4 w-4' /> Perfil
          </DropdownMenuItem>
          <DropdownMenuItem className='rounded-lg px-3 py-2 text-sm'>
            <BiCog className='mr-2 h-4 w-4' /> Ajustes
          </DropdownMenuItem>
          <DropdownMenuItem className='rounded-lg px-3 py-2 text-sm'>
            <BiHelpCircle className='mr-2 h-4 w-4' /> Ayuda
          </DropdownMenuItem>
          <DropdownMenuSeparator className='my-2' />
          <DropdownMenuItem className='rounded-lg px-3 py-2 text-sm text-destructive focus:text-destructive'>
            <BiLogOut className='mr-2 h-4 w-4' /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <MenuModal open={openCart} onOpenChange={setOpenCart} className='w-96' title='Tu carrito'>
        <ListCart></ListCart>
      </MenuModal> */}
      {/* <MenuModal
        open={openFavorite}
        onOpenChange={setOpenFavorite}
        className='w-96'
        title='Favoritos'
      >
        <ListFavoriteProduct></ListFavoriteProduct>
      </MenuModal> */}
    </div>
  );
}

export function Nav() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70'>
      <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6'>
        <a href='/' className='text-lg font-semibold tracking-tight text-foreground'>
          Cygnus Shop
        </a>

        <div className='hidden md:flex'>
          <NavList />
        </div>

        <div className='flex items-center gap-4'>
          <div className='md:hidden'>
            <Buttons
              variant='ghost'
              size='icon'
              aria-label='Abrir menú principal'
              onClick={() => setMobileNavOpen(true)}
            >
              <BiMenu className='h-6 w-6' />
            </Buttons>
          </div>

          <ProfileMenu />
        </div>
      </div>

      <MenuModal placement='left' open={mobileNavOpen} onOpenChange={setMobileNavOpen} className='w-80' title='Menú principal'>
        <nav className='flex flex-col gap-3 py-2'>
          <NavList orientation='vertical' onNavigate={() => setMobileNavOpen(false)} />
        </nav>
      </MenuModal>
    </header>
  );
}
