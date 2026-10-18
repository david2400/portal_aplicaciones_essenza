/** @format */

import { redirect } from "next/navigation";

/** Ruta anterior: los medios de pago viven ahora en `/ventas/payment-methods`. */
const PaymentTypesPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  redirect(`/${locale}/ventas/payment-methods`);
};

export default PaymentTypesPage;
