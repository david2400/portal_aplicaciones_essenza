/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, useWatch, type Control, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineArrowUturnLeft,
  HiOutlineArchiveBox,
  HiOutlineBuildingStorefront,
  HiOutlineCog6Tooth,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineHandRaised,
  HiOutlineIdentification,
  HiOutlineMapPin,
  HiOutlineTruck,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import {
  ActionBar,
  ChoiceCard,
  SectionCard,
  SectionNav,
  ToggleRow,
  type FormSectionItem,
} from "@/components/form-sections";
import { GeoCascadeFields } from "@/components/geo-cascade-fields";
import { notify } from "@/components/notifications";
import { formatNumber } from "@/lib/format";
import { Link } from "@/shared/i18n/routing";
import { get_city_path_action } from "@/server/domains/parametros/georeferencing/actions";
import {
  WAREHOUSE_TYPES,
  WAREHOUSES_HREF,
  type IWarehouse,
  type IWarehouseSave,
  type WarehouseType,
} from "../models/warehouse.interface";
import { validationWarehouse, type WarehouseFormValues } from "../schemas/warehouse.schema";
import { WarehouseTypeBadge } from "./warehouse-type-badge";
import { createWarehouseServerAction, updateWarehouseServerAction } from "@/app/[locale]/inventory/warehouses/actions";

const TYPE_ICON: Record<WarehouseType, IconType> = {
  ALMACEN: HiOutlineArchiveBox,
  TIENDA: HiOutlineBuildingStorefront,
  TRANSITO: HiOutlineTruck,
  DEVOLUCIONES: HiOutlineArrowUturnLeft,
  CONSIGNACION: HiOutlineHandRaised,
};

const str = (value: number | string | null | undefined) => (value == null ? "" : String(value));
const num = (value: string) => (value.trim() === "" ? undefined : Number(value));
const text = (value: string) => value.trim() || undefined;

const toValues = (w?: IWarehouse | null): WarehouseFormValues => ({
  name: w?.name ?? "",
  code: w?.code ?? "",
  warehouse_type: w?.warehouse_type ?? "ALMACEN",
  active: w?.active !== false,
  allow_sales: w ? w.allow_sales !== false : true,
  allow_online: w ? w.allow_online !== false : true,
  allow_receiving: w ? w.allow_receiving !== false : true,
  fulfillment_priority: str(w?.fulfillment_priority ?? 10),
  address: w?.address ?? "",
  country_id: str(w?.country_id),
  state_id: str(w?.state_id),
  city_id: str(w?.city_id),
  manager_name: w?.manager_name ?? "",
  manager_phone: w?.manager_phone ?? "",
  manager_email: w?.manager_email ?? "",
  opening_hours: w?.opening_hours ?? "",
  notes: w?.notes ?? "",
  area_m2: str(w?.area_m2),
  capacity_units: str(w?.capacity_units),
  capacity_positions: str(w?.capacity_positions),
});

/**
 * Bodega por secciones: identificación y tipo, operación, ubicación (catálogo de parametros),
 * responsable y horario, capacidad y notas, con resumen lateral. Página propia para alta y edición.
 */
