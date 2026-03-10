'use client';
import {useCallback, useMemo, useState} from 'react';
import {Modal} from '@repo/ui/modals/scenes/dialog/modal';
import {AddCategory} from '@modules/administre/category/components/form';
import {TableCategory} from '@modules/administre/category/scenes/table';
import {ColumnDef} from '@tanstack/react-table';
import {Buttons} from '@repo/ui/buttons/scenes/index';
import {
  HiOutlineSquaresPlus,
  HiOutlineTag,
  HiOutlineChartBar,
  HiOutlinePlusCircle,
} from 'react-icons/hi2';
import classNames from 'classnames';

export const Category = () => {
  const [openModal, setopenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'id',
      // cell: ({cell, row}) => {
      //   return (
      //     <div className='d-flex gap-2 justify-content-center'>
      //       <Button onClick={() => handlerUpdate(row.original.id)}>Editar</Button>
      //       <Button variant='warning' onClick={() => askDelete(row.original.id)}>
      //         Inactivar
      //       </Button>
      //     </div>
      //   )
      // },
      enableColumnFilter: false,
      enableSorting: false,
    },
  ];

  const dataSource = [
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
    {
      id: '10200',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Bamboo',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
  ];

  const filteredData = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    return dataSource.filter(item => {
      const matchesSearch = normalizedTerm.length
        ? `${item.name} ${item.description}`.toLowerCase().includes(normalizedTerm)
        : true;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? item.inventoryStatus === 'INSTOCK'
            : item.inventoryStatus !== 'INSTOCK';
      return matchesSearch && matchesStatus;
    });
  }, [dataSource, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const total = dataSource.length;
    const active = dataSource.filter(item => item.inventoryStatus === 'INSTOCK').length;
    const totalProducts = dataSource.reduce((acc, item) => acc + (item.quantity ?? 0), 0);
    const averagePrice =
      dataSource.reduce((acc, item) => acc + (item.price ?? 0), 0) / (total || 1);

    return {
      total,
      active,
      totalProducts,
      averagePrice: Number.isFinite(averagePrice) ? averagePrice.toFixed(0) : '0',
    };
  }, [dataSource]);

  const headerTable = useCallback(() => {
    return (
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-6'>
        <div className='flex flex-row items-center py-4 justify-between'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
            <div className='inline-flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 text-xs font-semibold text-muted-foreground shadow-sm'>
              {[
                {label: 'Todas', value: 'all'},
                {label: 'Activas', value: 'active'},
                {label: 'En pausa', value: 'paused'},
              ].map(filter => (
                <button
                  key={filter.value}
                  type='button'
                  onClick={() => setStatusFilter(filter.value as typeof statusFilter)}
                  className={classNames(
                    'rounded-full px-3 py-1.5 transition',
                    statusFilter === filter.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:text-primary'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Buttons
              className='rounded-full bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary'
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Reiniciar filtros
            </Buttons>
            <Buttons
              className='inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm'
              color='success'
              onClick={() => setopenModal(true)}
            >
              <HiOutlinePlusCircle className='h-4 w-4' />
              Nueva categoría
            </Buttons>
          </div>
        </div>
      </div>
    );
  }, [searchTerm, statusFilter]);

  const summaryCards = [
    {
      icon: HiOutlineSquaresPlus,
      label: 'Categorías registradas',
      value: metrics.total,
      accent: 'from-rose-500/40 to-pink-500/40 text-rose-600',
    },
    {
      icon: HiOutlineTag,
      label: 'Categorías activas',
      value: metrics.active,
      accent: 'from-indigo-500/40 to-sky-500/40 text-indigo-600',
    },
    {
      icon: HiOutlineChartBar,
      label: 'Stock promedio',
      value: metrics.totalProducts,
      accent: 'from-amber-500/40 to-orange-500/40 text-amber-600',
    },
  ];

  return (
    <section className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-6'>
      <article className='relative isolate rounded-3xl border border-border/40 bg-gradient-to-br from-rose-600 via-purple-600 to-indigo-600 px-8 py-12 text-white shadow-[0_25px_60px_-20px_rgba(59,130,246,0.55)] md:px-10'>
        <div
          className='pointer-events-none absolute inset-y-0 right-0 hidden max-w-sm rounded-l-full bg-[radial-gradient(circle_at_top,#ffffff26,transparent_65%)] lg:block'
          aria-hidden
        />
        <div className='relative flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between'>
          <div className='max-w-2xl space-y-6 min-w-0'>
            <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
              Categoria
            </span>
            <header className='space-y-4'>
              <h1 className='text-balance text-4xl font-semibold leading-tight md:text-5xl'>
                Gestión de categorías
              </h1>
              <p className='max-w-xl text-sm text-white/80 md:text-base'>
                Organiza jerarquías de productos, visualiza indicadores de stock y mantén tu tienda
                estructurada y coherente.
              </p>
            </header>
            <div className='flex flex-wrap items-center gap-4 text-xs text-white/80 md:text-sm'>
              <Buttons
                className='inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/25'
                onClick={() => setopenModal(true)}
              >
                <HiOutlinePlusCircle className='h-4 w-4' />
                Registrar categoría
              </Buttons>
              <span className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/75'>
                +{metrics.total} marcas activas
              </span>
            </div>
          </div>
        </div>
      </article>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {summaryCards.map(card => (
          <div
            key={card.label}
            className={`rounded-2xl border border-border/40 bg-gradient-to-br ${card.accent} px-5 py-4 shadow-sm backdrop-blur`}
          >
            <div className='flex items-center justify-between text-sm font-semibold text-muted-foreground'>
              <span className='text-white/80'>{card.label}</span>
              <card.icon className='h-5 w-5 text-white/70' />
            </div>
            <p className='mt-2 text-2xl font-semibold text-white'>{card.value}</p>
          </div>
        ))}
      </div>

      <TableCategory
        columns={columns}
        data={filteredData}
        headerTable={headerTable}
      ></TableCategory>

      <Modal title='Registrar categoría' open={openModal} onOpenChange={setopenModal}>
        <AddCategory></AddCategory>
      </Modal>
    </section>
  );
};
