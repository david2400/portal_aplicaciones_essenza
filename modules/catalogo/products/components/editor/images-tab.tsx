/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlinePhoto,
  HiOutlinePlusCircle,
  HiOutlineStar,
  HiOutlineSwatch,
  HiOutlineTrash,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { ActionBar, EmptyBlock, SectionCard } from "../form-parts";
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
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring";

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
  const makeMain = (index: number) =>
    setDrafts((current) => [current[index]!, ...current.filter((_, position) => position !== index)]);
  const signature = (items: { url?: string | null; alt_text?: string | null }[]) =>
    JSON.stringify(items.map((item) => [(item.url ?? "").trim(), (item.alt_text ?? "").trim()]));
  const dirty = signature(drafts) !== signature(gallery);
  const discard = () => setDrafts(gallery.map(draftOf));
  const full = drafts.length >= MAX_GALLERY_IMAGES;

  const addButton = (
    <Buttons
      type='button'
      variant='outline'
      className='rounded-full'
      disabled={full}
      onClick={() => setDrafts((current) => [...current, draftOf()])}>
      <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
      {t("addImage")}
    </Buttons>
  );

  return (
    <div className='grid gap-6'>
      <SectionCard
        id='product-gallery'
        icon={HiOutlinePhoto}
        title={t("gallery")}
        hint={t("galleryHint", { max: MAX_GALLERY_IMAGES })}
        actions={
          <>
            <span className='text-xs tabular-nums text-muted-foreground'>
              {t("galleryCount", { count: drafts.length, max: MAX_GALLERY_IMAGES })}
            </span>
            {drafts.length > 0 ? addButton : null}
          </>
        }>
        {drafts.length === 0 ? (
          <EmptyBlock icon={HiOutlinePhoto} title={t("noImages")} description={t("noImagesHint")} action={addButton} />
        ) : (
          <ol className='col-span-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {drafts.map((draft, index) => {
              const valid = IMAGE_URL.test(draft.url.trim());
              const showError = !valid && draft.url.trim() !== "";
              return (
                <li
                  key={draft.key}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md",
                    index === 0 ? "border-primary ring-1 ring-primary" : "border-border",
                  )}>
                  <div className='relative flex aspect-[4/3] items-center justify-center bg-muted/40'>
                    {valid ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={draft.url.trim()} alt={draft.alt_text} className='h-full w-full object-cover' />
                    ) : (
                      <HiOutlinePhoto className='h-10 w-10 text-muted-foreground' aria-hidden='true' />
                    )}
                    <span className='absolute left-2 top-2'>
                      {index === 0 ? <Badge>{t("mainImage")}</Badge> : <Badge variant='secondary'>#{index + 1}</Badge>}
                    </span>
                    <div className='absolute right-2 top-2 flex gap-1 rounded-full bg-background/90 p-0.5 shadow-sm backdrop-blur'>
                      <Buttons type='button' variant='ghost' size='icon' className='h-7 w-7 rounded-full' aria-label={t("moveUp")} disabled={index === 0} onClick={() => move(index, -1)}>
                        <HiOutlineArrowUp className='h-3.5 w-3.5' aria-hidden='true' />
                      </Buttons>
                      <Buttons
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 rounded-full'
                        aria-label={t("moveDown")}
                        disabled={index === drafts.length - 1}
                        onClick={() => move(index, 1)}>
                        <HiOutlineArrowDown className='h-3.5 w-3.5' aria-hidden='true' />
                      </Buttons>
                      <Buttons
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 rounded-full'
                        aria-label={tCommon("delete")}
                        onClick={() => setDrafts((current) => current.filter((item) => item.key !== draft.key))}>
                        <HiOutlineTrash className='h-3.5 w-3.5 text-destructive' aria-hidden='true' />
                      </Buttons>
                    </div>
                  </div>
                  <div className='grid gap-2 p-3'>
                    <input
                      aria-label={t("imageUrl")}
                      aria-invalid={showError || undefined}
                      placeholder={t("imageUrlPlaceholder")}
                      value={draft.url}
                      onChange={(event) => update(draft.key, { url: event.target.value })}
                      className={cn(inputClass, showError && "border-destructive focus:ring-destructive")}
                    />
                    {showError ? <p className='text-xs text-destructive'>{t("imageInvalid")}</p> : null}
                    <input
                      aria-label={t("altText")}
                      placeholder={t("altText")}
                      value={draft.alt_text}
                      maxLength={255}
                      onChange={(event) => update(draft.key, { alt_text: event.target.value })}
                      className={inputClass}
                    />
                    {index > 0 ? (
                      <button
                        type='button'
                        onClick={() => makeMain(index)}
                        className='inline-flex w-fit items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline'>
                        <HiOutlineStar className='h-3.5 w-3.5' aria-hidden='true' />
                        {t("makeMain")}
                      </button>
                    ) : (
                      <p className='text-xs text-muted-foreground'>{t("mainImageHint")}</p>
                    )}
                  </div>
                </li>
              );
            })}
            {!full ? (
              <li>
                <button
                  type='button'
                  onClick={() => setDrafts((current) => [...current, draftOf()])}
                  className='flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                  <HiOutlinePlusCircle className='h-7 w-7' aria-hidden='true' />
                  {t("addImage")}
                </button>
              </li>
            ) : null}
          </ol>
        )}
      </SectionCard>

      {variants.length > 0 ? (
        <SectionCard id='variant-images' icon={HiOutlineSwatch} title={t("variantImages")} hint={t("variantImagesHint")}>
          {variantImages.length === 0 ? (
            <EmptyBlock icon={HiOutlineSwatch} title={t("noVariantImages")} />
          ) : (
            <ul className='col-span-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6'>
              {variantImages.map((image) => (
                <li key={image.id} className='overflow-hidden rounded-xl border border-border'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={image.alt_text ?? ""} loading='lazy' className='aspect-square w-full object-cover' />
                  <p className='truncate px-2 py-1.5 text-xs text-muted-foreground'>{variantName(image)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      ) : null}

      <ActionBar message={invalid ? <span className='text-destructive'>{t("imageInvalid")}</span> : dirty ? t("unsavedImages") : t("savedImages")}>
        {dirty ? (
          <Buttons type='button' variant='outline' className='rounded-full' onClick={discard}>
            {t("discard")}
          </Buttons>
        ) : null}
        <Buttons type='button' loading={saving} disabled={invalid || !dirty} className='rounded-full px-6' onClick={save}>
          {tCommon("save")}
        </Buttons>
      </ActionBar>
    </div>
  );
};
