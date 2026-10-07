/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { HiOutlinePencilSquare, HiOutlinePlusCircle, HiOutlineTrash } from "react-icons/hi2";
import { ProductLookupField } from "@/components/async-combobox";
import { confirm, notify } from "@/components/notifications";
import { formatNumber } from "@/lib/format";
import { Link } from "@/shared/i18n/routing";
import type { IComboItem } from "../../models/product-editor.interface";
import { validationComboItem, type ComboItemFormValues } from "../../schemas/product-editor.schema";
import {
  createComboItemServerAction,
  deleteComboItemServerAction,
  updateComboItemServerAction,
} from "@/app/[locale]/catalogo/products/actions";

const ComboItemForm = ({ comboId, item, onDone }: { comboId: number; item: IComboItem | null; onDone: () => void }) => {
  const tForm = useTranslations("Administre.combo");
  const tCommon = useTranslations("Administre.common");
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ComboItemFormValues>({
    resolver: zodResolver(validationComboItem()),
    defaultValues: {
      product_id: (item?.product_id != null ? String(item.product_id) : "") as unknown as number,
      quantity: item?.quantity ?? 1,
    },
  });

  const submit = async (values: ComboItemFormValues) => {
    const payload = { combo_id: comboId, product_id: values.product_id, quantity: values.quantity };
    const result =
      item?.id != null ? await updateComboItemServerAction({ ...payload, id: item.id }) : await createComboItemServerAction(payload);
    if (result.success) {
      notify.success(item?.id != null ? tCommon("updatedSuccess") : tCommon("createdSuccess"));
      onDone();
    } else notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
  };

  return (
    <form onSubmit={handleSubmit(submit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <ProductLookupField
          control={control}
          name='product_id'
          label={tForm("fields.productId")}
          placeholder={tCommon("selectPlaceholder")}
          initialOption={
            item?.product_id != null
              ? { value: String(item.product_id), label: item.product_name ?? `#${item.product_id}` }
              : null
          }
          clearable={false}
          className='col-span-12 sm:col-span-8'
        />
        <FormField
          controller={{ control, name: "quantity" }}
          type='number'
          step='1'
          min={1}
          label={tForm("fields.quantity")}
          className='col-span-12 sm:col-span-4'
        />
      </div>
      <div className='flex justify-end'>
        <Buttons type='submit' loading={isSubmitting}>
          {tCommon("save")}
        </Buttons>
      </div>
    </form>
  );
};

/** Productos que componen el combo y sus cantidades. */
export const ComboTab = ({ comboId, items }: { comboId: number; items: IComboItem[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.productEditor");
  const tCombo = useTranslations("Administre.combo");
  const tCommon = useTranslations("Administre.common");
  const [modal, setModal] = useState<{ open: boolean; item: IComboItem | null }>({ open: false, item: null });

  const remove = async (item: IComboItem) => {
    if (item.id == null) return;
    const name = item.product_name ?? `#${item.product_id}`;
    const ok = await confirm({
      title: tCommon("deleteConfirmTitle"),
      description: tCommon("deleteConfirmText", { name }),
      confirmLabel: tCommon("deleteConfirmButton"),
      tone: "danger",
    });
    if (!ok) return;
    const result = await deleteComboItemServerAction(item.id);
    if (result.success) {
      notify.success(tCommon("deletedSuccess"), name);
      router.refresh();
    } else notify.error(tCommon("errorTitle"), result.error);
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='max-w-2xl text-sm text-muted-foreground'>{t("comboHint")}</p>
        <Buttons onClick={() => setModal({ open: true, item: null })} className='rounded-full'>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("addComponent")}
        </Buttons>
      </div>

      {items.length === 0 ? (
        <div className='rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
          {t("noComponents")}
        </div>
      ) : (
        <ul className='divide-y divide-border rounded-xl border border-border'>
          {items.map((item) => (
            <li key={item.id} className='flex items-center justify-between gap-3 px-4 py-3'>
              <div className='min-w-0'>
                <Link
                  href={`/catalogo/products/${item.product_id}`}
                  className='truncate font-medium text-foreground underline-offset-4 hover:underline'>
                  {item.product_name ?? `#${item.product_id}`}
                </Link>
                <p className='text-xs text-muted-foreground'>
                  {tCombo("fields.quantity")}: {formatNumber(item.quantity)}
                </p>
              </div>
              <div className='flex shrink-0 gap-1'>
                <Buttons type='button' variant='ghost' size='icon' aria-label={tCommon("edit")} onClick={() => setModal({ open: true, item })}>
                  <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
                </Buttons>
                <Buttons type='button' variant='ghost' size='icon' aria-label={tCommon("delete")} onClick={() => remove(item)}>
                  <HiOutlineTrash className='h-4 w-4 text-destructive' aria-hidden='true' />
                </Buttons>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        size='lg'
        title={modal.item ? tCombo("editTitle") : tCombo("createTitle")}
        open={modal.open}
        onOpenChange={(open) => !open && setModal({ open: false, item: null })}
        hideDefaultFooter={true}>
        {modal.open ? (
          <ComboItemForm
            comboId={comboId}
            item={modal.item}
            onDone={() => {
              setModal({ open: false, item: null });
              router.refresh();
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
};
