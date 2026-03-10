import {Card} from '@repo/ui/card/scenes/card';
import {ITable} from '@repo/ui/table/models';
import { DataTable } from '@repo/ui/table/scenes';
import React from 'react';

export const TableProducts = ({data, columns, headerTable}: ITable<any>) => {
  return (
    <Card>
      <DataTable
        data={data}
        columns={columns}
        headerTable={headerTable}
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
