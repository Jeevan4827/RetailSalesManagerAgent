import React from 'react';
import { TrendingUp, ShoppingBag, MapPin, Boxes, ArrowUpRight, BarChart3, Sparkles } from 'lucide-react';

export const EXAMPLE_QUESTIONS = [
  {
    icon: TrendingUp,
    category: 'Sales Analytics',
    text: 'Which five products sold the most units?'
  },
  {
    icon: MapPin,
    category: 'Regional Telemetry',
    text: 'Which region has the highest sales?'
  },
  {
    icon: Boxes,
    category: 'Inventory Buffers',
    text: 'What is the average inventory level across stores?'
  },
  {
    icon: BarChart3,
    category: 'Demand Forecasting',
    text: 'How do actual sales compare with demand forecasts?'
  },
  {
    icon: ShoppingBag,
    category: 'Replenishment Risk',
    text: 'Which products have the lowest inventory levels?'
  }
];

interface ExampleQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export const ExampleQuestions: React.FC<ExampleQuestionsProps> = ({
  onSelectQuestion,
  disabled
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 max-w-3xl mx-auto text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-teal-900/30 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-glow-teal mb-4.5 animate-pulse-subtle">
        <Sparkles className="w-7 h-7 text-teal-300" />
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
        <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-teal-400">
          Natural Language Analytical Interface
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
        Autonomous Retail Intelligence Copilot
      </h2>
      <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
        Query real-time sales, inventory safety stock, seasonal demand forecasts, and regional variance across 73,100 Supabase records.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {EXAMPLE_QUESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectQuestion(item.text)}
              disabled={disabled}
              className="group p-4 rounded-2xl glass-panel border border-obsidian-800 bg-obsidian-900/70 hover:border-teal-500/50 hover:bg-obsidian-850 hover:shadow-glow-teal transition-all duration-200 flex items-start gap-3.5 text-left disabled:opacity-50"
            >
              <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-obsidian-800 text-teal-400 group-hover:border-teal-500/40 group-hover:text-teal-300 transition-colors shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider mb-1">
                  {item.category}
                </div>
                <div className="text-xs font-medium text-slate-200 line-clamp-2 group-hover:text-white transition-colors">
                  {item.text}
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors shrink-0 mt-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
