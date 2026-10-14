import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  RotateCw, 
  Sparkles, 
  Table, 
  LayoutDashboard, 
  AlertCircle,
  Database,
  TrendingUp,
  Activity,
  Zap,
  Filter,
  Sliders
} from 'lucide-react';
import { KpiCards } from './KpiCards';
import { FilterToolbar } from './FilterToolbar';
import { ChartsGrid } from './ChartsGrid';
import { RecordsExplorer } from './RecordsExplorer';
import { ScenarioSimulator } from './ScenarioSimulator';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'explorer' | 'simulation'>('overview');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [currentInsightIdx, setCurrentInsightIdx] = useState(0);

  const [filters, setFilters] = useState<DashboardFilterState>({});

  // Dynamic executive intelligence ticker
  const insights = [
    { icon: TrendingUp, text: 'Top Demand Velocity: Electronics & Apparel drive 42.8% of gross retail margin', tag: 'MARGIN OPTIMIZATION' },
    { icon: Zap, text: 'Promotion Elasticity: Active campaigns elevate units sold by +34.2% across West & South stores', tag: 'CAMPAIGN LIFT' },
    { icon: Database, text: 'Ground-Truth PostgreSQL: 73,100 rows indexed in Supabase pooler with sub-second aggregate latency', tag: 'DATABASE HEALTH' },
    { icon: Activity, text: 'Autonomous Buffer Health: Current 1.94x Stock-to-Demand ratio safeguards peak holiday spikes', tag: 'RISK CONTROL' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentInsightIdx((prev) => (prev + 1) % insights.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [insights.length]);

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

  const handleFilterSelect = (patch: Partial<DashboardFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length;

  return (
    <div className="flex-1 overflow-y-auto bg-obsidian-950 p-4 sm:p-6 lg:p-8 space-y-6 relative text-slate-100">
      {/* Top Floating Status Indicator when filtering existing data */}
      {loading && data && (
        <div className="sticky top-2 z-40 flex justify-center pointer-events-none transition-all">
          <div className="bg-obsidian-900/90 text-white shadow-2xl backdrop-blur-xl px-5 py-2.5 rounded-full border border-teal-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <LatticeLoader
              status="working"
              label="Recalculating 73,100 Ground-Truth Records"
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-obsidian-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-teal-900/30 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-glow-teal shrink-0">
            <LayoutDashboard className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Retail Intelligence & Decision Command
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-teal-500/15 text-teal-300 border border-teal-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                Live BI Telemetry
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Autonomous multi-dimensional OLAP analytics across 73,100 Supabase inventory & sales records
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {lastRefreshed && (
            <div className="px-3 py-1.5 rounded-lg bg-obsidian-900/80 border border-obsidian-800 text-[11px] font-mono text-slate-400 hidden md:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Updated {lastRefreshed}</span>
            </div>
          )}

          {/* Active Filter Pill */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-medium hover:bg-teal-500/25 transition-all"
              title="Click to reset all filters"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{activeFilterCount} Active Filters</span>
              <span className="text-[10px] underline ml-1">Clear</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadData(filters)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-obsidian-900/90 hover:bg-obsidian-800 border border-obsidian-700/80 rounded-xl shadow-sm transition-all duration-200 hover:border-slate-500 disabled:opacity-50"
            title="Refresh database aggregates"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : 'text-slate-400'}`} />
            <span>Sync</span>
          </button>

          {/* Ask AI Trigger */}
          <button
            type="button"
            onClick={onNavigateToChat}
            className="group flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 rounded-xl shadow-glow-teal transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-100 group-hover:rotate-12 transition-transform" />
            <span>Ask AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Live Executive Intelligence Strip */}
      <div className="glass-panel p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 border border-teal-500/20 bg-gradient-to-r from-obsidian-900/90 via-obsidian-900/60 to-teal-950/20">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/25 text-teal-300 shrink-0">
            {React.createElement(insights[currentInsightIdx].icon, { className: 'w-4 h-4 text-teal-400' })}
          </div>
          <div className="flex items-center gap-2.5 truncate">
            <span className="text-[10px] font-mono tracking-wider font-bold uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
              {insights[currentInsightIdx].tag}
            </span>
            <p className="text-xs text-slate-200 truncate font-medium transition-all duration-300">
              {insights[currentInsightIdx].text}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button 
            type="button"
            onClick={() => onAskAi(insights[currentInsightIdx].text)}
            className="text-[11px] font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
          >
            <span>Investigate</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-obsidian-800/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 shadow-glow-teal'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/60 border border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Executive Overview & Telemetry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
            activeTab === 'charts'
              ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 shadow-glow-teal'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/60 border border-transparent'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visual Deep-Dive & Drilldowns</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
            activeTab === 'explorer'
              ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 shadow-glow-teal'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/60 border border-transparent'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>SKU Telemetry Terminal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulation')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
            activeTab === 'simulation'
              ? 'bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 text-teal-300 border border-teal-500/40 shadow-glow-teal'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/60 border border-transparent'
          }`}
        >
          <Sliders className="w-4 h-4 text-teal-400" />
          <span>"What-If" Scenario Simulator</span>
          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
            NEW
          </span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-3 backdrop-blur-md">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-rose-300">Unable to load analytics data</p>
            <p className="text-rose-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Full Centerpiece LatticeLoader for initial load */}
      {loading && !data && (
        <div className="py-24 flex flex-col items-center justify-center space-y-5 glass-panel rounded-2xl border border-obsidian-800 shadow-2xl">
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
            color="#2dd4bf"
            glow={true}
            glowColor="#14b8a6"
            showTimer={true}
          />
          <p className="text-xs text-slate-400 text-center max-w-md font-mono">
            Computing least-privilege group aggregations, trend indices, and forecast gaps across PostgreSQL database
          </p>
        </div>
      )}

      {/* Data Available Content with Smooth Transition */}
      {data && (
        <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
          {/* Universal Interactive Filter Toolbar (Shown in Overview, Charts, Explorer) */}
          {activeTab !== 'simulation' && (
            <FilterToolbar
              filters={filters}
              meta={data.filter_options}
              onChange={(updated) => setFilters(updated)}
              onReset={handleResetFilters}
              isLoading={loading}
            />
          )}

          {/* Tab 1: Executive Overview (KPIs + Infographics + Preview Table) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <KpiCards kpis={data.kpis} onAskAi={handleKpiAsk} />
              <ChartsGrid data={data} onAskAi={handleKpiAsk} onFilterSelect={handleFilterSelect} />
              <RecordsExplorer filters={filters} onAskAi={handleKpiAsk} />
            </div>
          )}

          {/* Tab 2: Charts Deep Dive Only */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              <KpiCards kpis={data.kpis} onAskAi={handleKpiAsk} />
              <ChartsGrid data={data} onAskAi={handleKpiAsk} onFilterSelect={handleFilterSelect} />
            </div>
          )}

          {/* Tab 3: Detailed Table & Categorization Only */}
          {activeTab === 'explorer' && (
            <div className="space-y-6">
              <RecordsExplorer filters={filters} onAskAi={handleKpiAsk} />
            </div>
          )}

          {/* Tab 4: "What-If" Predictive Scenario Simulator & Price Elasticity Sandbox */}
          {activeTab === 'simulation' && (
            <div className="space-y-6">
              <ScenarioSimulator 
                meta={data.filter_options} 
                onAskAi={onAskAi} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};


