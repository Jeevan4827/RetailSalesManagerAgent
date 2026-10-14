import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  Sparkles, 
  Calendar, 
  CloudSun, 
  MapPin, 
  ShoppingBag, 
  SunMedium, 
  Tag
} from 'lucide-react';
import type { DashboardFilterState, FilterOptionsMeta } from '../../types/analytics';
import { LatticeLoader } from '../LatticeLoader';

interface FilterToolbarProps {
  filters: DashboardFilterState;
  meta: FilterOptionsMeta;
  onChange: (updated: DashboardFilterState) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  meta,
  onChange,
  onReset,
  isLoading
}) => {
  // Compute how many filters are active
  const activeCount = [
    filters.category && filters.category !== 'all',
    filters.region && filters.region !== 'all',
    filters.weather && filters.weather !== 'all',
    filters.seasonality && filters.seasonality !== 'all',
    filters.holiday_promotion !== undefined && filters.holiday_promotion !== null,
    filters.start_date,
    filters.end_date
  ].filter(Boolean).length;

  const handleSelect = (key: keyof DashboardFilterState, value: any) => {
    onChange({
      ...filters,
      [key]: value === 'all' || value === '' ? undefined : value
    });
  };

  const applyPreset = (preset: 'all' | '2023' | 'electronics' | 'promo') => {
    if (preset === 'all') {
      onReset();
    } else if (preset === '2023') {
      onChange({ ...filters, start_date: '2023-01-01', end_date: '2023-12-31' });
    } else if (preset === 'electronics') {
      onChange({ ...filters, category: 'Electronics' });
    } else if (preset === 'promo') {
      onChange({ ...filters, holiday_promotion: 1 });
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 shadow-glass space-y-4 transition-all">
      {/* Top Header Row with Active Count, LatticeLoader, and Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-inner">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                Interactive Multi-Dimensional Slicing
              </span>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 animate-pulse">
                  {activeCount} active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Parameterized SQL segmentation across 73,100 records
            </p>
          </div>

          {/* React Bits LatticeLoader animation indicator */}
          <div className="ml-2 pl-3 border-l border-slate-800 flex items-center">
            <LatticeLoader
              status={isLoading ? 'working' : 'done'}
              label="Segmenting Data"
              doneLabel="Updated in"
              errorLabel="Failed in"
              pattern="orbit"
              grid={3}
              shape="round"
              cellSize={5}
              gap={2}
              fontSize={12}
              color="#2dd4bf"
              doneColor="#10b981"
              glow={isLoading}
              glowColor="#2dd4bf"
              showTimer={true}
            />
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              activeCount === 0
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-transparent shadow-glow-teal'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            All 73.1k
          </button>
          <button
            type="button"
            onClick={() => applyPreset('2023')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              filters.start_date === '2023-01-01' && filters.end_date === '2023-12-31'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-transparent shadow-glow-teal'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Year 2023
          </button>
          <button
            type="button"
            onClick={() => applyPreset('electronics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              filters.category === 'Electronics'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-transparent shadow-glow-teal'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Electronics Focus
          </button>
          <button
            type="button"
            onClick={() => applyPreset('promo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              filters.holiday_promotion === 1
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-transparent shadow-glow-teal'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Holiday Promotions
          </button>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              disabled={isLoading}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/30 transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdown Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-teal-400" />
            Category
          </label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleSelect('category', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors cursor-pointer shadow-inner"
          >
            <option value="all">All Categories</option>
            {meta.categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Region
          </label>
          <select
            value={filters.region || 'all'}
            onChange={(e) => handleSelect('region', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors cursor-pointer shadow-inner"
          >
            <option value="all">All Regions</option>
            {meta.regions.map((reg) => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>

        {/* Weather Condition */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-sky-400" />
            Weather
          </label>
          <select
            value={filters.weather || 'all'}
            onChange={(e) => handleSelect('weather', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors cursor-pointer shadow-inner"
          >
            <option value="all">All Weather</option>
            {meta.weather_conditions.map((wc) => (
              <option key={wc} value={wc}>{wc}</option>
            ))}
          </select>
        </div>

        {/* Seasonality */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
            Season
          </label>
          <select
            value={filters.seasonality || 'all'}
            onChange={(e) => handleSelect('seasonality', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors cursor-pointer shadow-inner"
          >
            <option value="all">All Seasons</option>
            {meta.seasonalities.map((season) => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        {/* Promotion Status */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            Promotion
          </label>
          <select
            value={filters.holiday_promotion === undefined || filters.holiday_promotion === null ? 'all' : String(filters.holiday_promotion)}
            onChange={(e) => {
              const val = e.target.value;
              handleSelect('holiday_promotion', val === 'all' ? undefined : Number(val));
            }}
            disabled={isLoading}
            className="w-full text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors cursor-pointer shadow-inner"
          >
            <option value="all">All Days</option>
            <option value="1">Holiday Promo (Active)</option>
            <option value="0">Standard Non-Promo</option>
          </select>
        </div>

        {/* Date Range Start & End */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Date Period
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filters.start_date || ''}
              min={meta.date_range.min_date}
              max={meta.date_range.max_date}
              onChange={(e) => handleSelect('start_date', e.target.value)}
              disabled={isLoading}
              title="Start Date"
              className="w-1/2 text-[10px] bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 text-white focus:ring-2 focus:ring-teal-400 cursor-pointer shadow-inner"
            />
            <input
              type="date"
              value={filters.end_date || ''}
              min={meta.date_range.min_date}
              max={meta.date_range.max_date}
              onChange={(e) => handleSelect('end_date', e.target.value)}
              disabled={isLoading}
              title="End Date"
              className="w-1/2 text-[10px] bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 text-white focus:ring-2 focus:ring-teal-400 cursor-pointer shadow-inner"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
