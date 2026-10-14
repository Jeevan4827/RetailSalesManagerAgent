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
  Sparkles,
  Eye,
  X,
  Tag
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
  const [selectedRecord, setSelectedRecord] = useState<RetailInventoryRecord | null>(null);

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
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-slate-500 inline ml-1 opacity-40" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-teal-400 inline ml-1 font-bold" /> 
      : <ArrowDown className="w-3 h-3 text-teal-400 inline ml-1 font-bold" />;
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
    link.setAttribute('download', `retail_intelligence_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStockStatus = (inventory: number, demand: number) => {
    const ratio = demand > 0 ? inventory / demand : 1;
    if (ratio < 0.6) return { label: 'Low Stock', dot: 'bg-rose-400', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
    if (ratio > 2.5) return { label: 'Surplus', dot: 'bg-amber-400', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    return { label: 'Optimal', dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
  };

  return (
    <>
      <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-glass overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="p-4.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-obsidian-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <TableIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Granular Inventory Records Terminal
              </h3>
              <p className="text-xs text-slate-400">
                {data ? `${data.total.toLocaleString()} transactions indexed in Supabase PostgreSQL` : 'Querying records...'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Product / Store ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs pl-8 pr-3 py-2 bg-obsidian-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 w-48 sm:w-64 font-mono shadow-inner"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Page Size Select */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="text-xs bg-obsidian-950/80 border border-slate-700/80 rounded-xl px-2.5 py-2 text-slate-200 font-semibold focus:ring-2 focus:ring-teal-400 cursor-pointer shadow-inner"
            >
              <option value="10">10 rows</option>
              <option value="20">20 rows</option>
              <option value="50">50 rows</option>
            </select>

            {/* Export CSV */}
            <button
              type="button"
              onClick={exportCsv}
              disabled={!data || data.records.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[320px] relative">
          {loading && (
            <div className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center gap-3 text-xs font-semibold text-teal-300 bg-obsidian-900/90 px-4 py-2.5 rounded-xl border border-teal-500/40 shadow-glow-teal">
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                <span>Executing PostgreSQL index scan...</span>
              </div>
            </div>
          )}

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-obsidian-950/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th onClick={() => handleSort('date')} className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors">
                  Date {getSortIcon('date')}
                </th>
                <th onClick={() => handleSort('category')} className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors">
                  Category {getSortIcon('category')}
                </th>
                <th className="py-3 px-3.5">
                  SKU / Store
                </th>
                <th onClick={() => handleSort('region')} className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors">
                  Region {getSortIcon('region')}
                </th>
                <th onClick={() => handleSort('units_sold')} className="py-3 px-3.5 text-right cursor-pointer hover:text-white transition-colors">
                  Volume Sold {getSortIcon('units_sold')}
                </th>
                <th onClick={() => handleSort('price')} className="py-3 px-3.5 text-right cursor-pointer hover:text-white transition-colors">
                  Unit Price {getSortIcon('price')}
                </th>
                <th onClick={() => handleSort('revenue')} className="py-3 px-3.5 text-right cursor-pointer hover:text-white transition-colors">
                  Revenue ($) {getSortIcon('revenue')}
                </th>
                <th onClick={() => handleSort('inventory_level')} className="py-3 px-3.5 text-right cursor-pointer hover:text-white transition-colors">
                  Inventory {getSortIcon('inventory_level')}
                </th>
                <th onClick={() => handleSort('demand_forecast')} className="py-3 px-3.5 text-right cursor-pointer hover:text-white transition-colors">
                  Forecast {getSortIcon('demand_forecast')}
                </th>
                <th className="py-3 px-3.5 text-center">
                  Stock Health
                </th>
                <th onClick={() => handleSort('discount')} className="py-3 px-3.5 text-right cursor-pointer hover:text-white transition-colors">
                  Discount {getSortIcon('discount')}
                </th>
                <th className="py-3 px-3.5 text-center">
                  Inspection
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {data && data.records.map((r: RetailInventoryRecord) => {
                const status = getStockStatus(r.inventory_level, r.demand_forecast);
                const salesRatio = Math.min(100, (r.units_sold / 500) * 100);

                return (
                  <tr 
                    key={r.id} 
                    className="hover:bg-slate-800/40 transition-colors group/row"
                  >
                    <td className="py-3 px-3.5 font-mono text-slate-300 whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700/80">
                        {r.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-white group-hover/row:text-teal-300 font-mono transition-colors">
                        {r.product_id}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal font-mono">{r.store_id}</span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-300">
                      {r.region}
                    </td>
                    {/* Units Sold with visual micro progress indicator */}
                    <td className="py-3 px-3.5 text-right font-mono">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-white">{r.units_sold.toLocaleString()}</span>
                        <div className="w-16 bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-teal-400 h-full rounded-full" 
                            style={{ width: `${salesRatio}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                      ${r.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400">
                      ${r.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                      {r.inventory_level.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-400">
                      {r.demand_forecast.toFixed(0)}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-purple-300 font-bold">
                      {r.discount}%
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(r)}
                          className="p-1 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors"
                          title="Inspect Detailed Telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {onAskAi && (
                          <button
                            type="button"
                            onClick={() => onAskAi(`Analyze sales trends, inventory posture, and demand forecast for product ${r.product_id} at store ${r.store_id} in category ${r.category}.`)}
                            className="p-1 rounded-lg text-teal-400 hover:text-white hover:bg-teal-500/20 transition-colors"
                            title="Query AI Assistant about this SKU"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {data && data.records.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-16 text-center text-slate-400">
                    No inventory records match the applied criteria. Try broadening your filter selections.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && (
          <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-obsidian-950/60 font-mono">
            <div>
              Showing <span className="font-bold text-white">{((data.page - 1) * data.page_size) + 1}</span> to{' '}
              <span className="font-bold text-white">{Math.min(data.total, data.page * data.page_size)}</span> of{' '}
              <span className="font-bold text-teal-300">{data.total.toLocaleString()}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-white">
                Page {data.page} / {data.total_pages}
              </span>
              <button
                type="button"
                disabled={page >= data.total_pages || loading}
                onClick={() => setPage((prev) => Math.min(data.total_pages, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Record Telemetry Modal / Drawer */}
      {selectedRecord && (
        <div 
          onClick={() => setSelectedRecord(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-panel-glow max-w-lg w-full rounded-2xl p-6 border border-teal-500/40 shadow-glow-teal relative text-xs space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    SKU Telemetry: {selectedRecord.product_id}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Store {selectedRecord.store_id} • {selectedRecord.region} Region • {selectedRecord.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans uppercase">Units Sold</span>
                <p className="text-lg font-bold text-white mt-0.5">{selectedRecord.units_sold.toLocaleString()} units</p>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans uppercase">Realized Revenue</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">${selectedRecord.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans uppercase">Inventory on Hand</span>
                <p className="text-lg font-bold text-teal-300 mt-0.5">{selectedRecord.inventory_level.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans uppercase">Demand Forecast</span>
                <p className="text-lg font-bold text-indigo-300 mt-0.5">{selectedRecord.demand_forecast.toFixed(1)}</p>
              </div>
            </div>

            {/* Environmental & Context Attributes */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Department Category:</span>
                <span className="font-bold text-white">{selectedRecord.category}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Unit Retail Price:</span>
                <span className="font-bold text-white font-mono">${selectedRecord.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Discount Applied:</span>
                <span className="font-bold text-purple-300 font-mono">{selectedRecord.discount}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Climate & Weather:</span>
                <span className="font-bold text-sky-300">{selectedRecord.weather_condition} ({selectedRecord.seasonality})</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Holiday Promotion:</span>
                <span className={`font-bold font-mono ${selectedRecord.holiday_promotion === 1 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {selectedRecord.holiday_promotion === 1 ? 'PROMOTION ACTIVE (1)' : 'STANDARD (0)'}
                </span>
              </div>
            </div>

            {/* AI Action Trigger */}
            {onAskAi && (
              <button
                type="button"
                onClick={() => {
                  const q = `Deep dive audit for SKU ${selectedRecord.product_id} at Store ${selectedRecord.store_id} in ${selectedRecord.region}: analyze historical velocity, price elasticity at $${selectedRecord.price.toFixed(2)}, and stockout buffer.`;
                  setSelectedRecord(null);
                  onAskAi(q);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold shadow-glow-teal hover:from-teal-400 hover:to-cyan-500 transition-all active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>Ask AI Copilot to Audit This SKU</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
