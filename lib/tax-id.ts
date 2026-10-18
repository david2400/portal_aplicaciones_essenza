/** @format */

/**
 * Documento tributario (Colombia). Dígito de verificación del NIT con el
 * módulo 11 de la DIAN; el backend lo recalcula al guardar.
 */
const NIT_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const nitCheckDigit = (nit: string) => {
  const digits = onlyDigits(nit);
  if (!digits || digits.length > NIT_WEIGHTS.length) return "";
  let sum = 0;
  for (let i = 0; i < digits.length; i++) sum += Number(digits[digits.length - 1 - i]) * (NIT_WEIGHTS[i] ?? 0);
  const remainder = sum % 11;
  return String(remainder > 1 ? 11 - remainder : remainder);
};

/** "NIT 900123456-8" / "CC 1020304050" para mostrar mientras se escribe. */
export const formatTaxId = (type: string | undefined, number: string | undefined) => {
  if (!type || !number) return "";
  const clean = type === "NIT" || type === "CC" ? onlyDigits(number) : number.trim().toUpperCase();
  if (!clean) return "";
  return type === "NIT" ? `${type} ${clean}-${nitCheckDigit(clean)}` : `${type} ${clean}`;
};
