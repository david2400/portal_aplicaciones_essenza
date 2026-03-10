import React, {useRef, useState} from 'react';
import {Card} from '@repo/ui/card/scenes/card';
import {ITable} from '@repo/ui/table/models';
import {DataTable} from '@repo/ui/table/scenes/index';

export const Tablesubcategory = ({headerTable, data, columns}: ITable<any>) => {
  // const cm = useRef<any>(null);
  // const [category, setCategory] = useState(null);

  // const onContextMenu = (event: any) => {
  //   cm.current.show(event.originalEvent);
  // };

  // const onContextMenuSelectionChange = (e: any) => {
  //   setCategory(e.value);
  // };

  return (
    <Card>
      <DataTable
        data={data}
        columns={columns}
        headerTable={headerTable}
        className='py-2'
        // filters={filters}
        // onContextMenu={onContextMenu}
        // contextMenuSelection={category}
        // onContextMenuSelectionChange={onContextMenuSelectionChange}
      ></DataTable>

      {/* <ContextMenu
        model={contextMenu}
        ref={cm}
        breakpoint='767px'
        onHide={() => setCategory(null)}
      /> */}
    </Card>
  );
};
