import React, { useRef, useState } from "react";
// import {Card} from 'primereact/card';
// import {ContextMenu} from 'primereact/contextmenu';
import { Card } from "@/components/card/scenes/card";
import { DataTable } from "@/components/table/scenes";
import { ITable } from "@/components/table/models";

export const TableCategory = ({
  headerTable,
  data,
  columns,
  // filters,
  // contextMenu,
}: ITable<any>) => {
  // const cm = useRef<any>(null);
  // const [category, setCategory] = useState(null);

  // const onContextMenu = (event: any) => {
  //   cm.current.show(event.originalEvent);
  // };

  // const onContextMenuSelectionChange = (e: any) => {
  //   setCategory(e.value);
  // };

  return (
    <Card className="p-2 m-2">
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
