import 'server-only';

import { cache } from 'react';

import { sales_analytics_repository } from './repository';
import type {
  SalesTrendsQuery,
  SalesReportQuery,
  SalesKpisQuery,
  SalesFunnelQuery,
  SalesCohortsQuery,
} from './types';

export const get_sales_trends = cache(async (query: SalesTrendsQuery) => {
  return sales_analytics_repository.get_sales_trends(query);
});

export const get_sales_report = cache(async (query: SalesReportQuery) => {
  return sales_analytics_repository.get_sales_report(query);
});

export const get_sales_kpis = cache(async (query: SalesKpisQuery) => {
  return sales_analytics_repository.get_sales_kpis(query);
});

export const get_sales_funnel = cache(async (query: SalesFunnelQuery) => {
  return sales_analytics_repository.get_sales_funnel(query);
});

export const get_sales_cohorts = cache(async (query: SalesCohortsQuery) => {
  return sales_analytics_repository.get_sales_cohorts(query);
});
