'use client';
import {Card} from '@repo/ui/card/scenes/card';
// import {AddProducts} from '@modules/administre/products/components/form';
import {TableProducts} from '@modules/administre/products/scenes/table';
import {ColumnDef} from '@tanstack/react-table';
// import {Card} from 'primereact/card';

export const Products = () => {
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

  return (
    <Card className='m-5'>
      <div className='w-full'>
        {/* <AddProducts></AddProducts> */}
        <TableProducts
          columns={columns}
          data={dataSource}
          // filters={defaultFilterValue}
        ></TableProducts>
      </div>
    </Card>
  );
};
