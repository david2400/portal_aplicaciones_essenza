/** @format */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Input } from "@repo/ui/inputs/scenes/input";
import { Label } from "@repo/ui/label/scenes/label";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";
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
  saveProductAttributesServerAction,
} from "@/app/[locale]/catalogo/products/actions";

interface IProductAttributesEditorProps {
  productId: number;
  templates: IProductTemplateDefinition[];
  attributes: IAttributeDefinition[];
  handleClose: () => void;
}

type SheetItem = { definition: IAttributeDefinition; required: boolean };

const draftFrom = (value: IProductAttributes["values"] extends (infer V)[] | undefined ? V : never): AttributeDraft => ({
  text: value.value_text ?? "",
  number: value.value_number != null ? String(value.value_number) : "",
  bool: value.value_boolean == null ? "" : value.value_boolean ? "true" : "false",
  option: value.option_id != null ? String(value.option_id) : "",
});

/**
 * Ficha técnica del producto: plantilla, valores por atributo y opciones de los
 * ejes (color, talla…) en cada variante. Si el producto está publicado, el
 * backend exige obligatorios y ejes completos.
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
  const [variantOptions, setVariantOptions] = useState<Record<number, Record<number, string>>>({});

  const hydrate = (result: IProductAttributes) => {
    setData(result);
    setTemplateId(result.template_id != null ? String(result.template_id) : NONE);
    setDrafts(Object.fromEntries((result.values ?? []).map((value) => [value.attribute_id, draftFrom(value)])));
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

  const attributesById = useMemo(
    () => new Map(attributes.filter((item) => item.id != null).map((item) => [item.id as number, item])),
    [attributes],
  );
  const template = templates.find((item) => String(item.id) === templateId) ?? null;

  /** Atributos de la ficha (sin ejes) y ejes de variante según la plantilla elegida. */
  const { sheet, axes } = useMemo(() => {
    if (!template) {
      return {
        sheet: attributes.map((definition) => ({ definition, required: false }) as SheetItem),
        axes: [] as IAttributeDefinition[],
      };
    }
    const items = template.attributes ?? [];
    const resolve = (attributeId: number) => items.find((item) => item.attribute_id === attributeId)?.attribute ?? attributesById.get(attributeId);
    return {
      sheet: items
        .filter((item) => !item.variant_axis)
        .map((item) => ({ definition: resolve(item.attribute_id), required: Boolean(item.required) }))
        .filter((item): item is SheetItem => item.definition != null),
      axes: items
        .filter((item) => item.variant_axis)
        .map((item) => resolve(item.attribute_id))
        .filter((item): item is IAttributeDefinition => item != null),
    };
  }, [template, attributes, attributesById]);

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
      if ((result.data.missing ?? []).length === 0) handleClose();
    } else if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  if (loadError) {
    return <p className='text-sm text-destructive'>{loadError}</p>;
  }
  if (!data) {
    return <p className='text-sm text-muted-foreground'>{t("loading")}</p>;
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

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <FormSelectField
          label={t("template")}
          description={template ? t("templateHint") : t("noTemplateHint")}
          data={templateOptions}
          value={templateId}
          onValueChange={(value) => setTemplateId(value)}
          triggerClassName='!w-full'
          className='min-w-64 flex-1'
        />
        <Badge variant={published ? "default" : "outline"} className='mt-6'>
          {published ? t("published") : t("notPublished")}
        </Badge>
      </div>

      {missing.length > 0 ? (
        <div className='flex gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm' role='status'>
          <HiOutlineExclamationTriangle className='mt-0.5 h-4 w-4 shrink-0' aria-hidden='true' />
          <div>
            <p className='font-semibold'>{published ? t("missingPublished") : t("missingDraft")}</p>
            <p className='text-muted-foreground'>{missing.join(" · ")}</p>
          </div>
        </div>
      ) : template ? (
        <p className='flex items-center gap-2 text-sm text-muted-foreground'>
          <HiOutlineCheckCircle className='h-4 w-4' aria-hidden='true' />
          {t("complete")}
        </p>
      ) : null}

      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-foreground'>{t("sheet")}</h3>
        {sheet.length === 0 ? <p className='text-sm text-muted-foreground'>{t("emptySheet")}</p> : null}
        <div className='grid grid-cols-12 gap-4'>
          {sheet.map(({ definition, required }) => {
            const id = definition.id as number;
            const draft = drafts[id] ?? EMPTY_DRAFT;
            const label = `${definition.name ?? definition.code}${required ? " *" : ""}`;
            const inputId = `attr-${id}`;
            if (definition.data_type === "OPTION" || definition.data_type === "BOOLEAN") {
              const data =
                definition.data_type === "OPTION"
                  ? optionsOf(definition, t("noValue"))
                  : [
                      { id: NONE, value: NONE, label: t("noValue") },
                      { id: "true", value: "true", label: tCommon("yes") },
                      { id: "false", value: "false", label: tCommon("no") },
                    ];
              const current = definition.data_type === "OPTION" ? draft.option : draft.bool;
              return (
                <FormSelectField
                  key={id}
                  label={label}
                  data={data}
                  value={current === "" ? NONE : current}
                  onValueChange={(value) =>
                    definition.data_type === "OPTION"
                      ? setDraft(id, { option: value === NONE ? "" : value })
                      : setDraft(id, { bool: value === NONE ? "" : (value as "true" | "false") })
                  }
                  triggerClassName='!w-full'
                  className='col-span-12 md:col-span-6'
                />
              );
            }
            return (
              <div key={id} className='col-span-12 space-y-2 md:col-span-6'>
                <Label htmlFor={inputId}>{label}</Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id={inputId}
                    type={definition.data_type === "NUMBER" ? "number" : "text"}
                    step={definition.data_type === "NUMBER" ? "any" : undefined}
                    maxLength={definition.data_type === "TEXT" ? 500 : undefined}
                    value={definition.data_type === "NUMBER" ? draft.number : draft.text}
                    onChange={(event) =>
                      definition.data_type === "NUMBER"
                        ? setDraft(id, { number: event.target.value })
                        : setDraft(id, { text: event.target.value })
                    }
                  />
                  {definition.unit_name ? <span className='text-sm text-muted-foreground'>{definition.unit_name}</span> : null}
                </div>
                <p className='text-xs text-muted-foreground'>{tAttr(`types.${(definition.data_type ?? "TEXT") as "TEXT"}`)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {axes.length > 0 ? (
        <section className='space-y-3'>
          <h3 className='text-sm font-semibold text-foreground'>{t("variants")}</h3>
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
          <p className='text-xs text-muted-foreground'>{t("variantsHint")}</p>
        </section>
      ) : null}

      <div className='flex justify-end gap-2'>
        <Buttons type='button' variant='outline' className='rounded-full' onClick={handleClose}>
          {tCommon("cancel")}
        </Buttons>
        <Buttons type='button' loading={saving} className='rounded-full' onClick={save}>
          {tCommon("save")}
        </Buttons>
      </div>
    </div>
  );
};
