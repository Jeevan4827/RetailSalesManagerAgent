import React, { useState } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  ComposedChart, Line
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  Layers, 
  CloudRain, 
  CalendarDays, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import type { DashboardAnalyticsData } from '../../types/analytics';

interface ChartsGridProps {
  data: DashboardAnalyticsData;
  onAskAi?: (prompt: string) => void;
}

const COLORS = ['#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#f43f5e'];

export const ChartsGrid: React.FC<ChartsGridProps> = ({ data, onAskAi }) => {
  const [trendMetric, setTrendMetric] = useState<'revenue' | 'units_sold'>('revenue');

  const formatCurrency = (val: number): string => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
    return `$${val.toFixed(0)}`;
  };

  const formatNumber = (val: number): string => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return val.toLocaleString();
  };

  // Promotional lift calculations
  const promo = data.promotional_impact;
  const promoLiftUnits = promo.regular_avg_units > 0 
    ? (((promo.promo_avg_units - promo.regular_avg_units) / promo.regular_avg_units) * 100).toFixed(1)
    : '0';
  const promoLiftRev = promo.regular_avg_revenue > 0
    ? (((promo.promo_avg_revenue - promo.regular_avg_revenue) / promo.regular_avg_revenue) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Row 1: Time Series Trend & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Time-Series Revenue & Demand Trajectory (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Sales Trajectory & Demand Forecast Trend
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly progression comparing realized sales performance against predicted demand
                </p>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTrendMetric('revenue')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    trendMetric === 'revenue'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Gross Revenue ($)
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric('units_sold')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    trendMetric === 'units_sold'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Units Sold
                </button>
              </div>
            </div>

            {/* Area Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthly_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => trendMetric === 'revenue' ? formatCurrency(val) : formatNumber(val)}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                    formatter={(val: any, name: any) => {
                      const num = Number(val) || 0;
                      if (name === 'Gross Revenue') return [formatCurrency(num), name];
                      return [formatNumber(num), name];
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  {trendMetric === 'revenue' ? (
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Gross Revenue" 
                      stroke="#0d9488" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  ) : (
                    <>
                      <Area 
                        type="monotone" 
                        dataKey="units_sold" 
                        name="Units Sold" 
                        stroke="#0d9488" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="demand" 
                        name="Demand Forecast" 
                        stroke="#0284c7" 
                        strokeWidth={2} 
                        strokeDasharray="4 4"
                        fillOpacity={1} 
                        fill="url(#colorDemand)" 
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {onAskAi && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>24-month observation window (2022 – 2024)</span>
              <button
                type="button"
                onClick={() => onAskAi('Explain seasonal trends and peaks in monthly sales revenue across the 2-year history.')}
                className="flex items-center gap-1 text-teal-700 font-medium hover:underline"
              >
                <span>Analyze peaks with AI</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Chart 2: Category Revenue Breakdown Donut & Table (1 Col) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                Category Revenue Share
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Contribution across major product departments
            </p>

            {/* Donut Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.category_breakdown}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {data.category_breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Stats Mini List */}
            <div className="space-y-2 mt-2">
              {data.category_breakdown.map((cat, idx) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                    />
                    <span className="font-medium text-slate-700">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{formatCurrency(cat.revenue)}</span>
                    <span className="text-[10px] text-slate-400">({cat.avg_discount}% disc)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {onAskAi && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end text-xs text-slate-500 mt-4">
              <button
                type="button"
                onClick={() => onAskAi('Which product category delivers the highest margin and revenue performance?')}
                className="flex items-center gap-1 text-teal-700 font-medium hover:underline"
              >
                <span>Category Breakdown Query</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Regional Performance & Inventory vs Demand Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Regional Sales & Stores Performance */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Regional Volume & Revenue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparative sales figures across East, North, South, and West
                  </p>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.regional_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="region" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any, name: any) => {
                      const num = Number(val) || 0;
                      if (name === 'Revenue') return [formatCurrency(num), name];
                      return [formatNumber(num), name];
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="revenue" name="Revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
            {data.regional_breakdown.map((r) => (
              <div key={r.region} className="bg-slate-50 rounded-lg p-2">
                <p className="text-[10px] text-slate-500 font-medium uppercase">{r.region}</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{formatCurrency(r.revenue)}</p>
                <p className="text-[10px] text-teal-700">{formatNumber(r.units_sold)} sold</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Inventory Level vs Demand Forecast by Category */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Stock Coverage by Category
                  </h3>
                  <p className="text-xs text-slate-500">
                    Units sold vs on-hand inventory levels
                  </p>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.category_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [formatNumber(Number(val) || 0), name]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="units_sold" name="Units Sold" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="inventory" name="Inventory on Hand" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {onAskAi && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Healthy buffer across all primary departments</span>
              <button
                type="button"
                onClick={() => onAskAi('Are there any inventory imbalances or potential stockout risks by category?')}
                className="flex items-center gap-1 text-teal-700 font-medium hover:underline"
              >
                <span>Audit Inventory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Infographics Strip (Weather Impact, Seasonality, Promotion Lift) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Infographic 1: Weather Conditions Sales Impact */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Weather Sensitivity Index
              </h3>
              <p className="text-[11px] text-slate-500">
                Sales breakdown under differing climates
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {data.weather_impact.map((w) => (
              <div key={w.weather_condition} className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>{w.weather_condition}</span>
                  <span className="text-teal-700">{formatCurrency(w.revenue)}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-600 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (w.units_sold / (data.kpis.total_units_sold / 4)) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{formatNumber(w.units_sold)} units</span>
                  <span>{w.avg_discount}% avg discount</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Infographic 2: Seasonality Impact */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Quarterly Seasonality Cycles
              </h3>
              <p className="text-[11px] text-slate-500">
                Annual shopping cycles & order pipelines
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {data.seasonality_impact.map((s) => (
              <div key={s.seasonality} className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>{s.seasonality}</span>
                  <span className="text-indigo-600">{formatCurrency(s.revenue)}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (s.units_sold / (data.kpis.total_units_sold / 4)) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{formatNumber(s.units_sold)} units sold</span>
                  <span>{formatNumber(s.units_ordered)} ordered</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Infographic 3: Holiday Promotion Lift Card */}
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-800/80 text-teal-300 border border-teal-700">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Promotional Campaign Lift
                  </h3>
                  <p className="text-[11px] text-teal-200/80">
                    Holiday promotion vs standard sales day
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                <p className="text-[11px] text-teal-200 uppercase font-semibold">Volume Lift on Promo Days</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-white">
                    {promo.promo_avg_units.toFixed(0)}
                  </span>
                  <span className="text-xs text-teal-300">
                    vs {promo.regular_avg_units.toFixed(0)} avg units/day
                  </span>
                </div>
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400">
                  {promoLiftUnits}% higher velocity
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                <p className="text-[11px] text-teal-200 uppercase font-semibold">Average Revenue per Day</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-white">
                    ${promo.promo_avg_revenue.toLocaleString()}
                  </span>
                  <span className="text-xs text-teal-300">
                    vs ${promo.regular_avg_revenue.toLocaleString()}
                  </span>
                </div>
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400">
                  {promoLiftRev}% daily revenue lift
                </span>
              </div>
            </div>
          </div>

          {onAskAi && (
            <button
              type="button"
              onClick={() => onAskAi('What is the return on investment (ROI) and unit elasticity during holiday promotional periods?')}
              className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-teal-300 hover:text-white transition-colors"
            >
              <span>Explore promotional elasticity</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Row 4: Top 10 High-Volume Products Bar Chart */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Top 10 Best-Selling Products Across Network
              </h3>
              <p className="text-xs text-slate-500">
                Ranked by total units sold with inventory buffer and demand forecast
              </p>
            </div>
          </div>

          {onAskAi && (
            <button
              type="button"
              onClick={() => onAskAi('List the top 10 products with their current stock and forecasted demand.')}
              className="hidden sm:flex items-center gap-1 text-xs text-teal-700 font-medium hover:underline"
            >
              <span>Query All Products</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data.top_products} 
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
              <YAxis 
                type="category" 
                dataKey="product_id" 
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any, name: any) => {
                  const num = Number(val) || 0;
                  if (name === 'Gross Revenue') return [formatCurrency(num), name];
                  return [formatNumber(num), name];
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="units_sold" name="Units Sold" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
