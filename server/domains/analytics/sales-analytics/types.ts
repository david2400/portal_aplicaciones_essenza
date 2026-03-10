import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type SalesAnalyticsDto = components['schemas']['SalesAnalyticsDto'];
export type SalesPerformanceKpiDto = components['schemas']['SalesPerformanceKpiDto'];
export type SalesConversionFunnelDto = components['schemas']['SalesConversionFunnelDto'];
export type SalesCohortAnalysisDto = components['schemas']['SalesCohortAnalysisDto'];

type DateRangeQuery = {
  start_date: string;
  end_date: string;
};

export type SalesTrendsQuery = DateRangeQuery & {
  period?: string;
};

export type SalesReportQuery = DateRangeQuery & {
  period?: string;
};

export type SalesKpisQuery = DateRangeQuery;

export type SalesFunnelQuery = DateRangeQuery;

export type SalesCohortsQuery = DateRangeQuery;
