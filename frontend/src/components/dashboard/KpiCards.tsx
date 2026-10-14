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

  const cards = [
    {
      id: 'revenue',
      title: 'Total Gross Revenue',
      value: formatCurrency(kpis.total_revenue),
      subtext: `Avg item price $${kpis.avg_price.toFixed(2)}`,
      icon: DollarSign,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badge: 'Revenue Leader',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      askPrompt: 'What drove the total gross revenue and which categories contributed the most?'
    },
    {
      id: 'units_sold',
      title: 'Total Units Sold',
      value: formatNumber(kpis.total_units_sold),
      subtext: `From ${kpis.total_records.toLocaleString()} transactions`,
      icon: Package,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      badge: 'Sales Volume',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      askPrompt: 'Analyze sales velocity and which products had the highest units sold.'
    },
    {
      id: 'inventory',
      title: 'Inventory on Hand',
      value: formatNumber(kpis.total_inventory),
      subtext: `Replenishment: ${formatNumber(kpis.total_units_ordered)} ordered`,
      icon: Boxes,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      badge: 'Current Stock',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      askPrompt: 'What is our current stock posture and are there any overstocked categories?'
    },
    {
      id: 'stock_ratio',
      title: 'Stock-to-Demand Coverage',
      value: `${kpis.stock_to_demand_ratio.toFixed(1)}%`,
      subtext: `Forecast: ${formatNumber(kpis.total_demand_forecast)} units expected`,
      icon: isHealthySupply ? ShieldCheck : AlertTriangle,
      iconBg: isHealthySupply 
        ? 'bg-teal-50 text-teal-600 border-teal-200' 
        : 'bg-amber-50 text-amber-600 border-amber-200',
      badge: isHealthySupply ? 'Fully Stocked' : 'Supply Risk',
      badgeBg: isHealthySupply 
        ? 'bg-teal-50 text-teal-700 border-teal-200' 
        : 'bg-amber-50 text-amber-700 border-amber-200',
      askPrompt: 'Compare our inventory levels against demand forecast to identify stockout risks.'
    },
    {
      id: 'discount',
      title: 'Average Discount Depth',
      value: `${kpis.avg_discount.toFixed(1)}%`,
      subtext: 'Across all promotional & standard sales',
      icon: Percent,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      badge: 'Promotion',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      askPrompt: 'Did higher discounts correlate with increased sales volume?'
    },
    {
      id: 'units_ordered',
      title: 'Units Ordered',
      value: formatNumber(kpis.total_units_ordered),
      subtext: 'Pipeline replenishment orders',
      icon: TrendingUp,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
      badge: 'Supply Chain',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      askPrompt: 'What is the order fulfillment cadence across our stores?'
    },
    {
      id: 'stores',
      title: 'Active Retail Stores',
      value: kpis.active_stores_count.toString(),
      subtext: 'Across East, North, South, West regions',
      icon: Store,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      badge: 'Locations',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      askPrompt: 'Which retail store location generates the highest revenue?'
    },
    {
      id: 'products',
      title: 'Active Catalog SKUs',
      value: kpis.active_products_count.toString(),
      subtext: 'Distributed across 5 major categories',
      icon: Tag,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      badge: 'Product Catalog',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      askPrompt: 'Show performance metrics broken down by product catalog category.'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="group relative bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`p-2.5 rounded-lg border ${card.iconBg}`}>
                  <IconComponent className="w-5 h-5" />
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeBg}`}>
                  {card.badge}
                </span>
              </div>
              <h3 className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {card.value}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">{card.subtext}</span>
              {onAskAi && (
                <button
                  type="button"
                  onClick={() => onAskAi(card.askPrompt)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-teal-700 font-medium hover:underline transition-opacity ml-2 whitespace-nowrap"
                  title="Ask AI assistant about this metric"
                >
                  <span>Query AI</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
