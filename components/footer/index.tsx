/** @format */

import { Link } from "@/shared/i18n/routing";

/**
 * Pie de página de la aplicación.
 *
 * Sustituye al pie heredado de la plantilla de comercio electrónico
 * ("TiendaVirtual": newsletter, métodos de pago, envíos y enlaces a rutas
 * que no existen). Ahora sólo apunta a secciones reales del panel.
 */
const SECTIONS = [
  { label: "Órdenes", href: "/ventas/orders" },
  { label: "Productos", href: "/catalogo/products" },
  { label: "Variantes", href: "/catalogo/variants" },
  { label: "Movimientos", href: "/inventory/inventory-movements" },
  { label: "Bodegas", href: "/inventory/warehouses" },
  { label: "Proveedores", href: "/inventory/suppliers" },
];

export const Footer = () => (
  <footer className='mt-10 border-t border-border bg-card/60'>
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8'>
      <div className='space-y-1'>
        <p className='text-sm font-semibold text-foreground'>Essenza</p>
        <p className='text-xs text-muted-foreground'>
          Panel de administración de la tienda.
        </p>
      </div>

      <nav aria-label='Secciones' className='flex flex-wrap gap-x-5 gap-y-2'>
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className='text-xs text-muted-foreground transition-colors hover:text-foreground'>
            {section.label}
          </Link>
        ))}
      </nav>

      <p className='text-xs text-muted-foreground'>
        © {new Date().getFullYear()} Essenza
      </p>
    </div>
  </footer>
);
