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
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm space-y-3 transition-all">
      {/* Top Header Row with Active Count, LatticeLoader, and Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
            <Filter className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-800">
            Interactive Filters & Segmentation
          </span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-600 text-white">
              {activeCount} active
            </span>
          )}

          {/* React Bits LatticeLoader animation indicator */}
          <div className="ml-2 pl-3 border-l border-slate-200 flex items-center">
            <LatticeLoader
              status={isLoading ? 'working' : 'done'}
              label="Segmenting"
              doneLabel="Updated in"
              errorLabel="Failed in"
              pattern="orbit"
              grid={3}
              shape="round"
              cellSize={5}
              gap={2}
              fontSize={12}
              color="#0d9488"
              doneColor="#10b981"
              glow={isLoading}
              glowColor="#14b8a6"
              showTimer={true}
            />
          </div>
        </div>


        {/* Quick Filter Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              activeCount === 0
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Records
          </button>
          <button
            type="button"
            onClick={() => applyPreset('2023')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              filters.start_date === '2023-01-01' && filters.end_date === '2023-12-31'
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Year 2023
          </button>
          <button
            type="button"
            onClick={() => applyPreset('electronics')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              filters.category === 'Electronics'
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Electronics Focus
          </button>
          <button
            type="button"
            onClick={() => applyPreset('promo')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              filters.holiday_promotion === 1
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Holiday Promotions
          </button>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              disabled={isLoading}
              className="ml-2 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdown Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-slate-400" />
            Category
          </label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleSelect('category', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-colors"
          >
            <option value="all">All Categories</option>
            {meta.categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            Region
          </label>
          <select
            value={filters.region || 'all'}
            onChange={(e) => handleSelect('region', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-colors"
          >
            <option value="all">All Regions</option>
            {meta.regions.map((reg) => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>

        {/* Weather Condition */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <CloudSun className="w-3 h-3 text-slate-400" />
            Weather
          </label>
          <select
            value={filters.weather || 'all'}
            onChange={(e) => handleSelect('weather', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-colors"
          >
            <option value="all">All Weather</option>
            {meta.weather_conditions.map((wc) => (
              <option key={wc} value={wc}>{wc}</option>
            ))}
          </select>
        </div>

        {/* Seasonality */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <SunMedium className="w-3 h-3 text-slate-400" />
            Season
          </label>
          <select
            value={filters.seasonality || 'all'}
            onChange={(e) => handleSelect('seasonality', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-colors"
          >
            <option value="all">All Seasons</option>
            {meta.seasonalities.map((season) => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        {/* Promotion Status */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400" />
            Promotion
          </label>
          <select
            value={filters.holiday_promotion === undefined || filters.holiday_promotion === null ? 'all' : String(filters.holiday_promotion)}
            onChange={(e) => {
              const val = e.target.value;
              handleSelect('holiday_promotion', val === 'all' ? undefined : Number(val));
            }}
            disabled={isLoading}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-colors"
          >
            <option value="all">All Days</option>
            <option value="1">Holiday Promotion Active</option>
            <option value="0">Standard Non-Promo</option>
          </select>
        </div>

        {/* Date Range Start & End */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Date Period
          </label>
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={filters.start_date || ''}
              min={meta.date_range.min_date}
              max={meta.date_range.max_date}
              onChange={(e) => handleSelect('start_date', e.target.value)}
              disabled={isLoading}
              title="Start Date"
              className="w-1/2 text-[10px] bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
            <input
              type="date"
              value={filters.end_date || ''}
              min={meta.date_range.min_date}
              max={meta.date_range.max_date}
              onChange={(e) => handleSelect('end_date', e.target.value)}
              disabled={isLoading}
              title="End Date"
              className="w-1/2 text-[10px] bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
