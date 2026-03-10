"use server";
import { SideBarMenu } from "@repo/ui/modals/scenes/sidebar/sidebarMenu";
import React from "react";
import { MenuDynamic } from "@repo/ui/collapse/components/menuDynamic";
import { ListItemData } from "@repo/ui/interfaces/collapse/models/collapse.interfaces";

export default async function AdministreLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const NAV_ITEMS: ListItemData[] = [
    {
      label: "administre",
      options: [
        { label: "category", href: "/administre/category" },
        { label: "brand", href: "/administre/brand" },
        { label: "subcategory", href: "/administre/subcategory" },
        { label: "productos", href: "/administre/products" },
      ],
    },
    {
      label: "docs",
      href: "#",
      // icon: BiCloset,
    },
  ];

  return (
    <div className='flex flex-1'>
      {/* <SideBarMenu title='Filtro'>
        <MenuDynamic data={NAV_ITEMS}></MenuDynamic>
      </SideBarMenu> */}
      {children}
    </div>
  );
}
