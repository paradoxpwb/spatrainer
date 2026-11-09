import React from 'react';
import { RepeatedPhrase, RepeatedWord } from '../types/metrics';
import { Info } from 'lucide-react';

interface RepetitionAnalysisProps {
  repeatedWords: RepeatedWord[];
  repeatedPhrases: RepeatedPhrase[];
}

export const RepetitionAnalysis: React.FC<RepetitionAnalysisProps> = ({
  repeatedWords,
  repeatedPhrases,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Repeated Words */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="pb-3 mb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              반복 사용 단어 (3회 이상)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              조사 및 불용어(the, a, is 등)를 제외한 실질 단어의 반복입니다.
            </p>
          </div>

          {repeatedWords.length > 0 ? (
            <div className="space-y-2 mb-3">
              {repeatedWords.map((item) => (
                <div
                  key={item.word}
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="font-semibold text-slate-800 font-mono">
                    {item.word}
                  </span>
                  <span className="font-bold text-slate-700 tabular-nums">
                    {item.count}회
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 mb-3">
              3회 이상 반복된 단어가 없습니다.
            </div>
          )}
        </div>

        <div className="flex items-start gap-1.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            핵심 단어의 반복은 자연스러울 수 있습니다. 같은 의미를 다양한 표현으로 말할 수 있는지 확인해 보세요.
          </span>
        </div>
      </div>

      {/* 2. Repeated Phrases */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="pb-3 mb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              반복 표현 (2~3단어 연어)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              2회 이상 연속으로 쓰인 구문이나 표현입니다.
            </p>
          </div>

          {repeatedPhrases.length > 0 ? (
            <div className="space-y-2 mb-3">
              {repeatedPhrases.map((item) => (
                <div
                  key={item.phrase}
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="font-semibold text-slate-800 font-mono">
                    "{item.phrase}"
                  </span>
                  <span className="font-bold text-slate-700 tabular-nums">
                    {item.count}회
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 mb-3">
              눈에 띄는 반복 표현이 없습니다.
            </div>
          )}
        </div>

        <div className="flex items-start gap-1.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            특정 문장 구조가 굳어지지 않고 유연한 어휘로 전개되었는지 점검하세요.
          </span>
        </div>
      </div>
    </div>
  );
};
