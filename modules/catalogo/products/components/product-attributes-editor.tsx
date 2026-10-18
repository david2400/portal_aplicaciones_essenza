/** @format */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Input } from "@repo/ui/inputs/scenes/input";
import { Label } from "@repo/ui/label/scenes/label";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckCircle,
  HiOutlineDocumentDuplicate,
  HiOutlineExclamationTriangle,
  HiOutlineListBullet,
  HiOutlineSwatch,
  HiOutlinePlus,
  HiOutlineXMark,
} from "react-icons/hi2";
import { AsyncCombobox, type ComboOption } from "@/components/async-combobox";
import { Link } from "@/shared/i18n/routing";
import { ActionBar, KpiStrip, SectionCard } from "@/components/form-sections";
import { notify } from "@/components/notifications";
import {
  EMPTY_DRAFT,
  NONE,
  type AttributeDraft,
  type IAttributeDefinition,
  type IProductAttributes,
  type IProductAttributesSaveRequest,
  type IProductTemplateDefinition,
} from "../models/product-attributes.interface";
import {
  getProductAttributesServerAction,
  listAttributesServerAction,
  saveProductAttributesServerAction,
} from "@/app/[locale]/catalogo/products/actions";

interface IProductAttributesEditorProps {
  productId: number;
  templates: IProductTemplateDefinition[];
  attributes: IAttributeDefinition[];
  /** En un modal: se cierra al guardar completa. En el editor por pestañas se omite. */
  handleClose?: () => void;
}

/** Fila de la ficha: atributo, si es obligatorio y si viene de la plantilla o es adicional. */
type SheetItem = { definition: IAttributeDefinition; required: boolean; fromTemplate: boolean };

type TemplateItem = NonNullable<IProductTemplateDefinition["attributes"]>[number];

const hasValue = (draft: AttributeDraft | undefined, dataType?: string) => {
  if (!draft) return false;
  switch (dataType) {
    case "NUMBER":
      return draft.number.trim() !== "";
    case "BOOLEAN":
      return draft.bool !== "";
    case "OPTION":
      return draft.option !== "";
    default:
      return draft.text.trim() !== "";
  }
};

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const draftFrom = (value: IProductAttributes["values"] extends (infer V)[] | undefined ? V : never): AttributeDraft => ({
  text: value.value_text ?? "",
  number: value.value_number != null ? String(value.value_number) : "",
  bool: value.value_boolean == null ? "" : value.value_boolean ? "true" : "false",
  option: value.option_id != null ? String(value.option_id) : "",
});

/**
 * Ficha técnica del producto: plantilla, valores por atributo y opciones de los
 * ejes (color, talla…) en cada variante. Los obligatorios de la plantilla están
 * siempre en la ficha; los opcionales se añaden uno a uno (o todos) y, además, se
 * puede sumar cualquier atributo ya creado como adicional. Si el producto está
 * publicado, el backend exige obligatorios y ejes completos.
 */
