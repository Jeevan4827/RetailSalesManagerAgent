import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Loader2,
  Table as TableIcon,
  Sparkles
} from 'lucide-react';
import { fetchAnalyticsRecords } from '../../services/api';
import type { DashboardFilterState, PaginatedRecordsResponseData, RetailInventoryRecord } from '../../types/analytics';

interface RecordsExplorerProps {
  filters: DashboardFilterState;
  onAskAi?: (prompt: string) => void;
}

export const RecordsExplorer: React.FC<RecordsExplorerProps> = ({ filters, onAskAi }) => {
  const [data, setData] = useState<PaginatedRecordsResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await fetchAnalyticsRecords({
        filters,
        sortBy,
        sortOrder,
        page,
        pageSize,
        search
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filters, search, sortBy, sortOrder, pageSize]);

  useEffect(() => {
    loadRecords();
  }, [filters, sortBy, sortOrder, page, pageSize, search]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 inline ml-1" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-teal-600 inline ml-1" /> 
      : <ArrowDown className="w-3 h-3 text-teal-600 inline ml-1" />;
  };

  const exportCsv = () => {
    if (!data || !data.records.length) return;
    const headers = [
      'Date', 'Store ID', 'Product ID', 'Category', 'Region', 
      'Units Sold', 'Price', 'Revenue', 'Inventory Level', 'Demand Forecast', 
      'Discount', 'Weather', 'Promotion', 'Seasonality'
    ];
    const rows = data.records.map((r) => [
      r.date, r.store_id, r.product_id, r.category, r.region,
      r.units_sold, r.price, r.revenue, r.inventory_level, r.demand_forecast,
      `${r.discount}%`, r.weather_condition, r.holiday_promotion ? 'Yes' : 'No', r.seasonality
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `retail_inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStockStatus = (inventory: number, demand: number) => {
    const ratio = demand > 0 ? inventory / demand : 1;
    if (ratio < 0.6) return { label: 'Low Stock', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (ratio > 2.5) return { label: 'Surplus', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Optimal', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
            <TableIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Interactive Inventory Records Explorer
            </h3>
            <p className="text-xs text-slate-500">
              {data ? `${data.total.toLocaleString()} records matching criteria` : 'Loading records...'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Product / Store ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-48 sm:w-60"
            />
          </div>

          {/* Page Size Select */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-teal-500"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </select>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportCsv}
            disabled={!data || data.records.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-medium text-teal-800 bg-teal-50 px-3 py-2 rounded-lg border border-teal-200">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Querying PostgreSQL inventory data...</span>
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th onClick={() => handleSort('date')} className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors">
                Date {getSortIcon('date')}
              </th>
              <th onClick={() => handleSort('category')} className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors">
                Category {getSortIcon('category')}
              </th>
              <th className="py-3 px-3">
                Product ID
              </th>
              <th onClick={() => handleSort('region')} className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors">
                Region {getSortIcon('region')}
              </th>
              <th onClick={() => handleSort('units_sold')} className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                Units Sold {getSortIcon('units_sold')}
              </th>
              <th onClick={() => handleSort('price')} className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                Price {getSortIcon('price')}
              </th>
              <th onClick={() => handleSort('revenue')} className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                Revenue {getSortIcon('revenue')}
              </th>
              <th onClick={() => handleSort('inventory_level')} className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                Stock {getSortIcon('inventory_level')}
              </th>
              <th onClick={() => handleSort('demand_forecast')} className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                Demand {getSortIcon('demand_forecast')}
              </th>
              <th className="py-3 px-3 text-center">
                Status
              </th>
              <th onClick={() => handleSort('discount')} className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                Disc {getSortIcon('discount')}
              </th>
              <th className="py-3 px-3">
                Conditions
              </th>
              <th className="py-3 px-3 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data && data.records.map((r: RetailInventoryRecord) => {
              const status = getStockStatus(r.inventory_level, r.demand_forecast);
              return (
                <tr key={r.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {r.product_id}
                    <span className="text-[10px] text-slate-400 block font-normal">{r.store_id}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {r.region}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                    {r.units_sold.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    ${r.price.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-teal-800">
                    ${r.revenue.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700">
                    {r.inventory_level.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {r.demand_forecast.toFixed(0)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.bg}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-purple-700 font-medium">
                    {r.discount}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                    <span>{r.weather_condition}</span>
                    {r.holiday_promotion === 1 && (
                      <span className="ml-1 px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[9px]">
                        PROMO
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {onAskAi && (
                      <button
                        type="button"
                        onClick={() => onAskAi(`Analyze sales trends, inventory posture, and demand forecast for product ${r.product_id} at store ${r.store_id} in category ${r.category}.`)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md transition-colors"
                        title="Query AI Assistant for this product"
                      >
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>Query AI</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {data && data.records.length === 0 && (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-400">
                  No inventory records match the applied criteria. Try broadening your filter selections.
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {data && (
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/40">
          <div>
            Showing <span className="font-semibold">{((data.page - 1) * data.page_size) + 1}</span> to{' '}
            <span className="font-semibold">{Math.min(data.total, data.page * data.page_size)}</span> of{' '}
            <span className="font-semibold">{data.total.toLocaleString()}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {data.page} of {data.total_pages}
            </span>
            <button
              type="button"
              disabled={page >= data.total_pages || loading}
              onClick={() => setPage((prev) => Math.min(data.total_pages, prev + 1))}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
