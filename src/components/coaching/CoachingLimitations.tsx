import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FeedbackLanguage } from '../../types/coaching';

interface CoachingLimitationsProps {
  limitations?: string[];
  language?: FeedbackLanguage;
}

export const CoachingLimitations: React.FC<CoachingLimitationsProps> = ({
  limitations = [],
  language = 'ko',
}) => {
  const isEn = language === 'en';

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs leading-relaxed space-y-2">
      <div className="flex items-center gap-2 font-bold text-slate-700">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
        <span>{isEn ? 'AI Coaching Notice & Limitations' : 'AI 코칭 한계 및 주의 안내'}</span>
      </div>

      <p>
        {isEn
          ? 'This feedback is AI practice coaching generated solely from your question and transcript. It does NOT evaluate pronunciation, accent, audio delivery, voice confidence, or official SPA scores/grades. Transcript inaccuracies may affect feedback quality.'
          : '이 피드백은 질문과 Transcript를 기반으로 생성된 연습용 AI 코칭입니다. 발음, 억양, 실제 음성 전달력 및 공식 SPA 등급은 평가하지 않습니다. 음성 인식 오류가 있으면 피드백도 달라질 수 있으므로 Transcript를 먼저 확인하세요.'}
      </p>

      {limitations.length > 0 && (
        <ul className="list-disc list-inside text-slate-500 pt-1 space-y-0.5">
          {limitations.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
