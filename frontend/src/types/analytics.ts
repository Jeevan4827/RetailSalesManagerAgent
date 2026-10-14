export interface KpiMetrics {
  total_records: number;
  total_units_sold: number;
  total_revenue: number;
  total_inventory: number;
  total_units_ordered: number;
  avg_discount: number;
  avg_price: number;
  total_demand_forecast: number;
  stock_to_demand_ratio: number;
  active_stores_count: number;
  active_products_count: number;
}

export interface MonthlyTrendItem {
  month: string;
  units_sold: number;
  revenue: number;
  demand: number;
}

export interface CategoryBreakdownItem {
  category: string;
  units_sold: number;
  revenue: number;
  inventory: number;
  avg_discount: number;
  avg_price: number;
}

export interface RegionalBreakdownItem {
  region: string;
  units_sold: number;
  revenue: number;
  inventory: number;
  stores_count: number;
}

export interface WeatherImpactItem {
  weather_condition: string;
  units_sold: number;
  revenue: number;
  avg_units_per_day: number;
  avg_discount: number;
}

export interface SeasonalityImpactItem {
  seasonality: string;
  units_sold: number;
  revenue: number;
  units_ordered: number;
}

export interface PromotionalImpact {
  promo_days: number;
  regular_days: number;
  promo_avg_units: number;
  regular_avg_units: number;
  promo_avg_revenue: number;
  regular_avg_revenue: number;
  promo_avg_discount: number;
  regular_avg_discount: number;
}

export interface TopProductItem {
  product_id: string;
  category: string;
  units_sold: number;
  revenue: number;
  inventory: number;
  demand: number;
}

export interface FilterOptionsMeta {
  categories: string[];
  regions: string[];
  weather_conditions: string[];
  seasonalities: string[];
  date_range: {
    min_date: string;
    max_date: string;
  };
}

export interface DashboardAnalyticsData {
  kpis: KpiMetrics;
  monthly_trends: MonthlyTrendItem[];
  category_breakdown: CategoryBreakdownItem[];
  regional_breakdown: RegionalBreakdownItem[];
  weather_impact: WeatherImpactItem[];
  seasonality_impact: SeasonalityImpactItem[];
  promotional_impact: PromotionalImpact;
  top_products: TopProductItem[];
  filter_options: FilterOptionsMeta;
}

export interface DashboardFilterState {
  category?: string;
  region?: string;
  weather?: string;
  seasonality?: string;
  holiday_promotion?: number | null;
  start_date?: string;
  end_date?: string;
}

export interface RetailInventoryRecord {
  id: number;
  date: string;
  store_id: string;
  product_id: string;
  category: string;
  region: string;
  inventory_level: number;
  units_sold: number;
  units_ordered: number;
  demand_forecast: number;
  price: number;
  discount: number;
  revenue: number;
  weather_condition: string;
  holiday_promotion: number;
  seasonality: string;
}

export interface PaginatedRecordsResponseData {
  records: RetailInventoryRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ScenarioSimulationRequestParams {
  category?: string;
  region?: string;
  price_change_pct: number;
  demand_shock_pct: number;
  target_weather?: string;
  competitor_discount_pct?: number;
  is_holiday_mode?: boolean;
}

export interface AtRiskSkuItem {
  product_id: string;
  category: string;
  region: string;
  current_inventory: number;
  base_demand: number;
  simulated_demand: number;
  shortfall_units: number;
  estimated_revenue_loss: number;
  recommended_reorder: number;
}

export interface PriceSensitivityPoint {
  price_delta: string;
  price_delta_num: number;
  projected_revenue: number;
  volume_lift_pct: number;
}

export interface ScenarioSimulationResult {
  baseline_revenue: number;
  simulated_revenue: number;
  revenue_delta: number;
  revenue_delta_pct: number;
  baseline_units: number;
  simulated_units: number;
  units_delta: number;
  units_delta_pct: number;
  baseline_stock_to_demand: number;
  simulated_stock_to_demand: number;
  stockout_vulnerable_skus_count: number;
  estimated_stockout_loss: number;
  net_realized_revenue: number;
  elasticity_coefficient: number;
  category_comparison: Array<{
    category: string;
    baseline_revenue: number;
    simulated_revenue: number;
    delta_pct: number;
  }>;
  regional_comparison: Array<{
    region: string;
    baseline_revenue: number;
    simulated_revenue: number;
  }>;
  price_sensitivity_curve: PriceSensitivityPoint[];
  at_risk_skus: AtRiskSkuItem[];
  ai_executive_summary: string;
  suggested_copilot_prompt: string;
}

