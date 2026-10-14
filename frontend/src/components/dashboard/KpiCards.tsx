import React from 'react';
import { 
  DollarSign, 
  Package, 
  Boxes, 
  TrendingUp, 
  Percent, 
  Tag, 
  Store, 
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import type { KpiMetrics } from '../../types/analytics';

interface KpiCardsProps {
  kpis: KpiMetrics;
  onAskAi?: (prompt: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis, onAskAi }) => {
  const formatCurrency = (val: number): string => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
    return `$${val.toFixed(2)}`;
  };

  const formatNumber = (val: number): string => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  const isHealthySupply = kpis.stock_to_demand_ratio >= 100;

  // Mini decorative SVG sparkline paths for visual feedback
  const sparklineUp = "M 0 25 C 20 22, 35 15, 55 18 C 75 22, 90 8, 110 5 L 110 30 L 0 30 Z";
  const sparklineWave = "M 0 20 C 15 10, 30 25, 50 15 C 70 8, 85 22, 110 12 L 110 30 L 0 30 Z";
  const sparklineSurge = "M 0 28 C 25 24, 45 20, 65 14 C 85 8, 95 6, 110 2 L 110 30 L 0 30 Z";

  const cards = [
    {
      id: 'revenue',
      title: 'Total Gross Revenue',
      value: formatCurrency(kpis.total_revenue),
      subtext: `Avg item price $${kpis.avg_price.toFixed(2)}`,
      icon: DollarSign,
      glowBorder: 'group-hover:border-emerald-500/40',
      glowBg: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      accentGradient: 'from-emerald-400 to-teal-400',
      badge: 'Revenue Leader',
      badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      sparkline: sparklineSurge,
      sparkColor: '#10b981',
      askPrompt: 'What drove the total gross revenue and which categories contributed the most?'
    },
    {
      id: 'units_sold',
      title: 'Total Units Sold',
      value: formatNumber(kpis.total_units_sold),
      subtext: `From ${kpis.total_records.toLocaleString()} transactions`,
      icon: Package,
      glowBorder: 'group-hover:border-cyan-500/40',
      glowBg: 'from-cyan-500/10 via-teal-500/5 to-transparent',
      accentGradient: 'from-cyan-400 to-teal-400',
      badge: 'Sales Volume',
      badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      sparkline: sparklineUp,
      sparkColor: '#06b6d4',
      askPrompt: 'Analyze sales velocity and which products had the highest units sold.'
    },
    {
      id: 'inventory',
      title: 'Inventory on Hand',
      value: formatNumber(kpis.total_inventory),
      subtext: `Replenishment: ${formatNumber(kpis.total_units_ordered)} ordered`,
      icon: Boxes,
      glowBorder: 'group-hover:border-indigo-500/40',
      glowBg: 'from-indigo-500/10 via-purple-500/5 to-transparent',
      accentGradient: 'from-indigo-400 to-purple-400',
      badge: 'Current Stock',
      badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      sparkline: sparklineWave,
      sparkColor: '#818cf8',
      askPrompt: 'What is our current stock posture and are there any overstocked categories?'
    },
    {
      id: 'stock_ratio',
      title: 'Stock-to-Demand Ratio',
      value: `${kpis.stock_to_demand_ratio.toFixed(1)}%`,
      subtext: `Forecast: ${formatNumber(kpis.total_demand_forecast)} units`,
      icon: isHealthySupply ? ShieldCheck : AlertTriangle,
      glowBorder: isHealthySupply ? 'group-hover:border-teal-500/40' : 'group-hover:border-amber-500/40',
      glowBg: isHealthySupply ? 'from-teal-500/10 to-transparent' : 'from-amber-500/10 to-transparent',
      accentGradient: isHealthySupply ? 'from-teal-400 to-cyan-300' : 'from-amber-400 to-orange-400',
      badge: isHealthySupply ? 'Fully Stocked' : 'Supply Risk',
      badgeClass: isHealthySupply ? 'bg-teal-500/10 text-teal-300 border-teal-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      isGauge: true,
      askPrompt: 'Compare our inventory levels against demand forecast to identify stockout risks.'
    },
    {
      id: 'discount',
      title: 'Avg Discount Depth',
      value: `${kpis.avg_discount.toFixed(1)}%`,
      subtext: 'Across promotional & standard days',
      icon: Percent,
      glowBorder: 'group-hover:border-purple-500/40',
      glowBg: 'from-purple-500/10 to-transparent',
      accentGradient: 'from-purple-400 to-pink-400',
      badge: 'Promotion',
      badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      sparkline: sparklineWave,
      sparkColor: '#c084fc',
      askPrompt: 'Did higher discounts correlate with increased sales volume?'
    },
    {
      id: 'units_ordered',
      title: 'Units Ordered',
      value: formatNumber(kpis.total_units_ordered),
      subtext: 'Pipeline replenishment orders',
      icon: TrendingUp,
      glowBorder: 'group-hover:border-sky-500/40',
      glowBg: 'from-sky-500/10 to-transparent',
      accentGradient: 'from-sky-400 to-blue-400',
      badge: 'Supply Chain',
      badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      sparkline: sparklineUp,
      sparkColor: '#38bdf8',
      askPrompt: 'What is the order fulfillment cadence across our stores?'
    },
    {
      id: 'stores',
      title: 'Physical Store Hubs',
      value: kpis.active_stores_count.toString(),
      subtext: 'East, North, South, West regions',
      icon: Store,
      glowBorder: 'group-hover:border-amber-500/40',
      glowBg: 'from-amber-500/10 to-transparent',
      accentGradient: 'from-amber-400 to-yellow-400',
      badge: 'Locations',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      sparkline: sparklineSurge,
      sparkColor: '#fbbf24',
      askPrompt: 'Which retail store location generates the highest revenue?'
    },
    {
      id: 'products',
      title: 'Catalog Active SKUs',
      value: kpis.active_products_count.toString(),
      subtext: '5 merchandise departments',
      icon: Tag,
      glowBorder: 'group-hover:border-rose-500/40',
      glowBg: 'from-rose-500/10 to-transparent',
      accentGradient: 'from-rose-400 to-red-400',
      badge: 'Catalog',
      badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      sparkline: sparklineUp,
      sparkColor: '#fb7185',
      askPrompt: 'Show performance metrics broken down by product catalog category.'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`group relative glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-teal-500/40 shadow-glass-sm hover:shadow-glow-teal transition-all duration-300 flex flex-col justify-between overflow-hidden ${card.glowBorder}`}
          >
            {/* Top Glowing Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentGradient} opacity-70 group-hover:opacity-100 transition-opacity`} />

            {/* Ambient Radial Mesh on Card */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${card.glowBg} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

            <div>
              {/* Header: Icon + Badge */}
              <div className="flex items-center justify-between mb-3.5">
                <span className="p-2.5 rounded-xl bg-slate-800/80 text-white border border-slate-700/60 shadow-inner group-hover:scale-105 transition-transform">
                  <IconComponent className="w-4 h-4 text-teal-300" />
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeClass} flex items-center gap-1.5`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {card.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                {card.title}
              </h3>

              {/* Figure & Visual Representation */}
              <div className="flex items-end justify-between mt-1">
                <div>
                  <p className="text-3xl font-extrabold text-white tracking-tight group-hover:text-teal-200 transition-colors">
                    {card.value}
                  </p>
                </div>

                {/* Circular Gauge for Stock Ratio or Sparkline */}
                {card.isGauge ? (
                  <div className="relative w-11 h-11 shrink-0 mb-1">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#1e293b" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="14" fill="none"
                        stroke={isHealthySupply ? "#14b8a6" : "#f59e0b"}
                        strokeWidth="3.2"
                        strokeDasharray="88"
                        strokeDashoffset={Math.max(0, 88 - (Math.min(200, kpis.stock_to_demand_ratio) / 200) * 88)}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-teal-300 font-mono">
                      ✓
                    </span>
                  </div>
                ) : (
                  <div className="w-20 h-8 opacity-40 group-hover:opacity-80 transition-opacity">
                    <svg viewBox="0 0 110 30" className="w-full h-full overflow-visible">
                      <path d={card.sparkline} fill={card.sparkColor} fillOpacity="0.2" />
                      <path d={card.sparkline?.replace(/ L 110 30 L 0 30 Z/, '')} fill="none" stroke={card.sparkColor} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Subtext and AI Prompt Link */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate max-w-[170px]">{card.subtext}</span>
              {onAskAi && (
                <button
                  type="button"
                  onClick={() => onAskAi(card.askPrompt)}
                  className="flex items-center gap-1 text-teal-400 hover:text-teal-200 font-semibold transition-colors group/btn"
                  title="Query AI Copilot for this metric"
                >
                  <span className="text-[10px] tracking-wide uppercase">Ask AI</span>
                  <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
