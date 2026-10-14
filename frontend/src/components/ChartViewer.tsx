import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface ChartViewerProps {
  data: Array<Record<string, any>>;
}

const NEON_PALETTE = ['#2dd4bf', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#f43f5e'];

export const ChartViewer: React.FC<ChartViewerProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!data || data.length < 2) {
    return null; // A single scalar (like total sum 1 row) doesn't need a chart
  }

  // Detect keys
  const keys = Object.keys(data[0]);

  // Find categorical dimension (first string/date column)
  const categoryKey = keys.find((k) => {
    const val = data[0][k];
    return typeof val === 'string' || k.includes('date') || k.includes('month') || k.includes('id') || k.includes('region') || k.includes('category');
  }) || keys[0];

  // Find numeric metric keys
  const metricKeys = keys.filter((k) => {
    if (k === categoryKey) return false;
    const val = data[0][k];
    return typeof val === 'number' || (!isNaN(Number(val)) && val !== null && val !== '');
  });

  if (metricKeys.length === 0) {
    return null;
  }

  // Set default chart type: Pie chart if <= 8 items and single metric; otherwise Bar chart
  const defaultChartType: 'pie' | 'bar' = data.length <= 8 && metricKeys.length === 1 ? 'pie' : 'bar';
  const [chartType, setChartType] = useState<'pie' | 'bar'>(defaultChartType);

  // Clean data for Recharts (parse numbers)
  const chartData = data.map((row) => {
    const item: Record<string, any> = { ...row };
    metricKeys.forEach((m) => {
      item[m] = Number(row[m]) || 0;
    });
    // Format label if it's too long
    if (item[categoryKey] && typeof item[categoryKey] === 'string' && item[categoryKey].length > 18) {
      item[`${categoryKey}_display`] = item[categoryKey].substring(0, 16) + '...';
    } else {
      item[`${categoryKey}_display`] = item[categoryKey];
    }
    return item;
  });

  const primaryMetric = metricKeys[0];

  return (
    <div className="mt-2.5 rounded-xl border border-obsidian-800 bg-obsidian-900/90 overflow-hidden shadow-xl">
      {/* Header with Type Switcher */}
      <div className="px-3.5 py-2.5 bg-obsidian-900/95 border-b border-obsidian-800 flex items-center justify-between select-none">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition"
        >
          <div className="p-1 rounded-md bg-teal-500/15 border border-teal-500/25 text-teal-400">
            {chartType === 'pie' ? <PieIcon className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-semibold tracking-tight text-white">
            Interactive Visual Insights
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            ({chartData.length} records)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Switchers: Pie Chart and Bar Chart */}
          <div className="inline-flex rounded-lg border border-obsidian-750 bg-obsidian-950 p-0.5">
            <button
              onClick={() => setChartType('pie')}
              title="Pie Chart"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                chartType === 'pie'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Pie</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Bar Chart"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                chartType === 'bar'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded transition ml-1"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {isOpen && (
        <div className="p-4 pt-5 bg-obsidian-950/70">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0a0f1d', 
                      borderRadius: '12px', 
                      border: '1px solid #1e293b', 
                      color: '#f8fafc', 
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(val: any) => {
                      const total = chartData.reduce((acc, curr) => acc + (Number(curr[primaryMetric]) || 0), 0);
                      const numericVal = Number(val) || 0;
                      const pct = total > 0 ? ((numericVal / total) * 100).toFixed(2) : '0.00';
                      return [`${numericVal.toLocaleString()} (${pct}%)`, primaryMetric.replace(/_/g, ' ')];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#94a3b8' }} />
                  <Pie
                    data={chartData}
                    dataKey={primaryMetric}
                    nameKey={categoryKey}
                    cx="50%"
                    cy="48%"
                    outerRadius={85}
                    innerRadius={38}
                    paddingAngle={3}
                    label={({ percent }) => (percent !== undefined ? `${(percent * 100).toFixed(1)}%` : '')}
                    labelLine={false}
                  >
                    {chartData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={NEON_PALETTE[index % NEON_PALETTE.length]} 
                        stroke="#0a0f1d"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey={`${categoryKey}_display`}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    interval={0}
                    angle={chartData.length > 5 ? -25 : 0}
                    textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0a0f1d', 
                      borderRadius: '12px', 
                      border: '1px solid #1e293b', 
                      color: '#f8fafc', 
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(val: any) => [Number(val).toLocaleString(), '']}
                  />
                  {metricKeys.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#94a3b8' }} />}
                  {metricKeys.map((metric, idx) => (
                    <Bar
                      key={metric}
                      dataKey={metric}
                      name={metric.replace(/_/g, ' ')}
                      fill={NEON_PALETTE[idx % NEON_PALETTE.length]}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
