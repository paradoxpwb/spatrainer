import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs text-slate-600">
      <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="leading-relaxed">
        <strong className="font-semibold text-slate-700 block mb-0.5">
          개인정보 및 음성 전송 안내
        </strong>
        <span>
          답변 분석을 선택하면 녹음된 음성이 텍스트 변환을 위해 서버로 전송됩니다. 음성 파일은
          연습 기록에 영구 저장하지 않습니다.
        </span>
      </div>
    </div>
  );
};
