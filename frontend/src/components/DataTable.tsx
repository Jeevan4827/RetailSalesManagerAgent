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
    if (val === null || val === undefined) return <span className="text-slate-400 italic">null</span>;
    if (typeof val === 'number') {
      return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2);
    }
    if (typeof val === 'boolean') {
      return val ? 'true' : 'false';
    }
    return String(val);
  };

  return (
    <div className="mt-2 rounded-lg border border-slate-200/90 bg-white overflow-hidden text-xs shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-slate-700 bg-slate-50/70 hover:bg-slate-100/70 transition font-medium select-none"
      >
        <div className="flex items-center gap-1.5 text-slate-600">
          <Table className="w-3.5 h-3.5 text-teal-600" />
          <span>View Data ({data.length} {data.length === 1 ? 'row' : 'rows'})</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 max-h-64 overflow-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-100/80 sticky top-0">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-1.5 whitespace-nowrap text-slate-700 font-mono text-[11px]">
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
