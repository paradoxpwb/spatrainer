import React from 'react';
import { CategorySelection, QuestionCategory } from '../types/question';
import { Check } from 'lucide-react';

interface CategoryCardProps {
  id: CategorySelection;
  label: string;
  englishLabel: string;
  description: string;
  isSelected: boolean;
  questionCount?: number;
  onSelect: (category: CategorySelection) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  label,
  englishLabel,
  description,
  isSelected,
  questionCount,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      role="radio"
      aria-checked={isSelected}
      className={`group relative text-left w-full p-4 rounded-xl border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-blue-600 ${
        isSelected
          ? 'bg-blue-50/60 border-blue-600 shadow-sm ring-1 ring-blue-600'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <span className="block text-base font-bold text-slate-900 group-hover:text-blue-900">
            {label}
          </span>
          <span className="block text-xs font-medium text-slate-500">
            {englishLabel}
          </span>
        </div>

        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-slate-300 bg-white group-hover:border-slate-400'
          }`}
          aria-hidden="true"
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-2 line-clamp-2">
        {description}
      </p>

      {questionCount !== undefined && (
        <div className="text-[11px] font-medium text-slate-400 tabular-nums">
          {questionCount}개 질문 보유
        </div>
      )}
    </button>
  );
};
