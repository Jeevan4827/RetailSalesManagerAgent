import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  PackageCheck, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2,
  Calendar,
  Percent,
  Play,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { runScenarioSimulation } from '../../services/api';
import { LatticeLoader } from '../LatticeLoader';
import type { 
  FilterOptionsMeta, 
  ScenarioSimulationResult, 
  ScenarioSimulationRequestParams 
} from '../../types/analytics';

interface ScenarioSimulatorProps {
  meta?: FilterOptionsMeta;
  onAskAi: (prompt: string) => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ meta, onAskAi }) => {
  const [params, setParams] = useState<ScenarioSimulationRequestParams>({
    category: 'All',
    region: 'All',
    price_change_pct: -10,
    demand_shock_pct: 20,
    target_weather: 'Sunny',
    competitor_discount_pct: 0,
    is_holiday_mode: true,
  });

  const [result, setResult] = useState<ScenarioSimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const executeSimulation = async (simParams: ScenarioSimulationRequestParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const data = await runScenarioSimulation(simParams);
      setResult(data);
    } catch (err: any) {
      console.error('Failed to run simulation:', err);
      setError(err?.message || 'Simulation execution failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSimulation(params);
  }, []);

  const handleSliderChange = (key: keyof ScenarioSimulationRequestParams, value: any) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    const defaultParams: ScenarioSimulationRequestParams = {
      category: 'All',
      region: 'All',
      price_change_pct: 0,
      demand_shock_pct: 0,
      target_weather: 'Baseline',
      competitor_discount_pct: 0,
      is_holiday_mode: false,
    };
    setParams(defaultParams);
    executeSimulation(defaultParams);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  };

  const categories = meta?.categories || ['All', 'Clothing', 'Electronics', 'Furniture', 'Groceries', 'Toys'];
  const regions = meta?.regions || ['All', 'East', 'North', 'South', 'West'];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner Header */}
      <div className="glass-panel p-5 rounded-2xl border border-teal-500/25 bg-gradient-to-r from-obsidian-900/90 via-obsidian-900/60 to-teal-950/20 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-teal-900/30 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-glow-teal shrink-0">
            <Sliders className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                "What-If" Predictive Scenario & Price Elasticity Sandbox
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-teal-500/15 text-teal-300 border border-teal-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                Monte Carlo Elasticity Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Simulate price shifts, promotional campaigns, demand shocks, and stockout vulnerabilities before committing capital
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-obsidian-900/90 hover:bg-obsidian-800 border border-obsidian-750 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>

          <button
            type="button"
            onClick={() => executeSimulation(params)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 rounded-xl shadow-glow-teal transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Recalculate Scenario</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-3 backdrop-blur-md">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-rose-300">Simulation Error</p>
            <p className="text-rose-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Control Grid */}
      <div className="glass-panel p-5 rounded-2xl border border-obsidian-800 bg-obsidian-900/70 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Simulation Hypothesis Parameters
            </h3>
          </div>
          {result && (
            <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
              Category Elasticity: ε = {result.elasticity_coefficient.toFixed(2)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Target Category</span>
            </label>
            <select
              value={params.category}
              onChange={(e) => handleSliderChange('category', e.target.value)}
              className="w-full bg-obsidian-950 border border-obsidian-750 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:border-teal-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-obsidian-900 text-slate-200">
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Target Region */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Target Region</span>
            </label>
            <select
              value={params.region}
              onChange={(e) => handleSliderChange('region', e.target.value)}
              className="w-full bg-obsidian-950 border border-obsidian-750 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:border-teal-500 focus:outline-none"
            >
              {regions.map((r) => (
                <option key={r} value={r} className="bg-obsidian-900 text-slate-200">
                  {r === 'All' ? 'All Regions' : `${r} Region`}
                </option>
              ))}
            </select>
          </div>

          {/* Weather Condition */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Simulated Weather</span>
            </label>
            <select
              value={params.target_weather}
              onChange={(e) => handleSliderChange('target_weather', e.target.value)}
              className="w-full bg-obsidian-950 border border-obsidian-750 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:border-teal-500 focus:outline-none"
            >
              <option value="Baseline" className="bg-obsidian-900">Normal Baseline Weather</option>
              <option value="Sunny" className="bg-obsidian-900">Sunny (+6% Store Footfall)</option>
              <option value="Rainy" className="bg-obsidian-900">Rainy (-7% Store Footfall)</option>
              <option value="Snowy" className="bg-obsidian-900">Snowy (-13% Store Footfall)</option>
              <option value="Cloudy" className="bg-obsidian-900">Cloudy (Neutral)</option>
            </select>
          </div>

          {/* Holiday Promotion Toggle */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Holiday Campaign</span>
            </label>
            <button
              type="button"
              onClick={() => handleSliderChange('is_holiday_mode', !params.is_holiday_mode)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                params.is_holiday_mode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-glow-amber'
                  : 'bg-obsidian-950 border-obsidian-750 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{params.is_holiday_mode ? 'Holiday Rush (+25% Lift Active)' : 'Standard Operating Day'}</span>
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Price Adjustment Slider */}
          <div className="space-y-2.5 p-4 rounded-xl bg-obsidian-950/60 border border-obsidian-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-semibold text-slate-200">Price / Discount Shift</span>
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                params.price_change_pct < 0 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                  : params.price_change_pct > 0 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-obsidian-800 text-slate-400 border-obsidian-700'
              }`}>
                {params.price_change_pct > 0 ? `+${params.price_change_pct}%` : `${params.price_change_pct}%`}
              </span>
            </div>

            <input
              type="range"
              min="-40"
              max="40"
              step="1"
              value={params.price_change_pct}
              onChange={(e) => handleSliderChange('price_change_pct', parseFloat(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>-40% (Clearance)</span>
              <span>0% (Baseline)</span>
              <span>+40% (Premium)</span>
            </div>

            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              {[-20, -10, 0, 10, 20].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleSliderChange('price_change_pct', v)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                    params.price_change_pct === v
                      ? 'bg-teal-500/30 text-teal-300 border-teal-500/50'
                      : 'bg-obsidian-900 border-obsidian-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v > 0 ? `+${v}%` : `${v}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Demand Shock Slider */}
          <div className="space-y-2.5 p-4 rounded-xl bg-obsidian-950/60 border border-obsidian-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">Market Demand Shock</span>
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                params.demand_shock_pct > 0 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                  : params.demand_shock_pct < 0 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                    : 'bg-obsidian-800 text-slate-400 border-obsidian-700'
              }`}>
                {params.demand_shock_pct > 0 ? `+${params.demand_shock_pct}%` : `${params.demand_shock_pct}%`}
              </span>
            </div>

            <input
              type="range"
              min="-40"
              max="80"
              step="5"
              value={params.demand_shock_pct}
              onChange={(e) => handleSliderChange('demand_shock_pct', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>-40% (Recession)</span>
              <span>0% (Expected)</span>
              <span>+80% (Viral Surge)</span>
            </div>

            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              {[-20, 0, 20, 40, 60].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleSliderChange('demand_shock_pct', v)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                    params.demand_shock_pct === v
                      ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500/50'
                      : 'bg-obsidian-900 border-obsidian-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v > 0 ? `+${v}%` : `${v}%`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay State */}
      {loading && !result && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 glass-panel rounded-2xl border border-obsidian-800">
          <LatticeLoader
            status="working"
            label="Simulating Market Elasticity across 73,100 Records"
            doneLabel="Simulated in"
            pattern="orbit"
            grid={3}
            cellSize={6}
            gap={2}
            fontSize={13}
            color="#2dd4bf"
            glow={true}
            glowColor="#14b8a6"
            showTimer={true}
          />
        </div>
      )}

      {/* Simulation Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Executive KPI Scorecards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Projected Revenue */}
            <div className="glass-panel p-5 rounded-2xl border border-obsidian-800 bg-obsidian-900/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Simulated Gross Revenue</span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  result.revenue_delta >= 0 
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}>
                  {result.revenue_delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{result.revenue_delta_pct > 0 ? `+${result.revenue_delta_pct}%` : `${result.revenue_delta_pct}%`}</span>
                </span>
              </div>
              <div className="mt-2.5 text-2xl font-black text-white font-mono">
                {formatCurrency(result.simulated_revenue)}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Baseline: {formatCurrency(result.baseline_revenue)}</span>
                <span className={result.revenue_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {result.revenue_delta >= 0 ? `+${formatCurrency(result.revenue_delta)}` : formatCurrency(result.revenue_delta)}
                </span>
              </div>
            </div>

            {/* Projected Volume Lift */}
            <div className="glass-panel p-5 rounded-2xl border border-obsidian-800 bg-obsidian-900/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Units Sold Volume</span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  result.units_delta >= 0 
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}>
                  <span>{result.units_delta_pct > 0 ? `+${result.units_delta_pct}%` : `${result.units_delta_pct}%`}</span>
                </span>
              </div>
              <div className="mt-2.5 text-2xl font-black text-white font-mono">
                {result.simulated_units.toLocaleString()}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Baseline: {result.baseline_units.toLocaleString()}</span>
                <span className="text-cyan-400">
                  {result.units_delta >= 0 ? `+${result.units_delta.toLocaleString()} units` : `${result.units_delta.toLocaleString()} units`}
                </span>
              </div>
            </div>

            {/* Stockout Vulnerability Count */}
            <div className={`glass-panel p-5 rounded-2xl border shadow-lg relative overflow-hidden ${
              result.stockout_vulnerable_skus_count > 0 
                ? 'border-rose-500/40 bg-rose-950/20' 
                : 'border-emerald-500/30 bg-emerald-950/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Stockout Risk SKUs</span>
                {result.stockout_vulnerable_skus_count > 0 ? (
                  <span className="p-1 rounded-md bg-rose-500/20 text-rose-400 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className={`mt-2.5 text-2xl font-black font-mono ${
                result.stockout_vulnerable_skus_count > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {result.stockout_vulnerable_skus_count} SKUs
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">
                  {result.stockout_vulnerable_skus_count > 0 ? 'Deficit Shortfall Loss:' : 'Safety Buffers:'}
                </span>
                <span className={result.stockout_vulnerable_skus_count > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {result.stockout_vulnerable_skus_count > 0 ? `-${formatCurrency(result.estimated_stockout_loss)}` : '100% Protected'}
                </span>
              </div>
            </div>

            {/* Stock-to-Demand Coverage */}
            <div className="glass-panel p-5 rounded-2xl border border-obsidian-800 bg-obsidian-900/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Stock / Demand Buffer</span>
                <span className="p-1 rounded-md bg-teal-500/15 text-teal-400">
                  <PackageCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2.5 text-2xl font-black text-white font-mono">
                {result.simulated_stock_to_demand.toFixed(2)}x
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Baseline: {result.baseline_stock_to_demand.toFixed(2)}x</span>
                <span className={result.simulated_stock_to_demand >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {result.simulated_stock_to_demand >= 1.0 ? 'Adequate Coverage' : 'Critical Buffer Deficit'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Executive Scenario Briefing Strip */}
          <div className="glass-panel p-4 rounded-2xl border border-teal-500/25 bg-gradient-to-r from-teal-950/30 via-obsidian-900 to-obsidian-900 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 shrink-0">
                <Sparkles className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-teal-300">
                  Autonomous Scenario Evaluation
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed mt-0.5">
                  {result.ai_executive_summary}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAskAi(result.suggested_copilot_prompt)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white text-xs font-semibold shadow-glow-teal transition hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-100" />
              <span>Ask AI Copilot to Plan Mitigation &rarr;</span>
            </button>
          </div>

          {/* Charts Row: Price Sensitivity Curve & Category Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Sensitivity Curve (Optimal Revenue Point) */}
            <div className="glass-panel p-5 rounded-2xl border border-obsidian-800 bg-obsidian-900/80 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    Price Elasticity & Revenue Sensitivity Curve
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated revenue across price deltas (-30% to +30%) to find the profit apex
                  </p>
                </div>
              </div>

              <div className="h-64 w-full pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.price_sensitivity_curve}>
                    <defs>
                      <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="price_delta" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0f1d', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Projected Gross Revenue']}
                    />
                    <Area type="monotone" dataKey="projected_revenue" stroke="#2dd4bf" strokeWidth={2.5} fillOpacity={1} fill="url(#curveGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Baseline vs. Simulated Category Breakdown */}
            <div className="glass-panel p-5 rounded-2xl border border-obsidian-800 bg-obsidian-900/80 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    Category Revenue Delta (Baseline vs. Simulated)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comparative category performance under current simulation parameters
                  </p>
                </div>
              </div>

              <div className="h-64 w-full pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.category_comparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0f1d', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any) => [formatCurrency(Number(val)), '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                    <Bar dataKey="baseline_revenue" name="Baseline Revenue" fill="#475569" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="simulated_revenue" name="Simulated Revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* At-Risk SKUs & Replenishment Table */}
          {result.at_risk_skus.length > 0 ? (
            <div className="glass-panel rounded-2xl border border-rose-500/30 bg-obsidian-900/80 shadow-xl overflow-hidden">
              <div className="p-4 sm:p-5 bg-rose-950/30 border-b border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <ShieldAlert className="w-5 h-5 text-rose-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Vulnerable Stockout Products & Emergency Reorder Queue
                    </h3>
                    <p className="text-xs text-rose-300/80">
                      SKUs where simulated demand exceeds current warehouse inventory levels
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 self-start sm:self-auto">
                  {result.at_risk_skus.length} High-Risk Candidates
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-obsidian-800 text-left">
                  <thead className="bg-obsidian-950/80">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Product SKU</th>
                      <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Region</th>
                      <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Current Stock</th>
                      <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Simulated Demand</th>
                      <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Shortfall Deficit</th>
                      <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Lost Revenue</th>
                      <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Recommended PO</th>
                      <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-right">AI Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-obsidian-800/60 font-mono text-xs">
                    {result.at_risk_skus.map((sku, idx) => (
                      <tr key={idx} className="hover:bg-rose-500/5 transition">
                        <td className="px-4 py-3 font-bold text-white">{sku.product_id}</td>
                        <td className="px-4 py-3 text-slate-300 font-sans">{sku.category}</td>
                        <td className="px-4 py-3 text-slate-300 font-sans">{sku.region}</td>
                        <td className="px-4 py-3 text-slate-300">{sku.current_inventory}</td>
                        <td className="px-4 py-3 text-amber-300 font-bold">{sku.simulated_demand}</td>
                        <td className="px-4 py-3 text-rose-400 font-bold">-{sku.shortfall_units}</td>
                        <td className="px-4 py-3 text-rose-300">{formatCurrency(sku.estimated_revenue_loss)}</td>
                        <td className="px-4 py-3 text-emerald-400 font-bold">+{sku.recommended_reorder} units</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onAskAi(`Under our simulated scenario, SKU ${sku.product_id} in ${sku.region} region (${sku.category}) faces a deficit of ${sku.shortfall_units} units with an estimated revenue loss of $${sku.estimated_revenue_loss}. Current stock is ${sku.current_inventory} vs simulated demand of ${sku.simulated_demand}. What emergency restocking and store-transfer strategy do you recommend?`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-sans font-medium text-teal-300 bg-teal-500/15 border border-teal-500/30 hover:bg-teal-500/25 transition"
                          >
                            <Sparkles className="w-3 h-3 text-teal-400" />
                            <span>Inquire</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Full Inventory Resilience Maintained</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Under this simulated scenario, all top products maintain inventory levels sufficient to meet or exceed simulated customer demand.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
