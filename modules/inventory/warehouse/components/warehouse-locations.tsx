/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { HiOutlinePencilSquare, HiOutlinePlus, HiOutlineSquares2X2, HiOutlineTrash } from "react-icons/hi2";
import { EmptyBlock, ToggleRow } from "@/components/form-sections";
import { confirm, notify } from "@/components/notifications";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LOCATION_TYPES, type IWarehouse, type IWarehouseLocation } from "../models/warehouse.interface";
import { validationLocation, type LocationFormValues } from "../schemas/warehouse.schema";
import { deleteLocationServerAction, saveLocationServerAction } from "@/app/[locale]/inventory/warehouses/actions";

const LocationForm = ({
  warehouse,
  location,
  onDone,
}: {
  warehouse: IWarehouse;
  location: IWarehouseLocation | null;
  onDone: () => void;
}) => {
  const t = useTranslations("Administre.warehouse.locations");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(validationLocation()),
    defaultValues: {
      code: location?.code ?? "",
      zone: location?.zone ?? "",
      aisle: location?.aisle ?? "",
      rack: location?.rack ?? "",
      level: location?.level ?? "",
      location_type: location?.location_type ?? "STORAGE",
      capacity_units: location?.capacity_units != null ? String(location.capacity_units) : "",
      active: location?.active !== false,
    },
  });
  const values = useWatch({ control });
  const generated = [values.zone, values.aisle, values.rack, values.level].map((part) => part?.trim()).filter(Boolean).join("-").toUpperCase();

  const submit = async (form: LocationFormValues) => {
    const result = await saveLocationServerAction(warehouse.id!, location?.id ?? null, {
      code: form.code.trim() || undefined,
      zone: form.zone.trim() || undefined,
      aisle: form.aisle.trim() || undefined,
      rack: form.rack.trim() || undefined,
      level: form.level.trim() || undefined,
      location_type: form.location_type,
      capacity_units: form.capacity_units ? Number(form.capacity_units) : undefined,
      active: form.active,
    });
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(location ? tCommon("updatedSuccess") : t("added"), result.data?.code ?? undefined);
    onDone();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className='grid grid-cols-12 gap-4' noValidate>
      <FormField controller={{ control, name: "zone" }} label={t("zone")} placeholder='A' className='col-span-6 md:col-span-3' />
      <FormField controller={{ control, name: "aisle" }} label={t("aisle")} placeholder='01' className='col-span-6 md:col-span-3' />
      <FormField controller={{ control, name: "rack" }} label={t("rack")} placeholder='03' className='col-span-6 md:col-span-3' />
      <FormField controller={{ control, name: "level" }} label={t("level")} placeholder='2' className='col-span-6 md:col-span-3' />
      <FormField controller={{ control, name: "code" }} label={t("code")} placeholder={generated || "A-01-03-2"}
        description={t("codeHint")} className='col-span-12 md:col-span-6' />
      <FormSelectField controller={{ control, name: "location_type" }} label={t("type")}
        data={LOCATION_TYPES.map((type) => ({ value: type, label: t(`types.${type}`) }))}
        triggerClassName='!w-full' className='col-span-12 md:col-span-6' />
      <FormField controller={{ control, name: "capacity_units" }} label={t("capacity")} inputMode='numeric'
        className='col-span-12 md:col-span-6' />
      <div className='col-span-12 md:col-span-6 md:self-end'>
        <ToggleRow id='loc-active' label={t("active")} checked={values.active !== false}
          onChange={(checked) => setValue("active", checked)} />
      </div>
      <div className='col-span-12 flex justify-end gap-2'>
        <Buttons type='button' variant='outline' className='rounded-full' onClick={onDone}>
          {tCommon("cancel")}
        </Buttons>
        <Buttons type='submit' loading={isSubmitting} className='rounded-full'>
          {location ? tCommon("save") : t("add")}
        </Buttons>
      </div>
    </form>
  );
};

/** Catálogo de ubicaciones internas (zona, pasillo, estante, nivel) de la bodega. */
export const WarehouseLocations = ({ warehouse, locations }: { warehouse: IWarehouse; locations: IWarehouseLocation[] }) => {
  const t = useTranslations("Administre.warehouse.locations");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const [editing, setEditing] = useState<{ open: boolean; location: IWarehouseLocation | null }>({ open: false, location: null });

  const remove = async (location: IWarehouseLocation) => {
    const ok = await confirm({
      title: t("removeTitle"),
      description: t("removeText", { code: location.code ?? "" }),
      confirmLabel: t("remove"),
      tone: "danger",
    });
    if (!ok) return;
    const result = await deleteLocationServerAction(warehouse.id!, location.id!);
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(t("removed"), location.code ?? undefined);
    router.refresh();
  };

  const addButton = (
    <Buttons type='button' variant='outline' className='rounded-full' onClick={() => setEditing({ open: true, location: null })}>
      <HiOutlinePlus className='h-4 w-4' aria-hidden='true' />
      {t("add")}
    </Buttons>
  );

  return (
    <section aria-labelledby='warehouse-locations' className='grid content-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <h3 id='warehouse-locations' className='flex items-center gap-2 text-sm font-semibold'>
            <HiOutlineSquares2X2 className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
            {t("title")}
          </h3>
          <p className='text-xs text-muted-foreground'>{t("description")}</p>
        </div>
        {locations.length > 0 ? addButton : null}
      </div>
      {locations.length === 0 ? (
        <div className='grid grid-cols-12'>
          <EmptyBlock icon={HiOutlineSquares2X2} title={t("emptyTitle")} description={t("emptyDescription")} action={addButton} />
        </div>
      ) : (
        <ul className='grid max-h-96 gap-1.5 overflow-y-auto pr-1'>
          {locations.map((location) => (
            <li key={location.id} className={cn("flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm",
              location.active === false && "opacity-60")}>
              <div className='min-w-0'>
                <p className='font-mono font-medium'>{location.code}</p>
                <p className='truncate text-xs text-muted-foreground'>
                  {[
                    location.location_type ? t(`types.${location.location_type}` as never) : null,
                    location.capacity_units != null ? t("capacityShort", { count: formatNumber(location.capacity_units) }) : null,
                    location.active === false ? tCommon("inactive") : null,
                  ].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className='flex shrink-0 gap-1'>
                <Buttons type='button' variant='ghost' size='icon' aria-label={t("edit", { code: location.code ?? "" })}
                  onClick={() => setEditing({ open: true, location })}>
                  <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
                </Buttons>
                <Buttons type='button' variant='ghost' size='icon' aria-label={t("removeAria", { code: location.code ?? "" })}
                  onClick={() => remove(location)}>
                  <HiOutlineTrash className='h-4 w-4 text-destructive' aria-hidden='true' />
                </Buttons>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal size='md' open={editing.open} title={editing.location ? t("editTitle") : t("addTitle")}
        onOpenChange={(open) => !open && setEditing({ open: false, location: null })} hideDefaultFooter={true}>
        {editing.open ? (
          <LocationForm warehouse={warehouse} location={editing.location} onDone={() => setEditing({ open: false, location: null })} />
        ) : null}
      </Modal>
    </section>
  );
};
