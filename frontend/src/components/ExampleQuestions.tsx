import React from 'react';
import { TrendingUp, ShoppingBag, MapPin, Boxes, ArrowUpRight, BarChart3 } from 'lucide-react';

export const EXAMPLE_QUESTIONS = [
  {
    icon: TrendingUp,
    category: 'Sales Analysis',
    text: 'Which five products sold the most units?'
  },
  {
    icon: MapPin,
    category: 'Geographic Insights',
    text: 'Which region has the highest sales?'
  },
  {
    icon: Boxes,
    category: 'Inventory Level',
    text: 'What is the average inventory level?'
  },
  {
    icon: BarChart3,
    category: 'Forecasting',
    text: 'How do actual sales compare with demand forecasts?'
  },
  {
    icon: ShoppingBag,
    category: 'Stock Replenishment',
    text: 'Which products have the lowest inventory?'
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
      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-sm mb-4">
        <BarChart3 className="w-6 h-6" />
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
        Your Retail Intelligence Assistant
      </h2>
      <p className="mt-2 text-sm text-slate-500 max-w-lg leading-relaxed">
        Ask questions about sales, inventory, products, and demand. Get insights directly from your retail data.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {EXAMPLE_QUESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectQuestion(item.text)}
              disabled={disabled}
              className="group p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-teal-500/60 hover:shadow-sm transition flex items-start gap-3 text-left disabled:opacity-50"
            >
              <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700 transition shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider mb-0.5">
                  {item.category}
                </div>
                <div className="text-xs font-medium text-slate-800 line-clamp-2 group-hover:text-teal-900">
                  {item.text}
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 transition shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
