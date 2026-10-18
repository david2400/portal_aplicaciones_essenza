/** @format */

"use client";

import { useMemo } from "react";
import qrcode from "qrcode-generator";

/** Código QR (SVG) con el contenido que exige la DIAN en la representación gráfica. */
export const InvoiceQr = ({ data, label, size = 132 }: { data: string; label: string; size?: number }) => {
  const svg = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(data, "Byte");
    qr.make();
    return qr.createSvgTag({ cellSize: 2, margin: 0, scalable: true });
  }, [data]);
  return (
    <div
      role='img'
      aria-label={label}
      className='bg-white p-1.5 [&>svg]:h-full [&>svg]:w-full'
      style={{ width: size, height: size }}
      // SVG generado localmente a partir del texto del documento (sin HTML externo).
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
