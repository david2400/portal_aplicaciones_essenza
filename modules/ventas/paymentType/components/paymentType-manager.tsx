/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  HiOutlineCalendarDays,
  HiOutlineCreditCard,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn } from "@/components/data-grid";
import { formatApiDate, createdWithin } from "@/lib/format";
import { RegisterPaymentType, UpdatePaymentType } from "./form";
import type { IPaymentType } from "../models/paymentType.interface";
import { deletePaymentTypeServerAction } from "@/app/[locale]/ventas/payment-types/actions";

interface IPaymentTypeManagerProps {
  initialData: IPaymentType[];
}

/** Medios de pago aceptados por la tienda. */
export const PaymentTypeManager = ({ initialData }: IPaymentTypeManagerProps) => {
  const t = useTranslations("Administre.paymentType");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");

  const columns = useMemo<GridColumn<IPaymentType>[]>(
    () => [
      {
        id: "name",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{row.original.name ?? "—"}</span>,
      },
      {
        id: "updatedAt",
        header: tCrud("updatedAt"),
        meta: { label: tCrud("updatedAt"), exportValue: (row) => formatApiDate(row.updatedAt ?? row.createdAt) },
        cell: ({ row }) => (
          <span className='whitespace-nowrap text-muted-foreground'>
            {formatApiDate(row.original.updatedAt ?? row.original.createdAt)}
          </span>
        ),
      },
    ],
    [t, tCommon, tCrud],
  );

  const now = Date.now();
  const stats = [
    { label: t("total"), value: initialData.length, icon: HiOutlineCreditCard },
    {
      label: tCrud("recent"),
      value: initialData.filter((item) => createdWithin(item.createdAt, 30, now)).length,
      icon: HiOutlineCalendarDays,
      hint: tCrud("recentHint"),
    },
  ];

  return (
    <CrudManager<IPaymentType>
      gridId='medios-de-pago'
      namespace='Administre.paymentType'
      icon={HiOutlineCreditCard}
      eyebrow={tCrud("domains.sales")}
      data={initialData}
      columns={columns}
      stats={stats}
      rowLabel={(row) => row.name ?? `#${row.id}`}
      searchText={(row) => (row.name ?? "")}
      renderForm={(item, close) =>
        item ? (
          <UpdatePaymentType initialValues={item} handleClose={close} />
        ) : (
          <RegisterPaymentType handleClose={close} />
        )}
      onDelete={(id) => deletePaymentTypeServerAction(id)}
    />
  );
};
