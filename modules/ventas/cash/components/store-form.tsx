/** @format */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineArchiveBox,
  HiOutlineBuildingStorefront,
  HiOutlineMapPin,
  HiOutlineReceiptPercent,
} from "react-icons/hi2";
import { GeoCascadeFields } from "@/components/geo-cascade-fields";
import { get_city_path_action } from "@/server/domains/parametros/georeferencing/actions";
import { ActionBar, SectionCard, SectionNav, ToggleRow, type FormSectionItem } from "@/components/form-sections";
import { notify } from "@/components/notifications";
import { Link } from "@/shared/i18n/routing";
import { TicketPreview } from "./ticket-preview";
import { STORES_HREF, codeFromName, type INamedOption, type IStore } from "../models/cash.interface";
import { validationStore, type StoreFormValues } from "../schemas/cash.schema";
import { createStoreServerAction, updateStoreServerAction } from "@/app/[locale]/ventas/cash-registers/actions";

/**
 * Punto de venta por secciones: datos, ubicación y contacto, bodega de las ventas y textos del
 * ticket, con vista previa del ticket y lista de verificación.
 */
export const StoreForm = ({ store, warehouses }: { store?: IStore | null; warehouses: INamedOption[] }) => {
  const t = useTranslations("Administre.cash.store");
  const tf = useTranslations("Administre.cash.store.form");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const isNew = store?.id == null;

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    getFieldState,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(validationStore()),
    defaultValues: {
      name: store?.name ?? "",
      code: store?.code ?? "",
      address: store?.address ?? "",
      phone: store?.phone ?? "",
      email: store?.email ?? "",
      warehouse_id: store?.warehouse_id != null ? String(store.warehouse_id) : warehouses[0]?.id != null ? String(warehouses[0].id) : "",
      opening_hours: store?.opening_hours ?? "",
      ticket_header: store?.ticket_header ?? "",
      ticket_footer: store?.ticket_footer ?? "",
      active: store?.active !== false,
      country_id: store?.country_id != null ? String(store.country_id) : "",
      state_id: store?.state_id != null ? String(store.state_id) : "",
      city_id: store?.city_id != null ? String(store.city_id) : "",
    },
  });
  const values = useWatch({ control }) as StoreFormValues;
  // Sede creada antes del catálogo: conserva la ciudad escrita hasta que se elija una ubicación.
  const legacyCity = store?.city_id == null ? (store?.city ?? "") : "";
  const [cityName, setCityName] = useState(store?.city ?? "");

  // Nombre de la ciudad para la vista previa del ticket (el servicio parametros lo resuelve).
  useEffect(() => {
    let cancelled = false;
    if (!values.city_id) {
      setCityName(values.country_id ? "" : legacyCity);
      return;
    }
    get_city_path_action(Number(values.city_id)).then((path) => {
      if (!cancelled) setCityName(path?.city?.name ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [values.city_id, values.country_id, legacyCity]);

  useEffect(() => {
    if (isNew && !getFieldState("code").isDirty && typeof values.name === "string") {
      setValue("code", codeFromName(values.name), { shouldValidate: false });
    }
  }, [isNew, values.name, getFieldState, setValue]);

  const submit = async (form: StoreFormValues) => {
    const toId = (value: string) => (value ? Number(value) : undefined);
    // Se guarda también el nombre de la ciudad: el ticket y los listados no consultan parametros.
    const path = form.city_id ? await get_city_path_action(Number(form.city_id)) : null;
    if (form.city_id && !path?.city?.name) {
      notify.error(tCommon("errorTitle"), tf("cityUnresolved"));
      return;
    }
    const city = path?.city?.name ?? (form.country_id ? "" : legacyCity);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      address: form.address.trim() || undefined,
      city: city.trim() || undefined,
      country_id: toId(form.country_id),
      state_id: toId(form.state_id),
      city_id: toId(form.city_id),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      warehouse_id: Number(form.warehouse_id),
      opening_hours: form.opening_hours.trim() || undefined,
      ticket_header: form.ticket_header.trim() || undefined,
      ticket_footer: form.ticket_footer.trim() || undefined,
      active: form.active,
    };
    const result = isNew ? await createStoreServerAction(payload) : await updateStoreServerAction(store!.id!, payload);
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(isNew ? tCommon("createdSuccess") : tCommon("updatedSuccess"), result.data.name);
    router.push(STORES_HREF);
    router.refresh();
  };

  const has = (...fields: (keyof StoreFormValues)[]) => fields.some((field) => errors[field]);
  const sections: FormSectionItem[] = [
    { id: "st-basic", title: tf("basic"), state: has("name", "code") ? "error" : values.name?.trim() ? "complete" : "pending" },
    { id: "st-contact", title: tf("contact"), state: has("address", "country_id", "state_id", "city_id", "phone", "email", "opening_hours") ? "error" : values.address?.trim() ? "complete" : "optional" },
    { id: "st-stock", title: tf("stock"), state: has("warehouse_id") ? "error" : values.warehouse_id ? "complete" : "pending" },
    { id: "st-ticket", title: tf("ticket"), state: has("ticket_header", "ticket_footer") ? "error" : "optional" },
  ];
  const stateLabel = (state: FormSectionItem["state"]) => tf(`state.${state}`);
  const warehouseName = warehouses.find((w) => String(w.id) === values.warehouse_id)?.name;

  return (
    <form onSubmit={handleSubmit(submit)} className='grid gap-6'>
      <div className='grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_320px]'>
        <aside className='hidden lg:block'>
          <div className='sticky top-20'>
            <SectionNav items={sections} title={tf("sections")} progressLabel={tf("progress")} />
          </div>
        </aside>

        <div className='grid content-start gap-6'>
          <SectionCard id='st-basic' icon={HiOutlineBuildingStorefront} title={tf("basic")} hint={tf("basicHint")}
            state={sections[0]?.state} stateLabel={stateLabel(sections[0]?.state ?? "pending")}>
            <FormField controller={{ control, name: "name" }} label={t("fields.name")} placeholder={tf("namePlaceholder")} required
              className='col-span-12 md:col-span-7' />
            <FormField controller={{ control, name: "code" }} label={t("fields.code")} description={tf("codeHint")}
              className='col-span-12 md:col-span-5' />
            <div className='col-span-12'>
              <ToggleRow id='store-active' label={t("fields.active")} description={tf("activeHint")} checked={Boolean(values.active)}
                onChange={(checked) => setValue("active", checked, { shouldDirty: true })} />
            </div>
          </SectionCard>

          <SectionCard id='st-contact' icon={HiOutlineMapPin} title={tf("contact")} hint={tf("contactHint")}
            state={sections[1]?.state} stateLabel={stateLabel(sections[1]?.state ?? "optional")}>
            {/* El schema con superRefine tipa distinto el control; el componente solo usa los tres campos geo. */}
            <GeoCascadeFields
              control={control as unknown as Control}
              setValue={(name, value) => {
                // Al cambiar el nivel superior los inferiores se vacían: se limpia su error en vez de validarlos
                // (validar aquí dejaba el aviso "Elige…" pegado aunque luego se eligiera el valor).
                const field = name as "country_id" | "state_id" | "city_id";
                setValue(field, value, { shouldDirty: true });
                clearErrors(field);
              }}
              initialCountryId={store?.country_id != null ? String(store.country_id) : ""}
              initialStateId={store?.state_id != null ? String(store.state_id) : ""}
            />
            {legacyCity && !values.country_id ? (
              <p className='col-span-12 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground'>{tf("legacyCity", { city: legacyCity })}</p>
            ) : null}
            <FormField controller={{ control, name: "address" }} label={t("fields.address")} className='col-span-12' />
            <FormField controller={{ control, name: "phone" }} label={t("fields.phone")} className='col-span-12 md:col-span-6' />
            <FormField controller={{ control, name: "email" }} type='email' label={t("fields.email")} className='col-span-12 md:col-span-6' />
            <FormField controller={{ control, name: "opening_hours" }} label={t("fields.openingHours")} placeholder={tf("hoursPlaceholder")}
              className='col-span-12' />
          </SectionCard>

          <SectionCard id='st-stock' icon={HiOutlineArchiveBox} title={tf("stock")} hint={tf("stockHint")}
            state={sections[2]?.state} stateLabel={stateLabel(sections[2]?.state ?? "pending")}>
            <FormSelectField controller={{ control, name: "warehouse_id" }} label={t("fields.warehouse")}
              data={warehouses.filter((w) => w.id != null).map((w) => ({ value: String(w.id), label: w.name ?? `#${w.id}` }))}
              placeholder={tCommon("selectPlaceholder")} triggerClassName='!w-full' className='col-span-12 md:col-span-6' />
            <p className='col-span-12 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground md:col-span-6'>{tf("stockRule")}</p>
          </SectionCard>

          <SectionCard id='st-ticket' icon={HiOutlineReceiptPercent} title={tf("ticket")} hint={tf("ticketHint")}
            state={sections[3]?.state} stateLabel={stateLabel(sections[3]?.state ?? "optional")}>
            <FormTextAreaField controller={{ control, name: "ticket_header" }} label={t("fields.ticketHeader")}
              placeholder={tf("headerPlaceholder")} className='col-span-12' />
            <FormTextAreaField controller={{ control, name: "ticket_footer" }} label={t("fields.ticketFooter")}
              placeholder={tf("footerPlaceholder")} className='col-span-12' />
          </SectionCard>
        </div>

        <aside className='grid content-start gap-4 lg:sticky lg:top-20'>
          <section className='grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>{tf("preview")}</h3>
            <div className='overflow-x-auto rounded-xl bg-muted/40 p-3'>
              <TicketPreview
                data={{
                  storeName: values.name?.trim(),
                  address: values.address?.trim(),
                  city: cityName.trim(),
                  phone: values.phone?.trim(),
                  header: values.ticket_header,
                  footer: values.ticket_footer,
                  registerName: tf("sampleRegister"),
                  date: new Date().toLocaleDateString(),
                  lines: [
                    { name: tf("sampleItem1"), quantity: 2, total: 70000 },
                    { name: tf("sampleItem2"), quantity: 1, total: 2500 },
                  ],
                  total: 72500,
                  tax: 11576,
                }}
              />
            </div>
          </section>
          <section className='grid gap-2 rounded-2xl border border-border bg-card p-4 text-sm shadow-sm'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>{tf("summary")}</h3>
            <p>
              <span className='text-muted-foreground'>{t("fields.warehouse")}: </span>
              <span className='font-medium'>{warehouseName ?? "—"}</span>
            </p>
            {!isNew ? (
              <p className='text-muted-foreground'>{tf("registersSummary", { count: store?.registers_count ?? 0, open: store?.open_registers ?? 0 })}</p>
            ) : null}
          </section>
        </aside>
      </div>

      <ActionBar message={isDirty ? tf("unsaved") : undefined}>
        <Link href={STORES_HREF}
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
