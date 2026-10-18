/** @format */

"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import { HiOutlineArrowLeft, HiOutlineBuildingStorefront, HiOutlineComputerDesktop } from "react-icons/hi2";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/shared/i18n/routing";
import { CashRegisterForm } from "../components/cash-register-form";
import { StoreForm } from "../components/store-form";
import {
  REGISTERS_HREF,
  STORES_HREF,
  type ICashRegister,
  type INamedOption,
  type IRegisterMethodOption,
  type IStore,
} from "../models/cash.interface";

const Shell = ({
  back,
  backLabel,
  title,
  description,
  icon,
  children,
}: {
  back: string;
  backLabel: string;
  title: string;
  description?: string;
  icon: IconType;
  children: ReactNode;
}) => {
  const tCrud = useTranslations("Crud");
  return (
    <section className='flex w-full flex-col gap-6'>
      <Link href={back} className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {backLabel}
      </Link>
      <PageHeader title={title} description={description} icon={icon} eyebrow={tCrud("domains.sales")} />
      {children}
    </section>
  );
};

/** Alta o edición de un punto de venta en su propia ruta. */
export const StoreEditor = ({ store, warehouses }: { store?: IStore | null; warehouses: INamedOption[] }) => {
  const t = useTranslations("Administre.cash.store");
  const tf = useTranslations("Administre.cash.store.form");
  return (
    <Shell back={STORES_HREF} backLabel={tf("back")} icon={HiOutlineBuildingStorefront}
      title={store?.id != null ? store.name ?? `#${store.id}` : t("createTitle")}
      description={store?.id != null ? store.code : tf("createDescription")}>
      <StoreForm store={store} warehouses={warehouses} />
    </Shell>
  );
};

/** Alta o edición de una caja en su propia ruta. */
export const CashRegisterEditor = ({
  register,
  stores,
  warehouses,
  methods,
  billingReady,
}: {
  register?: ICashRegister | null;
  stores: IStore[];
  warehouses: INamedOption[];
  methods: IRegisterMethodOption[];
  billingReady: boolean;
}) => {
  const t = useTranslations("Administre.cash.register");
  const tf = useTranslations("Administre.cash.register.form");
  return (
    <Shell back={REGISTERS_HREF} backLabel={tf("back")} icon={HiOutlineComputerDesktop}
      title={register?.id != null ? register.name ?? `#${register.id}` : t("createTitle")}
      description={register?.id != null ? [register.code, register.store_name].filter(Boolean).join(" · ") : tf("createDescription")}>
      <CashRegisterForm register={register} stores={stores} warehouses={warehouses} methods={methods} billingReady={billingReady} />
    </Shell>
  );
};
