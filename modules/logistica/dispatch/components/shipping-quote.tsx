/** @format */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import { FormShippingQuote } from "../scenes/formShippingQuote";
import { validationShippingQuote, type ShippingQuoteFormValues } from "../schemas/dispatch.schema";
import type { IDispatchCarrier, IShippingQuote } from "../models/dispatch.interface";
import { formatDate, formatMoney } from "../constants";
import { quoteShippingServerAction } from "@/app/[locale]/logistica/dispatches/actions";

/**
 * Cotizador en línea: consulta a la transportadora (a través del backend)
 * el costo y las fechas de entrega por tipo de servicio. No guarda nada.
 */
export const ShippingQuote = ({ carriers }: { carriers: IDispatchCarrier[] }) => {
  const t = useTranslations("Administre.dispatch.quote");
  const tCommon = useTranslations("Administre.common");
  const validationSchema = validationShippingQuote();
  const [quote, setQuote] = useState<IShippingQuote | null>(null);

  const handleSubmit = async (values: ShippingQuoteFormValues) => {
    const response = await quoteShippingServerAction({
      carrier_code: values.carrier_code,
      origin_zip: values.origin_zip,
      destination_zip: values.destination_zip,
      weight: values.weight,
      service_type: values.serviceType || undefined,
    });
    if (response.success) {
      setQuote(response.data ?? null);
    } else {
      notify.error(tCommon("errorTitle"), response.error || tCommon("unexpectedError"));
    }
  };

  const services = Object.entries(quote?.available_services ?? {});

  return (
    <div className='space-y-4 rounded-xl border border-border/70 bg-background/60 p-5'>
      <div>
        <h3 className='text-base font-semibold text-foreground'>{t("title")}</h3>
        <p className='mt-1 text-sm text-muted-foreground'>{t("description")}</p>
      </div>

      {carriers.some((carrier) => !!carrier.code) ? (
        <FormShippingQuote
          initialValues={{ carrier_code: "", origin_zip: "", destination_zip: "", weight: "", serviceType: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          carriers={carriers}
        />
      ) : (
        <p role='status' className='text-sm text-muted-foreground'>
          {t("noCarriers")}
        </p>
      )}

      <div aria-live='polite'>
        {quote ? (
          quote.shipping_cost == null && services.length === 0 ? (
            <p className='rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm'>{t("unavailable")}</p>
          ) : (
            <dl className='space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm'>
              <div className='flex items-center justify-between'>
                <dt className='text-muted-foreground'>{t("cost")}</dt>
                <dd className='text-lg font-semibold text-foreground'>{formatMoney(quote.shipping_cost)}</dd>
              </div>
              <div className='flex items-center justify-between'>
                <dt className='text-muted-foreground'>{t("estimatedDate")}</dt>
                <dd className='font-medium text-foreground'>{formatDate(quote.estimated_delivery_date)}</dd>
              </div>
              {services.length > 0 ? (
                <div>
                  <dt className='text-muted-foreground'>{t("services")}</dt>
                  <dd>
                    <ul className='mt-1 space-y-1'>
                      {services.map(([service, date]) => (
                        <li key={service} className='flex justify-between'>
                          <span>{service}</span>
                          <span className='font-medium'>{formatDate(date)}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>
          )
        ) : null}
      </div>
    </div>
  );
};
