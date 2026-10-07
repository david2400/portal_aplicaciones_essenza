/** @format */

import type { SaveUnitDto, UnitDto } from "@/server/domains/product_details/unit-measurements/types";

/** Unidad de medida con magnitud y factor respecto a la base de su magnitud. */
export type IUnitMeasurement = UnitDto;
export type IUnitSaveRequest = SaveUnitDto;

export { UNIT_DIMENSIONS, type UnitDimension } from "@/shared/units/units";
