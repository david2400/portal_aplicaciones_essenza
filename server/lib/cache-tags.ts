/** Centralized cache tag definitions for on-demand revalidation. */

export const shipping_logistics_tags = {
  trackings: () => 'shipping-logistics:trackings' as const,
  tracking: (id: number | string) => `shipping-logistics:tracking:${id}` as const,
  dispatch_details: () => 'shipping-logistics:dispatch-details' as const,
  dispatch_detail: (id: number | string) => `shipping-logistics:dispatch-detail:${id}` as const,
  shipping_estimates: () => 'shipping-logistics:shipping-estimates' as const,
} as const;

export const product_reviews_tags = {
  list: () => 'product-reviews:list' as const,
  review: (id: number | string) => `product-reviews:review:${id}` as const,
  votes: (id: number | string) => `product-reviews:review:${id}:votes` as const,
  moderation: (id: number | string) => `product-reviews:review:${id}:moderation` as const,
  pages: () => 'product-reviews:pages' as const,
} as const;

export const coupons_tags = {
  list: () => 'coupons:list' as const,
  coupon: (id: number | string) => `coupons:coupon:${id}` as const,
  validation: (code: string) => `coupons:validation:${code}` as const,
  calculation: (code: string) => `coupons:calculation:${code}` as const,
} as const;

export const shipping_costs_tags = {
  list: () => 'shipping-costs:list' as const,
  item: (id: number | string) => `shipping-costs:item:${id}` as const,
  calculation: (hash: string) => `shipping-costs:calculation:${hash}` as const,
} as const;

export const delivery_estimates_tags = {
  list: () => 'delivery-estimates:list' as const,
  item: (id: number | string) => `delivery-estimates:item:${id}` as const,
  calculation: (hash: string) => `delivery-estimates:calculation:${hash}` as const,
} as const;

export const carriers_tags = {
  list: () => 'carriers:list' as const,
  item: (id: number | string) => `carriers:item:${id}` as const,
} as const;

export const unit_measurements_tags = {
  list: () => 'unit-measurements:list' as const,
  item: (id: number | string) => `unit-measurements:item:${id}` as const,
} as const;

export const type_product_features_tags = {
  list: () => 'type-product-features:list' as const,
  item: (type_product_id: number | string) =>
    `type-product-features:item:${type_product_id}` as const,
} as const;

export const product_features_tags = {
  list: () => 'product-features:list' as const,
  item: (product_id: number | string, feature_id: number | string) =>
    `product-features:item:${product_id}:${feature_id}` as const,
} as const;

export const features_tags = {
  list: () => 'features:list' as const,
  item: (id: number | string) => `features:item:${id}` as const,
} as const;

export const warehouses_tags = {
  list: () => 'warehouses:list' as const,
  item: (id: number | string) => `warehouses:item:${id}` as const,
} as const;

export const suppliers_tags = {
  list: () => 'suppliers:list' as const,
  item: (id: number | string) => `suppliers:item:${id}` as const,
} as const;

export const products_tags = {
  list: () => 'products:list' as const,
  item: (id: number | string) => `products:item:${id}` as const,
} as const;

export const product_combos_tags = {
  list: () => 'product-combos:list' as const,
  item: (id: number | string) => `product-combos:item:${id}` as const,
} as const;

export const product_children_tags = {
  list: () => 'product-children:list' as const,
  item: (id: number | string) => `product-children:item:${id}` as const,
} as const;

export const dispatch_products_tags = {
  list: () => 'dispatch-products:list' as const,
  item: (id: number | string) => `dispatch-products:item:${id}` as const,
} as const;

export const return_methods_tags = {
  list: () => 'return-methods:list' as const,
  item: (id: number | string) => `return-methods:item:${id}` as const,
} as const;

export const refund_methods_tags = {
  list: () => 'refund-methods:list' as const,
  item: (id: number | string) => `refund-methods:item:${id}` as const,
} as const;

