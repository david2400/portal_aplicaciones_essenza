/** @format */

/**
 * Clave i18n de la etiqueta de un campo. Los campos de formulario usan el
 * nombre del API (snake_case, p. ej. `guide_number`) y las claves de
 * traducción siguen en camelCase (`fields.guideNumber`).
 */
export const fieldKey = (name: string) =>
  `fields.${name.replace(/_([a-z0-9])/g, (_match: string, letter: string) => letter.toUpperCase())}`;
