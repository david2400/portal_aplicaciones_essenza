/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { HiOutlineArrowDown, HiOutlineArrowUp, HiOutlinePhoto, HiOutlinePlusCircle, HiOutlineTrash } from "react-icons/hi2";
import { notify } from "@/components/notifications";
import { MAX_GALLERY_IMAGES, type IProductImage, type IProductVariant } from "../../models/product-editor.interface";
import { IMAGE_URL } from "../../schemas/product-editor.schema";
import { replaceProductImagesServerAction } from "@/app/[locale]/catalogo/products/actions";

type Draft = { key: string; url: string; alt_text: string };

let sequence = 0;
const draftOf = (image?: IProductImage): Draft => ({
  key: `img-${++sequence}`,
  url: image?.url ?? "",
  alt_text: image?.alt_text ?? "",
});

const inputClass =
  "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800";

/**
 * Galería general del producto: la primera imagen es la principal (`image_url`).
 * Las imágenes de cada variante se editan en la variante y aquí solo se muestran.
 */
export const ImagesTab = ({
  productId,
  images,
  variants,
}: {
  productId: number;
  images: IProductImage[];
  variants: IProductVariant[];
}) => {
  const router = useRouter();
  const t = useTranslations("Administre.productEditor");
  const tCommon = useTranslations("Administre.common");

  const gallery = images.filter((image) => image.sku_id == null);
  const variantImages = images.filter((image) => image.sku_id != null);
  const [drafts, setDrafts] = useState<Draft[]>(() => gallery.map(draftOf));
  const [saving, setSaving] = useState(false);

  const invalid = drafts.some((draft) => !IMAGE_URL.test(draft.url.trim()));
  const update = (key: string, patch: Partial<Draft>) =>
    setDrafts((current) => current.map((draft) => (draft.key === key ? { ...draft, ...patch } : draft)));
  const move = (index: number, step: number) =>
    setDrafts((current) => {
      const next = [...current];
      const target = index + step;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  const save = async () => {
    if (invalid) {
      notify.error(tCommon("errorTitle"), t("imageInvalid"));
      return;
    }
    setSaving(true);
    const result = await replaceProductImagesServerAction(productId, {
      images: drafts.map((draft) => ({ url: draft.url.trim(), alt_text: draft.alt_text.trim() || undefined })),
    });
    setSaving(false);
    if (result.success) {
      notify.success(tCommon("updatedSuccess"));
      setDrafts((result.data ?? []).filter((image) => image.sku_id == null).map(draftOf));
      router.refresh();
    } else notify.error(tCommon("errorTitle"), result.error);
  };

  const variantName = (skuImage: IProductImage) => skuImage.alt_text ?? `#${skuImage.sku_id}`;

  return (
    <div className='space-y-6'>
      <section className='space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h3 className='text-base font-semibold text-foreground'>{t("gallery")}</h3>
            <p className='text-sm text-muted-foreground'>{t("galleryHint", { max: MAX_GALLERY_IMAGES })}</p>
          </div>
          <Buttons
            type='button'
            variant='outline'
            className='rounded-full'
            disabled={drafts.length >= MAX_GALLERY_IMAGES}
            onClick={() => setDrafts((current) => [...current, draftOf()])}>
            <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
            {t("addImage")}
          </Buttons>
        </div>

        {drafts.length === 0 ? (
          <div className='flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
            <HiOutlinePhoto className='h-8 w-8' aria-hidden='true' />
            {t("noImages")}
          </div>
        ) : (
          <ol className='space-y-3'>
            {drafts.map((draft, index) => {
              const valid = IMAGE_URL.test(draft.url.trim());
              return (
                <li key={draft.key} className='flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center'>
                  <div className='flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30'>
                    {valid ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={draft.url.trim()} alt={draft.alt_text} className='h-full w-full object-cover' />
                    ) : (
                      <HiOutlinePhoto className='h-6 w-6 text-muted-foreground' aria-hidden='true' />
                    )}
                  </div>
                  <div className='grid min-w-0 flex-1 gap-2'>
                    <div className='flex items-center gap-2'>
                      {index === 0 ? <Badge>{t("mainImage")}</Badge> : <Badge variant='outline'>#{index + 1}</Badge>}
                    </div>
                    <input
                      aria-label={t("imageUrl")}
                      aria-invalid={!valid || undefined}
                      placeholder='https://'
                      value={draft.url}
                      onChange={(event) => update(draft.key, { url: event.target.value })}
                      className={`${inputClass} ${!valid && draft.url ? "border-red-500" : ""}`}
                    />
                    <input
                      aria-label={t("altText")}
                      placeholder={t("altText")}
                      value={draft.alt_text}
                      maxLength={255}
                      onChange={(event) => update(draft.key, { alt_text: event.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className='flex shrink-0 gap-1 sm:flex-col'>
                    <Buttons type='button' variant='ghost' size='icon' aria-label={t("moveUp")} disabled={index === 0} onClick={() => move(index, -1)}>
                      <HiOutlineArrowUp className='h-4 w-4' aria-hidden='true' />
                    </Buttons>
                    <Buttons
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label={t("moveDown")}
                      disabled={index === drafts.length - 1}
                      onClick={() => move(index, 1)}>
                      <HiOutlineArrowDown className='h-4 w-4' aria-hidden='true' />
                    </Buttons>
                    <Buttons
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label={tCommon("delete")}
                      onClick={() => setDrafts((current) => current.filter((item) => item.key !== draft.key))}>
                      <HiOutlineTrash className='h-4 w-4 text-destructive' aria-hidden='true' />
                    </Buttons>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className='flex justify-end'>
          <Buttons type='button' loading={saving} disabled={invalid} className='rounded-full' onClick={save}>
            {tCommon("save")}
          </Buttons>
        </div>
      </section>

      {variants.length > 0 ? (
        <section className='space-y-3'>
          <div>
            <h3 className='text-base font-semibold text-foreground'>{t("variantImages")}</h3>
            <p className='text-sm text-muted-foreground'>{t("variantImagesHint")}</p>
          </div>
          {variantImages.length === 0 ? (
            <p className='text-sm text-muted-foreground'>{t("noVariantImages")}</p>
          ) : (
            <ul className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6'>
              {variantImages.map((image) => (
                <li key={image.id} className='space-y-1'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={image.alt_text ?? ""} loading='lazy' className='aspect-square w-full rounded-lg border border-border object-cover' />
                  <p className='truncate text-xs text-muted-foreground'>{variantName(image)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
};
