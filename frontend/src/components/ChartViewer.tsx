import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface ChartViewerProps {
  data: Array<Record<string, any>>;
}

const PALETTE = ['#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#f43f5e', '#14b8a6', '#3b82f6'];

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
    <div className="mt-2.5 rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
      {/* Header with Type Switcher */}
      <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between select-none">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 transition"
        >
          <div className="p-1 rounded-md bg-teal-50 text-teal-700">
            {chartType === 'pie' ? <PieIcon className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-semibold tracking-tight text-slate-800">
            Interactive Visual Insights
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            ({chartData.length} data points)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Switchers: Pie Chart and Bar Chart */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setChartType('pie')}
              title="Pie Chart"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition ${
                chartType === 'pie'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Pie</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Bar Chart"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition ${
                chartType === 'bar'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition ml-1"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {isOpen && (
        <div className="p-4 pt-5 bg-white">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => {
                      const total = chartData.reduce((acc, curr) => acc + (Number(curr[primaryMetric]) || 0), 0);
                      const numericVal = Number(val) || 0;
                      const pct = total > 0 ? ((numericVal / total) * 100).toFixed(2) : '0.00';
                      return [`${numericVal.toLocaleString()} (${pct}%)`, primaryMetric.replace(/_/g, ' ')];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Pie
                    data={chartData}
                    dataKey={primaryMetric}
                    nameKey={categoryKey}
                    cx="50%"
                    cy="48%"
                    outerRadius={85}
                    innerRadius={35}
                    paddingAngle={2}
                    label={({ percent }) => (percent !== undefined ? `${(percent * 100).toFixed(2)}%` : '')}
                    labelLine={false}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey={`${categoryKey}_display`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    interval={0}
                    angle={chartData.length > 5 ? -25 : 0}
                    textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [Number(val).toLocaleString(), '']}
                  />
                  {metricKeys.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />}
                  {metricKeys.map((metric, idx) => (
                    <Bar
                      key={metric}
                      dataKey={metric}
                      name={metric.replace(/_/g, ' ')}
                      fill={PALETTE[idx % PALETTE.length]}
                      radius={[4, 4, 0, 0]}
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
