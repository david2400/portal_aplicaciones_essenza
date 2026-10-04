/** @format */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Buttons } from "@repo/ui/buttons/scenes";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { HiOutlineBeaker } from "react-icons/hi2";
import { formatMoney } from "../utils";
import { simulateCouponServerAction } from "@/app/[locale]/marketing/coupons/actions";

type Result = { ok: true; discount: number; amount: number } | { ok: false; error: string } | null;

/**
 * Prueba un código contra un monto de orden usando las mismas reglas que el
 * checkout (validación + cálculo del backend). No consume usos del cupón.
 */
export const CouponSimulator = () => {
  const t = useTranslations("Administre.coupon.simulator");
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const run = async (event: React.FormEvent) => {
    event.preventDefault();
    const orderAmount = Number(amount);
    if (!code.trim() || !(orderAmount > 0)) {
      setResult({ ok: false, error: t("missing") });
      return;
    }
    setLoading(true);
    const response = await simulateCouponServerAction({ code: code.trim().toUpperCase(), orderAmount });
    setLoading(false);
    setResult(
      response.success
        ? { ok: true, discount: response.data?.discount ?? 0, amount: orderAmount }
        : { ok: false, error: response.error },
    );
  };

  return (
    <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
      <div className='mb-4 flex items-center gap-2'>
        <HiOutlineBeaker className='h-5 w-5 text-primary' aria-hidden='true' />
        <h3 className='text-base font-semibold text-foreground'>{t("title")}</h3>
      </div>
      <form onSubmit={run} className='grid grid-cols-12 items-end gap-3'>
        <FormField
          id='simulator-code'
          label={t("code")}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className='col-span-12 sm:col-span-5'
          classNameInput='uppercase'
        />
        <FormField
          id='simulator-amount'
          type='number'
          min={0}
          step='0.01'
          label={t("amount")}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className='col-span-12 sm:col-span-4'
        />
        <Buttons type='submit' loading={loading} className='col-span-12 sm:col-span-3'>
          {t("run")}
        </Buttons>
      </form>
      {result ? (
        <div
          role='status'
          className={
            result.ok
              ? "mt-4 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-foreground"
              : "mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground"
          }>
          {result.ok
            ? t("success", {
                discount: formatMoney(result.discount),
                total: formatMoney(Math.max(result.amount - result.discount, 0)),
              })
            : result.error}
        </div>
      ) : null}
    </section>
  );
};