export const ProductAttributesEditor = ({ productId, templates, attributes, handleClose }: IProductAttributesEditorProps) => {
  const t = useTranslations("Administre.productAttributes");
  const tAttr = useTranslations("Administre.attribute");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();

  const [data, setData] = useState<IProductAttributes | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState<string>(NONE);
  const [drafts, setDrafts] = useState<Record<number, AttributeDraft>>({});
  /** Atributos que el usuario tiene en la ficha (además de los obligatorios), en orden. */
  const [rowIds, setRowIds] = useState<number[]>([]);
  /**
   * Catálogo de atributos: arranca con el de la página y se vuelve a pedir al servidor al
   * abrir el buscador o al volver a esta pestaña, para ver atributos recién creados.
   */
  const [catalog, setCatalog] = useState<IAttributeDefinition[]>(attributes);
  const catalogRequest = useRef<Promise<IAttributeDefinition[]> | null>(null);
  const refreshCatalog = useCallback(() => {
    if (!catalogRequest.current) {
      catalogRequest.current = listAttributesServerAction()
        .then((result) => {
          if (!result.success || !result.data) return null;
          setCatalog(result.data);
          return result.data;
        })
        .catch(() => null)
        .then((fresh) => {
          catalogRequest.current = null;
          return fresh ?? [];
        });
    }
    return catalogRequest.current;
  }, []);

  useEffect(() => {
    setCatalog(attributes);
  }, [attributes]);

  // Al volver de crear un atributo en otra pestaña, el catálogo se actualiza solo.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshCatalog();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [refreshCatalog]);
  const [variantOptions, setVariantOptions] = useState<Record<number, Record<number, string>>>({});

  const hydrate = (result: IProductAttributes) => {
    setData(result);
    setTemplateId(result.template_id != null ? String(result.template_id) : NONE);
    setDrafts(Object.fromEntries((result.values ?? []).map((value) => [value.attribute_id, draftFrom(value)])));
    setRowIds((result.values ?? []).map((value) => value.attribute_id));
    setVariantOptions(
      Object.fromEntries(
        (result.variants ?? []).map((variant) => [
          variant.sku_id,
          Object.fromEntries((variant.options ?? []).map((option) => [option.attribute_id, String(option.option_id)])),
        ]),
      ),
    );
  };

  useEffect(() => {
    let active = true;
    getProductAttributesServerAction(productId).then((result) => {
      if (!active) return;
      if (result.success && result.data) hydrate(result.data);
      else setLoadError(result.success ? tCommon("unexpectedError") : result.error);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  /** Catálogo completo de atributos (más los que trae la ficha, por si alguno no viene en la lista). */
  const attributesById = useMemo(() => {
    const map = new Map<number, IAttributeDefinition>();
    for (const item of [...(data?.attributes ?? []), ...catalog]) {
      if (item.id != null) map.set(item.id, item);
    }
    return map;
  }, [catalog, data?.attributes]);
  const template = templates.find((item) => String(item.id) === templateId) ?? null;

  /**
   * Ficha: obligatorios de la plantilla + los que el usuario añadió (opcionales de la
   * plantilla y adicionales). Ejes de variante aparte. Sugerencias = opcionales aún no añadidos.
   */
  const { sheet, axes, suggestions, axisIds } = useMemo(() => {
    const items: TemplateItem[] = template?.attributes ?? [];
    const resolve = (attributeId: number) =>
      items.find((item) => item.attribute_id === attributeId)?.attribute ?? attributesById.get(attributeId);
    const axisItems = items.filter((item) => item.variant_axis);
    const axisSet = new Set(axisItems.map((item) => item.attribute_id));
    const sheetItems = items.filter((item) => !item.variant_axis);
    const chosen = new Set(rowIds);

    const rows: SheetItem[] = [];
    const seen = new Set<number>();
    // Primero los de la plantilla (en su orden): obligatorios siempre, opcionales si se añadieron.
    for (const item of sheetItems) {
      const definition = resolve(item.attribute_id);
      if (!definition || !(item.required || chosen.has(item.attribute_id))) continue;
      rows.push({ definition, required: Boolean(item.required), fromTemplate: true });
      seen.add(item.attribute_id);
    }
    // Luego los adicionales, en el orden en que se añadieron.
    for (const attributeId of rowIds) {
      if (seen.has(attributeId) || axisSet.has(attributeId)) continue;
      const definition = attributesById.get(attributeId);
      if (!definition) continue;
      rows.push({ definition, required: false, fromTemplate: false });
      seen.add(attributeId);
    }
    return {
      sheet: rows,
      axes: axisItems.map((item) => resolve(item.attribute_id)).filter((item): item is IAttributeDefinition => item != null),
      suggestions: sheetItems
        .filter((item) => !seen.has(item.attribute_id))
        .map((item) => resolve(item.attribute_id))
        .filter((item): item is IAttributeDefinition => item != null),
      axisIds: axisSet,
    };
  }, [template, rowIds, attributesById]);

  const addRows = (ids: number[]) =>
    setRowIds((current) => [...current, ...ids.filter((id) => !current.includes(id))]);
  const removeRow = (attributeId: number) => setRowIds((current) => current.filter((id) => id !== attributeId));

  /**
   * Búsqueda para añadir adicionales (sin los que ya están ni los ejes). Es estable (lee
   * refs) para que el combobox no repita la búsqueda en cada render: al abrirlo, sin texto,
   * pide el catálogo actualizado al servidor; al escribir, filtra lo ya cargado.
   */
  const searchState = useRef({ catalog, sheetIds: new Set<number>(), axisIds, typeLabel: (type: string) => type });
  searchState.current = {
    catalog,
    sheetIds: new Set(sheet.map((item) => item.definition.id as number)),
    axisIds,
    typeLabel: (type: string) => tAttr(`types.${type as "TEXT"}`),
  };
  const searchAttributes = useCallback(
    async (query: string): Promise<ComboOption<IAttributeDefinition>[]> => {
      const needle = normalize(query.trim());
      let source = searchState.current.catalog;
      if (!needle) {
        const fresh = await refreshCatalog();
        if (fresh.length > 0) source = fresh;
      }
      const { sheetIds, axisIds: axes, typeLabel } = searchState.current;
      return source
        .filter((item) => item.id != null && !sheetIds.has(item.id) && !axes.has(item.id))
        .filter((item) => !needle || normalize(`${item.name ?? ""} ${item.code ?? ""}`).includes(needle))
        .slice(0, 30)
        .map((item) => ({
          value: String(item.id),
          label: item.name ?? item.code ?? `#${item.id}`,
          hint: [typeLabel(item.data_type ?? "TEXT"), item.unit_name].filter(Boolean).join(" · "),
          data: item,
        }));
    },
    [refreshCatalog],
  );

  /** Combinaciones repetidas entre variantes con todos los ejes elegidos. */
  const duplicatedSkus = useMemo(() => {
    const seen = new Map<string, number>();
    const duplicated = new Set<number>();
    if (axes.length === 0) return duplicated;
    for (const variant of data?.variants ?? []) {
      const selected = axes.map((axis) => variantOptions[variant.sku_id]?.[axis.id as number] ?? "");
      if (selected.some((value) => value === "")) continue;
      const key = selected.join("|");
      const other = seen.get(key);
      if (other != null) {
        duplicated.add(other);
        duplicated.add(variant.sku_id);
      } else {
        seen.set(key, variant.sku_id);
      }
    }
    return duplicated;
  }, [axes, data?.variants, variantOptions]);

  const setDraft = (attributeId: number, patch: Partial<AttributeDraft>) =>
    setDrafts((current) => ({ ...current, [attributeId]: { ...EMPTY_DRAFT, ...current[attributeId], ...patch } }));

  const setVariantOption = (skuId: number, attributeId: number, optionId: string) =>
    setVariantOptions((current) => ({
      ...current,
      [skuId]: { ...current[skuId], [attributeId]: optionId === NONE ? "" : optionId },
    }));

  // Al cambiar de plantilla, los valores ya escritos se conservan (como adicionales si no están en la nueva).
  const changeTemplate = (value: string) => {
    setTemplateId(value);
    setRowIds((current) => {
      const filled = Object.keys(drafts)
        .map(Number)
        .filter((id) => hasValue(drafts[id], attributesById.get(id)?.data_type));
      return [...current, ...filled.filter((id) => !current.includes(id))];
    });
  };

  const buildPayload = (): IProductAttributesSaveRequest => ({
    template_id: template?.id,
    values: sheet
      .map(({ definition }) => {
        const draft = drafts[definition.id as number] ?? EMPTY_DRAFT;
        const attribute_id = definition.id as number;
        switch (definition.data_type) {
          case "NUMBER":
            return draft.number.trim() === "" ? null : { attribute_id, value_number: Number(draft.number.replace(",", ".")) };
          case "BOOLEAN":
            return draft.bool === "" ? null : { attribute_id, value_boolean: draft.bool === "true" };
          case "OPTION":
            return draft.option === "" ? null : { attribute_id, option_id: Number(draft.option) };
          default:
            return draft.text.trim() === "" ? null : { attribute_id, value_text: draft.text.trim() };
        }
      })
      .filter((value): value is NonNullable<typeof value> => value != null),
    variants: (data?.variants ?? []).map((variant) => ({
      sku_id: variant.sku_id,
      options: axes
        .map((axis) => ({ attribute_id: axis.id as number, value: variantOptions[variant.sku_id]?.[axis.id as number] ?? "" }))
        .filter((option) => option.value !== "")
        .map((option) => ({ attribute_id: option.attribute_id, option_id: Number(option.value) })),
    })),
  });

  const save = async () => {
    if (duplicatedSkus.size > 0) {
      notify.error(tCommon("errorTitle"), t("duplicatedCombination"));
      return;
    }
    setSaving(true);
    const result = await saveProductAttributesServerAction(productId, buildPayload());
    setSaving(false);
    if (result.success && result.data) {
      hydrate(result.data);
      notify.success(tCommon("updatedSuccess"));
      router.refresh();
      if ((result.data.missing ?? []).length === 0) handleClose?.();
    } else if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  if (loadError) {
    return <p className='text-sm text-destructive'>{loadError}</p>;
  }
  if (!data) {
    return (
      <div className='grid gap-4' aria-busy='true'>
        <p className='sr-only'>{t("loading")}</p>
        {[0, 1, 2].map((key) => (
          <div key={key} className='h-32 animate-pulse rounded-2xl border border-border bg-muted/40' />
        ))}
      </div>
    );
  }

  const published = data.product_status === "ACTIVE";
  const missing = data.missing ?? [];
  const templateOptions = [
    { id: NONE, value: NONE, label: t("noTemplate") },
    ...templates
      .filter((item) => item.id != null)
      .map((item) => ({ id: String(item.id), value: String(item.id), label: item.name ?? `#${item.id}` })),
  ];
  const optionsOf = (definition: IAttributeDefinition, emptyLabel: string) => [
    { id: NONE, value: NONE, label: emptyLabel },
    ...(definition.options ?? []).map((option) => ({ id: String(option.id), value: String(option.id), label: option.value })),
  ];

  const filledCount = sheet.filter(({ definition }) => hasValue(drafts[definition.id as number], definition.data_type)).length;
  const requiredCount = sheet.filter((item) => item.required).length;
  const requiredFilled = sheet.filter((item) => item.required && hasValue(drafts[item.definition.id as number], item.definition.data_type)).length;
  const variantsTotal = (data.variants ?? []).length;
  const variantsComplete =
    axes.length === 0
      ? 0
      : (data.variants ?? []).filter((variant) => axes.every((axis) => (variantOptions[variant.sku_id]?.[axis.id as number] ?? "") !== "")).length;

  return (
    <div className='grid gap-6'>
      <KpiStrip
        items={[
          { label: t("kpiAttributes"), value: String(sheet.length), icon: HiOutlineListBullet },
          {
            label: t("kpiFilled"),
            value: `${filledCount}/${sheet.length}`,
            icon: HiOutlineCheckCircle,
            tone: sheet.length > 0 && filledCount === sheet.length ? "good" : undefined,
          },
          {
            label: t("kpiRequired"),
            value: requiredCount === 0 ? "—" : `${requiredFilled}/${requiredCount}`,
            icon: HiOutlineExclamationTriangle,
            tone: requiredCount === 0 ? undefined : requiredFilled === requiredCount ? "good" : "warn",
          },
          {
            label: t("kpiVariants"),
            value: axes.length === 0 ? "—" : `${variantsComplete}/${variantsTotal}`,
            icon: HiOutlineSwatch,
            tone: axes.length === 0 ? undefined : variantsComplete === variantsTotal ? "good" : "warn",
          },
        ]}
      />

      <SectionCard
        id='specs-template'
        icon={HiOutlineDocumentDuplicate}
        title={t("template")}
        hint={template ? t("templateHint") : t("noTemplateHint")}
        actions={<Badge variant={published ? "default" : "outline"}>{published ? t("published") : t("notPublished")}</Badge>}>
        <FormSelectField
          aria-label={t("template")}
          data={templateOptions}
          value={templateId}
          onValueChange={changeTemplate}
          searchable
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
        <div className='col-span-12 md:col-span-6'>
      {missing.length > 0 ? (
        <div className='flex gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm' role='status'>
          <HiOutlineExclamationTriangle className='mt-0.5 h-4 w-4 shrink-0' aria-hidden='true' />
          <div>
            <p className='font-semibold'>{published ? t("missingPublished") : t("missingDraft")}</p>
            <p className='text-muted-foreground'>{missing.join(" · ")}</p>
          </div>
        </div>
      ) : template ? (
        <p className='flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300'>
          <HiOutlineCheckCircle className='h-4 w-4' aria-hidden='true' />
          {t("complete")}
        </p>
      ) : null}
        </div>
      </SectionCard>

      <SectionCard
        id='specs-sheet'
        icon={HiOutlineListBullet}
        title={t("sheet")}
        hint={t("sheetHint")}
        actions={<span className='text-xs text-muted-foreground'>{t("sheetCount", { count: sheet.length })}</span>}
        contentClassName='grid gap-4 px-5 py-5'>

        {suggestions.length > 0 ? (
          <div className='rounded-xl border border-dashed border-border bg-muted/20 p-3'>
            <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
              <p className='text-sm font-medium text-foreground'>{t("suggestions", { count: suggestions.length })}</p>
              <Buttons
                type='button'
                variant='ghost'
                size='sm'
                className='rounded-full'
                onClick={() => addRows(suggestions.map((item) => item.id as number))}>
                {t("addAll")}
              </Buttons>
            </div>
            <div className='flex flex-wrap gap-2'>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => addRows([item.id as number])}
                  className='inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                  <HiOutlinePlus className='h-3.5 w-3.5' aria-hidden='true' />
                  {item.name ?? item.code}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {sheet.length === 0 ? (
          <p className='rounded-xl border border-border p-4 text-sm text-muted-foreground'>
            {template ? t("emptySheet") : t("emptySheetFree")}
          </p>
        ) : (
          <ul className='grid gap-3'>
            {sheet.map(({ definition, required, fromTemplate }) => {
              const id = definition.id as number;
              const draft = drafts[id] ?? EMPTY_DRAFT;
              const name = definition.name ?? definition.code ?? `#${id}`;
              const inputId = `attr-${id}`;
              const typeLabel = tAttr(`types.${(definition.data_type ?? "TEXT") as "TEXT"}`);
              const missingRequired = required && !hasValue(draft, definition.data_type);

              let field: ReactNode;
              if (definition.data_type === "OPTION" || definition.data_type === "BOOLEAN") {
                const choices =
                  definition.data_type === "OPTION"
                    ? optionsOf(definition, t("noValue"))
                    : [
                        { id: NONE, value: NONE, label: t("noValue") },
                        { id: "true", value: "true", label: tCommon("yes") },
                        { id: "false", value: "false", label: tCommon("no") },
                      ];
                const current = definition.data_type === "OPTION" ? draft.option : draft.bool;
                field = (
                  <FormSelectField
                    aria-label={name}
                    data={choices}
                    value={current === "" ? NONE : current}
                    onValueChange={(value) =>
                      definition.data_type === "OPTION"
                        ? setDraft(id, { option: value === NONE ? "" : value })
                        : setDraft(id, { bool: value === NONE ? "" : (value as "true" | "false") })
                    }
                    triggerClassName='!w-full'
                  />
                );
              } else {
                field = (
                  <div className='flex items-center gap-2'>
                    <Input
                      id={inputId}
                      type={definition.data_type === "NUMBER" ? "number" : "text"}
                      inputMode={definition.data_type === "NUMBER" ? "decimal" : undefined}
                      step={definition.data_type === "NUMBER" ? "any" : undefined}
                      maxLength={definition.data_type === "TEXT" ? 500 : undefined}
                      placeholder={definition.description ?? undefined}
                      aria-invalid={missingRequired || undefined}
                      value={definition.data_type === "NUMBER" ? draft.number : draft.text}
                      onChange={(event) =>
                        definition.data_type === "NUMBER"
                          ? setDraft(id, { number: event.target.value })
                          : setDraft(id, { text: event.target.value })
                      }
                    />
                    {definition.unit_name ? (
                      <span className='min-w-8 text-sm font-medium text-muted-foreground'>{definition.unit_name}</span>
                    ) : null}
                  </div>
                );
              }

              return (
                <li
                  key={id}
                  className='grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-center'>
                  <div className='min-w-0'>
                    <Label htmlFor={inputId} className='font-medium text-foreground'>
                      {name}
                      {required ? <span className='text-destructive'> *</span> : null}
                    </Label>
                    <div className='mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground'>
                      <span>{typeLabel}</span>
                      {required ? (
                        <Badge variant='outline'>{t("required")}</Badge>
                      ) : fromTemplate ? (
                        <Badge variant='outline'>{t("fromTemplate")}</Badge>
                      ) : (
                        <Badge variant='secondary'>{t("extra")}</Badge>
                      )}
                    </div>
                  </div>
                  <div className='min-w-0'>{field}</div>
                  <Buttons
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='justify-self-end rounded-full'
                    disabled={required}
                    title={required ? t("requiredLocked") : t("removeAttribute", { name })}
                    aria-label={t("removeAttribute", { name })}
                    onClick={() => removeRow(id)}>
                    <HiOutlineXMark className='h-4 w-4' aria-hidden='true' />
                  </Buttons>
                </li>
              );
            })}
          </ul>
        )}

        <div className='grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'>
          <div>
            <Label htmlFor='add-attribute'>{t("addAttribute")}</Label>
            <p className='mb-2 text-xs text-muted-foreground'>{template ? t("addAttributeHint") : t("addAttributeHintFree")}</p>
            <AsyncCombobox<IAttributeDefinition>
              id='add-attribute'
              value={null}
              search={searchAttributes}
              debounceMs={0}
              clearable={false}
              placeholder={t("addAttributePlaceholder")}
              searchPlaceholder={t("addAttributeSearch")}
              onChange={(value) => {
                if (value) addRows([Number(value)]);
              }}
            />
          </div>
          <Link
            href='/fichaTecnica/attributes/new'
            target='_blank'
            className='inline-flex items-center gap-1 self-end text-sm font-medium text-primary underline-offset-4 hover:underline'>
            {t("createAttribute")}
            <HiOutlineArrowTopRightOnSquare className='h-3.5 w-3.5' aria-hidden='true' />
          </Link>
        </div>
      </SectionCard>

      {axes.length > 0 ? (
        <SectionCard
          id='specs-variants'
          icon={HiOutlineSwatch}
          title={t("variants")}
          hint={t("variantsHint")}
          contentClassName='grid gap-3 px-5 py-5'>
          {(data.variants ?? []).length === 0 ? (
            <p className='text-sm text-muted-foreground'>{t("noVariants")}</p>
          ) : (
            <div className='overflow-x-auto rounded-xl border border-border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/40 text-left'>
                  <tr>
                    <th scope='col' className='px-3 py-2 font-medium'>{t("variant")}</th>
                    {axes.map((axis) => (
                      <th key={axis.id} scope='col' className='px-3 py-2 font-medium'>
                        {axis.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.variants ?? []).map((variant) => (
                    <tr
                      key={variant.sku_id}
                      className={duplicatedSkus.has(variant.sku_id) ? "bg-destructive/10" : "border-t border-border"}>
                      <td className='px-3 py-2'>
                        <span className='font-medium text-foreground'>{variant.name ?? `#${variant.sku_id}`}</span>
                        <p className='font-mono text-xs text-muted-foreground'>
                          {variant.sku_code}
                          {variant.active === false ? ` · ${t("inactiveVariant")}` : ""}
                        </p>
                      </td>
                      {axes.map((axis) => {
                        const value = variantOptions[variant.sku_id]?.[axis.id as number] ?? "";
                        return (
                          <td key={axis.id} className='px-3 py-2'>
                            <FormSelectField
                              aria-label={`${axis.name} · ${variant.name ?? variant.sku_code}`}
                              data={optionsOf(axis, t("noValue"))}
                              value={value === "" ? NONE : value}
                              onValueChange={(next) => setVariantOption(variant.sku_id, axis.id as number, next)}
                              triggerClassName='!w-full min-w-32'
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {duplicatedSkus.size > 0 ? <p className='text-sm text-destructive'>{t("duplicatedCombination")}</p> : null}
        </SectionCard>
      ) : null}

      <ActionBar
        message={
          duplicatedSkus.size > 0 ? (
            <span className='text-destructive'>{t("duplicatedCombination")}</span>
          ) : missing.length > 0 ? (
            t("saveHintMissing", { count: missing.length })
          ) : (
            t("saveHint")
          )
        }>
        {handleClose ? (
          <Buttons type='button' variant='outline' className='rounded-full' onClick={handleClose}>
            {tCommon("cancel")}
          </Buttons>
        ) : null}
        <Buttons type='button' loading={saving} className='rounded-full px-6' onClick={save}>
          {tCommon("save")}
        </Buttons>
      </ActionBar>
    </div>
  );
};
