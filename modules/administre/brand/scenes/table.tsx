import React, {useRef, useState} from 'react';
import { ITable } from "@repo/ui/interfaces/table/models/index";
// import {DataTable} from '@repo/ui/table/scenes/index';
import {Card} from '@repo/ui/card/scenes/card';

export const TableBrand = ({headerTable, data, columns}: ITable<any>) => {
  // const [category, setCategory] = useState(null);
  // const cm = useRef<any>(null);

  // const onContextMenu = (event: any) => {
  //   cm.current.show(event.originalEvent);
  // };

  // const onContextMenuSelectionChange = (e: any) => {
  //   setCategory(e.value);
  // };

  return (
    <Card>
      {/* <DataTable
        data={data}
        columns={columns}
        headerTable={headerTable}
        className='py-2'
      ></DataTable> */}

      {/* <ContextMenu
        model={contextMenu}
        ref={cm}
        breakpoint='767px'
        onHide={() => setCategory(null)}
      /> */}
    </Card>
  );
};