export const order_devolutions_tags = {
  list: () => 'order-devolutions:list' as const,
  item: (id: number | string) => `order-devolutions:item:${id}` as const,
} as const;

export const order_devolution_evidences_tags = {
  list: () => 'order-devolution-evidences:list' as const,
  item: (id: number | string) => `order-devolution-evidences:item:${id}` as const,
} as const;

export const order_devolution_details_tags = {
  list: () => 'order-devolution-details:list' as const,
  item: (id: number | string) => `order-devolution-details:item:${id}` as const,
} as const;

export const motive_devolutions_tags = {
  list: () => 'motive-devolutions:list' as const,
  item: (id: number | string) => `motive-devolutions:item:${id}` as const,
} as const;

export const subcategories_tags = {
  list: () => 'subcategories:list' as const,
  item: (id: number | string) => `subcategories:item:${id}` as const,
} as const;

export const categories_tags = {
  list: () => 'categories:list' as const,
  item: (id: number | string) => `categories:item:${id}` as const,
} as const;

export const brands_tags = {
  list: () => 'brands:list' as const,
  item: (id: number | string) => `brands:item:${id}` as const,
} as const;

export const product_orders_tags = {
  list: () => 'product-orders:list' as const,
  item: (id: number | string) => `product-orders:item:${id}` as const,
} as const;

export const payment_types_tags = {
  list: () => 'payment-types:list' as const,
  item: (id: number | string) => `payment-types:item:${id}` as const,
} as const;

export const orders_tags = {
  list: () => 'orders:list' as const,
  item: (id: number | string) => `orders:item:${id}` as const,
} as const;

export const inventory_movements_tags = {
  list: () => 'inventory-movements:list' as const,
  transfers: () => 'inventory-movements:transfers' as const,
  exits: () => 'inventory-movements:exits' as const,
  entries: () => 'inventory-movements:entries' as const,
} as const;

/** Existencias y reservas: cualquier movimiento, pago o cambio de línea de orden las invalida. */
export const stock_tags = {
  all: () => 'stock:all' as const,
} as const;

export const sales_analytics_tags = {
  trends: () => 'sales-analytics:trends' as const,
  report: () => 'sales-analytics:report' as const,
  kpis: () => 'sales-analytics:kpis' as const,
  funnels: () => 'sales-analytics:funnels' as const,
  cohorts: () => 'sales-analytics:cohorts' as const,
} as const;

export const type_products_tags = {
  list: () => 'type-products:list' as const,
  item: (id: number | string) => `type-products:item:${id}` as const,
} as const;

export const pages_tags = {
  list: () => 'pages:list' as const,
  item: (id: number | string) => `pages:item:${id}` as const,
} as const;

export const product_recommendations_tags = {
  list: () => 'product-recommendations:list' as const,
  item: (id: number | string) => `product-recommendations:item:${id}` as const,
} as const;

export const search_queries_tags = {
  list: () => 'search-queries:list' as const,
  item: (id: number | string) => `search-queries:item:${id}` as const,
} as const;

export const personalization_profiles_tags = {
  list: () => 'personalization-profiles:list' as const,
  item: (id: number | string) => `personalization-profiles:item:${id}` as const,
} as const;

export const parametros_tags = {
  geo_countries: () => 'parametros:geo:countries' as const,
  geo_states: (country_id: number | string) => `parametros:geo:states:${country_id}` as const,
  geo_cities: (state_id: number | string) => `parametros:geo:cities:${state_id}` as const,
} as const;

export const attributes_tags = {
  list: () => 'attributes:list' as const,
  item: (id: number | string) => `attributes:item:${id}` as const,
} as const;

export const product_templates_tags = {
  list: () => 'product-templates:list' as const,
  item: (id: number | string) => `product-templates:item:${id}` as const,
} as const;

export const product_attributes_tags = {
  all: () => 'product-attributes:all' as const,
  item: (product_id: number | string) => `product-attributes:item:${product_id}` as const,
} as const;
