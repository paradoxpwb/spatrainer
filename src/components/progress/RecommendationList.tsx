import React from 'react';
import { PracticeRecommendation } from '../../types/progress';
import { Compass, ArrowRight, Lightbulb } from 'lucide-react';

interface RecommendationListProps {
  recommendations: PracticeRecommendation[];
  onTriggerRecommendation: (rec: PracticeRecommendation) => void;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  recommendations,
  onTriggerRecommendation,
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Compass className="w-5 h-5 text-blue-600" aria-hidden="true" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            다음 연습 맞춤 추천 (Next Recommendations)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            최근 발화 지표와 미연습 영역을 기반으로 추천하는 다음 액션입니다. (최대 3개)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-100 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-2">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span>추천 #{rec.priority}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">{rec.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{rec.reason}</p>
            </div>

            <div className="pt-4 mt-3 border-t border-blue-100/60">
              <button
                type="button"
                onClick={() => onTriggerRecommendation(rec)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors min-h-[44px]"
              >
                <span>{rec.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400">
        * 본 제안은 기기 저장 기록에 기초한 맞춤 연습 가이드이며 공식 약점 진단 시험 결과가 아닙니다.
      </p>
    </div>
  );
};