export const WarehouseForm = ({ warehouse }: { warehouse?: IWarehouse | null }) => {
  const t = useTranslations("Administre.warehouse");
  const tf = useTranslations("Administre.warehouse.form");
  const tTypes = useTranslations("Administre.warehouse.types");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const isNew = warehouse?.id == null;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(validationWarehouse()),
    defaultValues: toValues(warehouse),
  });
  const values = useWatch({ control }) as WarehouseFormValues;
  const isTransit = values.warehouse_type === "TRANSITO";
  const isMain = Boolean(warehouse?.is_main);

  const submit = async (form: WarehouseFormValues) => {
    setSubmitError(null);
    const path = form.city_id ? await get_city_path_action(Number(form.city_id)) : null;
    if (form.city_id && !path?.city?.name) {
      notify.error(tCommon("errorTitle"), tf("cityUnresolved"));
      return;
    }
    const payload: IWarehouseSave = {
      name: form.name.trim(),
      code: text(form.code)?.toUpperCase(),
      warehouse_type: form.warehouse_type,
      active: form.active,
      allow_sales: form.warehouse_type === "TRANSITO" ? false : form.allow_sales,
      allow_online: form.allow_online,
      allow_receiving: form.allow_receiving,
      fulfillment_priority: Number(form.fulfillment_priority),
      address: text(form.address),
      country_id: num(form.country_id),
      state_id: num(form.state_id),
      city_id: num(form.city_id),
      city: path?.city?.name ?? undefined,
      manager_name: text(form.manager_name),
      manager_phone: text(form.manager_phone),
      manager_email: text(form.manager_email),
      opening_hours: text(form.opening_hours),
      notes: text(form.notes),
      area_m2: num(form.area_m2),
      capacity_units: num(form.capacity_units),
      capacity_positions: num(form.capacity_positions),
    };
    const result = isNew ? await createWarehouseServerAction(payload) : await updateWarehouseServerAction(warehouse!.id!, payload);
    if (!result.success) {
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(field as Path<WarehouseFormValues>, { type: "server", message });
      }
      setSubmitError(result.error);
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(isNew ? tCommon("createdSuccess") : tCommon("updatedSuccess"), result.data?.name ?? payload.name);
    router.push(result.data?.id != null ? `${WAREHOUSES_HREF}/${result.data.id}` : WAREHOUSES_HREF);
    router.refresh();
  };

  const has = (...fields: (keyof WarehouseFormValues)[]) => fields.some((field) => errors[field]);
  const sections: FormSectionItem[] = [
    { id: "wh-basic", title: tf("basic"), state: has("name", "code", "warehouse_type") ? "error" : values.name?.trim() ? "complete" : "pending" },
    { id: "wh-operation", title: tf("operation"), state: has("allow_sales", "fulfillment_priority") ? "error" : "complete" },
    {
      id: "wh-location",
      title: tf("location"),
      state: has("address", "country_id", "state_id", "city_id") ? "error" : values.city_id || values.address?.trim() ? "complete" : "optional",
    },
    {
      id: "wh-manager",
      title: tf("manager"),
      state: has("manager_name", "manager_phone", "manager_email", "opening_hours") ? "error" : values.manager_name?.trim() ? "complete" : "optional",
    },
    {
      id: "wh-capacity",
      title: tf("capacity"),
      state: has("area_m2", "capacity_units", "capacity_positions") ? "error" : values.capacity_units ? "complete" : "optional",
    },
    { id: "wh-notes", title: tf("notes"), state: has("notes") ? "error" : "optional" },
  ];
  const section = (id: string) => sections.find((item) => item.id === id)?.state ?? "optional";
  const stateLabel = (state: FormSectionItem["state"]) => tf(`state.${state}`);
  const geoSetValue = (name: string, value: string) => {
    const field = name as "country_id" | "state_id" | "city_id";
    setValue(field, value, { shouldDirty: true });
    clearErrors(field);
  };
  const operations = [
    values.allow_sales && !isTransit ? tf("opSales") : null,
    values.allow_online ? tf("opOnline") : null,
    values.allow_receiving ? tf("opReceiving") : null,
  ].filter(Boolean);
  const occupancy =
    !isNew && warehouse?.capacity_units && values.capacity_units
      ? Math.round(((warehouse.units_on_hand ?? 0) * 1000) / Number(values.capacity_units)) / 10
      : null;

  return (
    <form onSubmit={handleSubmit(submit)} className='grid gap-6' noValidate>
      <div className='grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_300px]'>
        <aside className='hidden lg:block'>
          <div className='sticky top-20'>
            <SectionNav items={sections} title={tf("sections")} progressLabel={tf("progress")} />
          </div>
        </aside>

        <div className='grid content-start gap-6'>
          {/* 1. Identificación y tipo */}
          <SectionCard id='wh-basic' icon={HiOutlineIdentification} title={tf("basic")} hint={tf("basicHint")}
            state={section("wh-basic")} stateLabel={stateLabel(section("wh-basic"))}>
            <FormField controller={{ control, name: "name" }} label={t("fields.name")} placeholder={tf("namePlaceholder")} required
              className='col-span-12 md:col-span-8' />
            <FormField controller={{ control, name: "code" }} label={t("fields.code")} description={isNew ? tf("codeHint") : undefined}
              placeholder={isNew ? "BOD_…" : undefined} className='col-span-12 md:col-span-4' />
            <fieldset className='col-span-12 grid gap-2'>
              <legend className='mb-2 text-sm font-medium text-foreground'>{t("fields.type")}</legend>
              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                {WAREHOUSE_TYPES.map((type) => (
                  <ChoiceCard key={type} name='warehouse-type' value={type} icon={TYPE_ICON[type]} title={tTypes(type)}
                    description={tf(`typeHint.${type}`)} selected={values.warehouse_type === type}
                    disabled={isMain && type !== "ALMACEN" && type !== "TIENDA"}
                    onSelect={() => {
                      setValue("warehouse_type", type, { shouldDirty: true, shouldValidate: true });
                      if (type === "TRANSITO") setValue("allow_sales", false, { shouldDirty: true });
                    }} />
                ))}
              </div>
              {isMain ? <p className='text-xs text-muted-foreground'>{tf("mainTypeHint")}</p> : null}
            </fieldset>
            <div className='col-span-12'>
              <ToggleRow id='wh-active' label={t("fields.active")} disabled={isMain}
                description={isMain ? tf("mainActiveHint") : tf("activeHint")} checked={Boolean(values.active)}
                onChange={(checked) => setValue("active", checked, { shouldDirty: true })} />
            </div>
          </SectionCard>

          {/* 2. Operación */}
          <SectionCard id='wh-operation' icon={HiOutlineCog6Tooth} title={tf("operation")} hint={tf("operationHint")}
            state={section("wh-operation")} stateLabel={stateLabel(section("wh-operation"))}>
            <div className='col-span-12 grid gap-3'>
              <ToggleRow id='wh-sales' label={t("fields.allowSales")} disabled={isTransit}
                description={isTransit ? tf("transitNoSales") : tf("salesHint")} checked={Boolean(values.allow_sales) && !isTransit}
                onChange={(checked) => setValue("allow_sales", checked, { shouldDirty: true, shouldValidate: true })} />
              <ToggleRow id='wh-online' label={t("fields.allowOnline")} description={tf("onlineHint")} checked={Boolean(values.allow_online)}
                onChange={(checked) => setValue("allow_online", checked, { shouldDirty: true })} />
              <ToggleRow id='wh-receiving' label={t("fields.allowReceiving")} description={tf("receivingHint")}
                checked={Boolean(values.allow_receiving)}
                onChange={(checked) => setValue("allow_receiving", checked, { shouldDirty: true })} />
            </div>
            <FormField controller={{ control, name: "fulfillment_priority" }} label={t("fields.priority")} inputMode='numeric'
              description={tf("priorityHint")} className='col-span-12 md:col-span-4' />
          </SectionCard>

          {/* 3. Ubicación */}
          <SectionCard id='wh-location' icon={HiOutlineMapPin} title={tf("location")} hint={tf("locationHint")}
            state={section("wh-location")} stateLabel={stateLabel(section("wh-location"))}>
            {/* El schema con superRefine tipa distinto el control; el componente solo usa los tres campos geo. */}
            <GeoCascadeFields control={control as unknown as Control} setValue={geoSetValue}
              initialCountryId={str(warehouse?.country_id)} initialStateId={str(warehouse?.state_id)} />
            <FormField controller={{ control, name: "address" }} label={t("fields.address")} className='col-span-12' />
          </SectionCard>

          {/* 4. Responsable y horario */}
          <SectionCard id='wh-manager' icon={HiOutlineUserCircle} title={tf("manager")} hint={tf("managerHint")}
            state={section("wh-manager")} stateLabel={stateLabel(section("wh-manager"))}>
            <FormField controller={{ control, name: "manager_name" }} label={t("fields.managerName")} className='col-span-12 md:col-span-5' />
            <FormField controller={{ control, name: "manager_phone" }} type='tel' label={t("fields.managerPhone")}
              className='col-span-12 md:col-span-3' />
            <FormField controller={{ control, name: "manager_email" }} type='email' label={t("fields.managerEmail")}
              className='col-span-12 md:col-span-4' />
            <FormField controller={{ control, name: "opening_hours" }} label={t("fields.openingHours")} placeholder={tf("hoursPlaceholder")}
              className='col-span-12' />
          </SectionCard>

          {/* 5. Capacidad */}
          <SectionCard id='wh-capacity' icon={HiOutlineCube} title={tf("capacity")} hint={tf("capacityHint")}
            state={section("wh-capacity")} stateLabel={stateLabel(section("wh-capacity"))}>
            <FormField controller={{ control, name: "area_m2" }} label={t("fields.area")} inputMode='decimal' suffix='m²'
              className='col-span-12 md:col-span-4' />
            <FormField controller={{ control, name: "capacity_units" }} label={t("fields.capacityUnits")} inputMode='numeric'
              description={tf("unitsHint")} className='col-span-12 md:col-span-4' />
            <FormField controller={{ control, name: "capacity_positions" }} label={t("fields.capacityPositions")} inputMode='numeric'
              description={tf("positionsHint")} className='col-span-12 md:col-span-4' />
          </SectionCard>

          {/* 6. Notas */}
          <SectionCard id='wh-notes' icon={HiOutlineDocumentText} title={tf("notes")} hint={tf("notesHint")}
            state={section("wh-notes")} stateLabel={stateLabel(section("wh-notes"))}>
            <FormTextAreaField controller={{ control, name: "notes" }} label={t("fields.notes")} placeholder={tf("notesPlaceholder")}
              showCounter maxLength={1000} className='col-span-12' />
          </SectionCard>
        </div>

        <aside className='grid content-start gap-4 lg:sticky lg:top-20'>
          <section className='grid gap-3 rounded-2xl border border-border bg-card p-4 text-sm shadow-sm'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>{tf("summary")}</h3>
            <div>
              <p className='truncate text-base font-semibold text-foreground'>{values.name?.trim() || "—"}</p>
              <p className='font-mono text-xs text-muted-foreground'>{values.code?.trim().toUpperCase() || (isNew ? "BOD_…" : "—")}</p>
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
              <WarehouseTypeBadge type={values.warehouse_type} />
              {isMain ? <span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary'>{t("main")}</span> : null}
              {!values.active ? <span className='rounded-full bg-muted px-2 py-0.5 text-xs'>{tCommon("inactive")}</span> : null}
            </div>
            <dl className='grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5'>
              <dt className='text-muted-foreground'>{tf("operation")}</dt>
              <dd className='text-right font-medium'>{operations.length ? operations.join(" · ") : tf("opNone")}</dd>
              <dt className='text-muted-foreground'>{t("fields.priority")}</dt>
              <dd className='text-right font-medium tabular-nums'>{values.fulfillment_priority || "—"}</dd>
              <dt className='text-muted-foreground'>{tf("manager")}</dt>
              <dd className='truncate text-right font-medium'>{values.manager_name?.trim() || "—"}</dd>
              {values.capacity_units ? (
                <>
                  <dt className='text-muted-foreground'>{t("fields.capacityUnits")}</dt>
                  <dd className='text-right font-medium tabular-nums'>{formatNumber(Number(values.capacity_units))}</dd>
                </>
              ) : null}
              {occupancy != null ? (
                <>
                  <dt className='text-muted-foreground'>{t("occupancy")}</dt>
                  <dd className='text-right font-medium tabular-nums'>{formatNumber(occupancy)} %</dd>
                </>
              ) : null}
            </dl>
          </section>
          {submitError ? (
            <p role='alert' className='rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive'>{submitError}</p>
          ) : null}
        </aside>
      </div>

      <ActionBar message={isDirty ? tf("unsaved") : undefined}>
        <Link href={isNew ? WAREHOUSES_HREF : `${WAREHOUSES_HREF}/${warehouse!.id}`}
          className='inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:bg-muted'>
          {tCommon("cancel")}
        </Link>
        <Buttons type='submit' loading={isSubmitting} className='rounded-full'>
          {isNew ? tf("create") : tCommon("save")}
        </Buttons>
      </ActionBar>
    </form>
  );
};
