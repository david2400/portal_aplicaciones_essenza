import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { sales_analytics_tags } from '@/server/lib/cache-tags';
import type {
  SalesAnalyticsDto,
  SalesPerformanceKpiDto,
  SalesConversionFunnelDto,
  SalesCohortAnalysisDto,
  SalesTrendsQuery,
  SalesReportQuery,
  SalesKpisQuery,
  SalesFunnelQuery,
  SalesCohortsQuery,
} from './types';

const sales_trends_path = '/api/shop/analytics/sales/trends';
const sales_report_path = '/api/shop/analytics/sales/report';
const sales_kpis_path = '/api/shop/analytics/sales/kpis';
const sales_funnel_path = '/api/shop/analytics/sales/funnel';
const sales_cohorts_path = '/api/shop/analytics/sales/cohorts';

function to_query_params<T extends Record<string, string | number | boolean | undefined>>(query: T) {
  return Object.entries(query).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export const sales_analytics_repository = {
  async get_sales_trends(query: SalesTrendsQuery): Promise<SalesAnalyticsDto[]> {
    return server_fetch.get<SalesAnalyticsDto[]>(sales_trends_path, {
      params: to_query_params({
        startDate: query.start_date,
        endDate: query.end_date,
        period: query.period,
      }),
      revalidate: 300,
      tags: [sales_analytics_tags.trends()],
    });
  },

  async get_sales_report(query: SalesReportQuery): Promise<SalesAnalyticsDto> {
    return server_fetch.get<SalesAnalyticsDto>(sales_report_path, {
      params: to_query_params({
        startDate: query.start_date,
        endDate: query.end_date,
        period: query.period,
      }),
      revalidate: 300,
      tags: [sales_analytics_tags.report()],
    });
  },

  async get_sales_kpis(query: SalesKpisQuery): Promise<SalesPerformanceKpiDto> {
    return server_fetch.get<SalesPerformanceKpiDto>(sales_kpis_path, {
      params: to_query_params({
        startDate: query.start_date,
        endDate: query.end_date,
      }),
      revalidate: 300,
      tags: [sales_analytics_tags.kpis()],
    });
  },

  async get_sales_funnel(query: SalesFunnelQuery): Promise<SalesConversionFunnelDto> {
    return server_fetch.get<SalesConversionFunnelDto>(sales_funnel_path, {
      params: to_query_params({
        startDate: query.start_date,
        endDate: query.end_date,
      }),
      revalidate: 300,
      tags: [sales_analytics_tags.funnels()],
    });
  },

  async get_sales_cohorts(query: SalesCohortsQuery): Promise<SalesCohortAnalysisDto[]> {
    return server_fetch.get<SalesCohortAnalysisDto[]>(sales_cohorts_path, {
      params: to_query_params({
        startDate: query.start_date,
        endDate: query.end_date,
      }),
      revalidate: 300,
      tags: [sales_analytics_tags.cohorts()],
    });
  },
} as const;
