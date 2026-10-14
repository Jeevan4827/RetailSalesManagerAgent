import React, { useState } from 'react';
import { Table, ChevronDown, ChevronUp } from 'lucide-react';

interface DataTableProps {
  data: Array<Record<string, any>>;
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!data || data.length === 0) {
    return null;
  }

  const columns = Object.keys(data[0]);

  const formatCellValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-slate-500 italic font-mono">null</span>;
    if (typeof val === 'number') {
      return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2);
    }
    if (typeof val === 'boolean') {
      return val ? 'true' : 'false';
    }
    return String(val);
  };

  return (
    <div className="mt-2.5 rounded-xl border border-obsidian-800 bg-obsidian-900/80 overflow-hidden text-xs shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-300 bg-obsidian-900/90 hover:bg-obsidian-850 transition font-medium select-none"
      >
        <div className="flex items-center gap-2 text-slate-300">
          <div className="p-1 rounded-md bg-teal-500/15 border border-teal-500/25 text-teal-400">
            <Table className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-xs text-white">Record Telemetry</span>
          <span className="text-[10px] font-mono text-slate-400 bg-obsidian-800/80 px-2 py-0.5 rounded border border-obsidian-750">
            {data.length} {data.length === 1 ? 'row' : 'rows'}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-obsidian-800 max-h-64 overflow-auto bg-obsidian-950/70">
          <table className="min-w-full divide-y divide-obsidian-800 text-left">
            <thead className="bg-obsidian-900/95 sticky top-0 backdrop-blur z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3.5 py-2 text-[10px] font-mono font-bold text-teal-300 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800/60 font-mono text-[11px]">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-teal-500/5 transition">
                  {columns.map((col) => (
                    <td key={col} className="px-3.5 py-2 whitespace-nowrap text-slate-300">
                      {formatCellValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
