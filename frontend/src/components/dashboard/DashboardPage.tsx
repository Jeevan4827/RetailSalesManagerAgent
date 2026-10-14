import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  RotateCw, 
  Sparkles, 
  Table, 
  LayoutDashboard, 
  AlertCircle
} from 'lucide-react';
import { KpiCards } from './KpiCards';
import { FilterToolbar } from './FilterToolbar';
import { ChartsGrid } from './ChartsGrid';
import { RecordsExplorer } from './RecordsExplorer';
import { fetchDashboardAnalytics } from '../../services/api';
import { LatticeLoader } from '../LatticeLoader';
import type { DashboardAnalyticsData, DashboardFilterState } from '../../types/analytics';

interface DashboardPageProps {
  onAskAi: (question: string) => void;
  onNavigateToChat: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onAskAi, onNavigateToChat }) => {
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'explorer'>('overview');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const [filters, setFilters] = useState<DashboardFilterState>({});

  const loadData = async (currentFilters: DashboardFilterState = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboardAnalytics(currentFilters);
      setData(res);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('Failed to load dashboard analytics:', err);
      setError(err?.message || 'Failed to load executive analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filters);
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleKpiAsk = (prompt: string) => {
    onAskAi(prompt);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 lg:p-8 space-y-6 relative">
      {/* Top Floating Status Indicator when filtering existing data */}
      {loading && data && (
        <div className="sticky top-2 z-40 flex justify-center pointer-events-none transition-all">
          <div className="bg-slate-900/90 text-white shadow-xl backdrop-blur-md px-4 py-2 rounded-full border border-teal-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <LatticeLoader
              status="working"
              label="Segmenting 73,100 Records"
              doneLabel="Updated in"
              pattern="orbit"
              grid={3}
              shape="round"
              cellSize={5}
              gap={2}
              fontSize={12}
              color="#2dd4bf"
              glow={true}
              glowColor="#2dd4bf"
              showTimer={true}
            />
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-teal-700 text-white shadow-xs">
              <LayoutDashboard className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Retail Intelligence & Sales Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Ground-truth executive telemetry across 73,100 Supabase inventory & sales records
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lastRefreshed && (
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Updated {lastRefreshed}
            </span>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadData(filters)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            title="Refresh database aggregates"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          {/* Ask AI Trigger */}
          <button
            type="button"
            onClick={onNavigateToChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>Ask AI Copilot</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'overview'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Executive Overview & Infographics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'charts'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Charts Deep-Dive</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'explorer'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Data Records Explorer</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold">Unable to load analytics data</p>
            <p className="text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Full Centerpiece LatticeLoader for initial load */}
      {loading && !data && (
        <div className="py-24 flex flex-col items-center justify-center space-y-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-xs">
          <LatticeLoader
            status="working"
            label="Analyzing 73,100 Inventory Records"
            doneLabel="Loaded in"
            pattern="orbit"
            grid={4}
            shape="round"
            cellSize={8}
            gap={3}
            fontSize={15}
            color="#0d9488"
            glow={true}
            glowColor="#14b8a6"
            showTimer={true}
          />
          <p className="text-xs text-slate-500 text-center max-w-md">
            Computing least-privilege group aggregations, trend indices, and forecast gaps across PostgreSQL database
          </p>
        </div>
      )}

      {/* Data Available Content with Smooth Transition */}
      {data && (
        <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
          {/* Universal Interactive Filter Toolbar */}
          <FilterToolbar
            filters={filters}
            meta={data.filter_options}
            onChange={(updated) => setFilters(updated)}
            onReset={handleResetFilters}
            isLoading={loading}
          />

          {/* Tab 1: Executive Overview (KPIs + Infographics + Preview Table) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <KpiCards kpis={data.kpis} onAskAi={handleKpiAsk} />
              <ChartsGrid data={data} onAskAi={handleKpiAsk} />
              <RecordsExplorer filters={filters} onAskAi={handleKpiAsk} />
            </div>
          )}

          {/* Tab 2: Charts Deep Dive Only */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              <KpiCards kpis={data.kpis} onAskAi={handleKpiAsk} />
              <ChartsGrid data={data} onAskAi={handleKpiAsk} />
            </div>
          )}

          {/* Tab 3: Detailed Table & Categorization Only */}
          {activeTab === 'explorer' && (
            <div className="space-y-6">
              <RecordsExplorer filters={filters} onAskAi={handleKpiAsk} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

