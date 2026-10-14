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
  ArrowUpRight,
  MousePointerClick
} from 'lucide-react';
import type { DashboardAnalyticsData, DashboardFilterState } from '../../types/analytics';

interface ChartsGridProps {
  data: DashboardAnalyticsData;
  onAskAi?: (prompt: string) => void;
  onFilterSelect?: (filter: Partial<DashboardFilterState>) => void;
}

const NEON_PALETTE = ['#0d9488', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#f43f5e'];

// Custom Glassmorphic Tooltip for Recharts
const CustomGlassTooltip = ({ active, payload, label, isCurrency = false }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-obsidian-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl p-3.5 shadow-glass text-xs space-y-1.5 z-50 pointer-events-none">
        <p className="font-bold text-white text-[11px] uppercase tracking-wider pb-1 border-b border-slate-800">
          {label}
        </p>
        {payload.map((entry: any, index: number) => {
          const val = Number(entry.value) || 0;
          const formatted = isCurrency || entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('sales')
            ? `$${val.toLocaleString()}`
            : val.toLocaleString();
          return (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.fill }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white font-mono">{formatted}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export const ChartsGrid: React.FC<ChartsGridProps> = ({ data, onAskAi, onFilterSelect }) => {
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

  const handleCategoryClick = (category: string) => {
    if (onFilterSelect) {
      onFilterSelect({ category });
    }
  };

  const handleRegionClick = (region: string) => {
    if (onFilterSelect) {
      onFilterSelect({ region });
    }
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Time Series Trend (2 Cols) & Category Share Donut (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Time-Series Revenue & Demand Trajectory */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-glass hover:border-teal-500/30 transition-all flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-72 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Sales Trajectory & Predictive Demand Trend
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      24-month continuous observation comparing realized performance against forecast
                    </p>
                  </div>
                </div>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center gap-1 bg-obsidian-950/80 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTrendMetric('revenue')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    trendMetric === 'revenue'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-glow-teal'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Gross Revenue ($)
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric('units_sold')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    trendMetric === 'units_sold'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-glow-teal'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Units Sold vs Forecast
                </button>
              </div>
            </div>

            {/* Area Chart with Multi-stop Glowing SVG Gradients */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthly_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="neonTealArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.6} />
                      <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0a0f1d" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="neonDemandArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0a0f1d" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => trendMetric === 'revenue' ? formatCurrency(val) : formatNumber(val)}
                  />
                  <Tooltip content={<CustomGlassTooltip isCurrency={trendMetric === 'revenue'} />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  {trendMetric === 'revenue' ? (
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Gross Sales ($)" 
                      stroke="#14b8a6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#neonTealArea)" 
                      activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#fff', strokeWidth: 2 }}
                    />
                  ) : (
                    <>
                      <Area 
                        type="monotone" 
                        dataKey="units_sold" 
                        name="Units Sold" 
                        stroke="#14b8a6" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#neonTealArea)" 
                        activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#fff', strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="demand" 
                        name="Demand Forecast" 
                        stroke="#818cf8" 
                        strokeWidth={2.5} 
                        strokeDasharray="4 4"
                        fillOpacity={1} 
                        fill="url(#neonDemandArea)" 
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {onAskAi && (
            <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                2022-01-01 to 2024-01-01 Real Time Data
              </span>
              <button
                type="button"
                onClick={() => onAskAi('Explain seasonal trends and peaks in monthly sales revenue across the 2-year history.')}
                className="flex items-center gap-1 text-teal-400 hover:text-teal-200 font-semibold transition-colors"
              >
                <span>Deep Audit with AI</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Chart 2: Category Revenue Share Donut with Click-to-Filter */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-glass hover:border-teal-500/30 transition-all flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <PieIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Category Revenue Share
                </h3>
              </div>
              <span className="text-[10px] text-teal-400 flex items-center gap-1 font-semibold">
                <MousePointerClick className="w-3 h-3" /> Click to Filter
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Contribution across 5 major departments
            </p>

            {/* Donut Chart with Center Holographic Summary */}
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.category_breakdown}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={4}
                    onClick={(entry: any) => handleCategoryClick(entry?.category || entry?.name || entry?.payload?.category)}
                    className="cursor-pointer"
                  >
                    {data.category_breakdown.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={NEON_PALETTE[index % NEON_PALETTE.length]}
                        stroke="#0a0f1d"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomGlassTooltip isCurrency={true} />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Total Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                <span className="text-sm font-extrabold text-white font-mono">
                  {formatCurrency(data.kpis.total_revenue)}
                </span>
              </div>
            </div>

            {/* Category Stats Interactive List */}
            <div className="space-y-2 mt-2">
              {data.category_breakdown.map((cat, idx) => (
                <div 
                  key={cat.category}
                  onClick={() => handleCategoryClick(cat.category)}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors group/row"
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shadow-sm" 
                      style={{ backgroundColor: NEON_PALETTE[idx % NEON_PALETTE.length] }} 
                    />
                    <span className="font-semibold text-slate-200 group-hover/row:text-teal-300 transition-colors">
                      {cat.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white">{formatCurrency(cat.revenue)}</span>
                    <span className="text-[10px] text-slate-400 font-sans">({cat.avg_discount}% disc)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {onAskAi && (
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end text-xs text-slate-400 mt-4">
              <button
                type="button"
                onClick={() => onAskAi('Which product category delivers the highest margin and revenue performance?')}
                className="flex items-center gap-1 text-teal-400 hover:text-teal-200 font-semibold transition-colors"
              >
                <span>Category Breakdown Query</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Regional Performance & Stock vs Demand Coverage Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Regional Sales & Stores Performance */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-glass hover:border-teal-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Regional Volume & Revenue Comparison
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comparative turnover across East, North, South, and West
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-teal-400 flex items-center gap-1 font-semibold">
                <MousePointerClick className="w-3 h-3" /> Click Region
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.regional_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="neonBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#0f766e" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="region" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomGlassTooltip isCurrency={true} />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue ($)" 
                    fill="url(#neonBarGradient)" 
                    radius={[6, 6, 0, 0]} 
                    onClick={(entry: any) => handleRegionClick(entry?.region || entry?.payload?.region)}
                    className="cursor-pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5 pt-4 border-t border-slate-800/80 text-center">
            {data.regional_breakdown.map((r) => (
              <div 
                key={r.region} 
                onClick={() => handleRegionClick(r.region)}
                className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 hover:border-teal-500/40 cursor-pointer transition-all"
              >
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{r.region}</p>
                <p className="text-xs font-extrabold text-white mt-0.5 font-mono">{formatCurrency(r.revenue)}</p>
                <p className="text-[10px] text-teal-300 font-mono">{formatNumber(r.units_sold)} sold</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Inventory Level vs Demand Forecast by Category */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-glass hover:border-teal-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Stock Coverage by Category
                  </h3>
                  <p className="text-xs text-slate-400">
                    Units sold vs on-hand physical inventory levels
                  </p>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.category_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
                  <Tooltip content={<CustomGlassTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="units_sold" name="Units Sold" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  <Line type="monotone" dataKey="inventory" name="Inventory on Hand" stroke="#f59e0b" strokeWidth={3.5} dot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 1.5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {onAskAi && (
            <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Optimal stock posture maintained
              </span>
              <button
                type="button"
                onClick={() => onAskAi('Are there any inventory imbalances or potential stockout risks by category?')}
                className="flex items-center gap-1 text-teal-400 hover:text-teal-200 font-semibold transition-colors"
              >
                <span>Audit Stockout Risks</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Infographics Strip (Weather Impact, Seasonality, Promotion Lift) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Infographic 1: Weather Conditions Sales Impact */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Weather Sensitivity Index
              </h3>
              <p className="text-[11px] text-slate-400">
                Sales velocity across climate conditions
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {data.weather_impact.map((w) => (
              <div key={w.weather_condition} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    {w.weather_condition}
                  </span>
                  <span className="text-teal-300 font-mono">{formatCurrency(w.revenue)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(100, (w.units_sold / (data.kpis.total_units_sold / 4)) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                  <span>{formatNumber(w.units_sold)} units</span>
                  <span>{w.avg_discount}% avg discount</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Infographic 2: Seasonality Impact */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Quarterly Seasonality Cycles
              </h3>
              <p className="text-[11px] text-slate-400">
                Annual shopping cycles & order pipelines
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {data.seasonality_impact.map((s) => (
              <div key={s.seasonality} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {s.seasonality}
                  </span>
                  <span className="text-amber-300 font-mono">{formatCurrency(s.revenue)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(100, (s.units_sold / (data.kpis.total_units_sold / 4)) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                  <span>{formatNumber(s.units_sold)} units sold</span>
                  <span>{formatNumber(s.units_ordered)} ordered</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Infographic 3: Holiday Promotion Lift Card */}
        <div className="glass-panel-glow rounded-2xl p-6 border border-teal-500/30 shadow-glow-teal flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Promotional Campaign Lift
                  </h3>
                  <p className="text-[11px] text-teal-200/80">
                    Holiday promotion vs standard sales day
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="bg-obsidian-950/70 backdrop-blur-md rounded-xl p-3.5 border border-slate-700/60 shadow-inner">
                <p className="text-[11px] text-teal-300 uppercase font-bold tracking-wider">Volume Velocity Lift</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {promo.promo_avg_units.toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-400">
                    vs {promo.regular_avg_units.toFixed(0)} avg units/day
                  </span>
                </div>
                <span className="inline-block mt-1 text-[11px] font-bold text-emerald-400 font-mono">
                  +{promoLiftUnits}% higher turnover
                </span>
              </div>

              <div className="bg-obsidian-950/70 backdrop-blur-md rounded-xl p-3.5 border border-slate-700/60 shadow-inner">
                <p className="text-[11px] text-teal-300 uppercase font-bold tracking-wider">Daily Revenue Yield</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    ${promo.promo_avg_revenue.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">
                    vs ${promo.regular_avg_revenue.toLocaleString()}
                  </span>
                </div>
                <span className="inline-block mt-1 text-[11px] font-bold text-emerald-400 font-mono">
                  +{promoLiftRev}% daily revenue surge
                </span>
              </div>
            </div>
          </div>

          {onAskAi && (
            <button
              type="button"
              onClick={() => onAskAi('What is the return on investment (ROI) and unit elasticity during holiday promotional periods?')}
              className="mt-4 pt-3.5 border-t border-teal-500/20 flex items-center justify-between text-xs text-teal-300 hover:text-white transition-colors group"
            >
              <span className="font-semibold">Explore promotional elasticity</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Row 4: Top 10 High-Volume Products Bar Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-glass">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Top 10 Best-Selling SKUs Across Network
              </h3>
              <p className="text-xs text-slate-400">
                Ranked by total units sold with inventory buffer and forecasted demand
              </p>
            </div>
          </div>

          {onAskAi && (
            <button
              type="button"
              onClick={() => onAskAi('List the top 10 products with their current stock and forecasted demand.')}
              className="hidden sm:flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-200 font-bold transition-colors"
            >
              <span>Query All 20 SKUs</span>
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
              <defs>
                <linearGradient id="neonHorizontalBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
              <YAxis 
                type="category" 
                dataKey="product_id" 
                tick={{ fontSize: 11, fill: '#f1f5f9', fontWeight: 700 }} 
                axisLine={{ stroke: '#334155' }}
                tickLine={false} 
              />
              <Tooltip content={<CustomGlassTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="units_sold" name="Units Sold" fill="url(#neonHorizontalBar)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
