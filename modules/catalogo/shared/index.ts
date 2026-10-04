/**
 * Piezas compartidas del dominio Catálogo (marcas, categorías, subcategorías).
 */

export * from "./models";
export { TaxonomyManager } from "./components/taxonomy-manager";
export { FormTaxonomy } from "./scenes/formTaxonomy";
export { validationTaxonomy, TAXONOMY_LIMITS } from "./schemas/taxonomy.schema";
export { slugify, formatApiDate, parseApiDate, createdWithin } from "./utils";
export { buildTaxonomyStats } from "./stats";
