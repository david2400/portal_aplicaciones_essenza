/** @format */

"use client";

import { SupplierDetail } from "../components/supplier-detail";
import type { ISupplier, ISupplierProduct } from "../models/supplier.interface";

/** Ficha del proveedor con sus productos (`/[id]`). */
export const SupplierDetailScene = ({ supplier, products }: { supplier: ISupplier; products: ISupplierProduct[] }) => (
  <SupplierDetail supplier={supplier} products={products} />
);
