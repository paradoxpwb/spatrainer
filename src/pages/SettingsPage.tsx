import React, { useState } from 'react';
import { Download, Trash2, ArrowLeft, Globe, Target, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { usePracticeSessions } from '../hooks/usePracticeSessions';
import { downloadBackupFile } from '../utils/dataExport';
import { ResetDataDialog } from '../components/history/ResetDataDialog';
import { DesiredAnswerLevel } from '../types/coaching';

interface SettingsPageProps {
  onBack: () => void;
  onNavigateHome: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  onNavigateHome,
}) => {
  const { preferences, updatePreferences, resetAllData } = usePracticeSessions();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = () => {
    const success = downloadBackupFile();
    if (success) {
      setExportNotice('백업 파일이 성공적으로 다운로드되었습니다.');
      setTimeout(() => setExportNotice(null), 4000);
    } else {
      setExportNotice('내보낼 연습 데이터가 없습니다.');
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const handleFeedbackLangChange = (lang: 'ko' | 'en') => {
    updatePreferences({ feedbackLanguage: lang });
  };

  const handleDesiredLevelChange = (level: DesiredAnswerLevel) => {
    updatePreferences({ desiredAnswerLevel: level });
  };

  const handleResetConfirm = () => {
    resetAllData();
    setShowResetDialog(false);
    onNavigateHome();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          설정 및 데이터 관리
        </h1>
        <div className="w-16" />
      </div>

      {exportNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Preferences Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          학습 환경 설정
        </h2>

        {/* Desired Answer Level */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            AI 모범 답변 목표 수준 (Answer Difficulty)
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            공식 SPA 점수 판정이 아니며, 모범 답변 생성 시 추천할 문장 구조의 깊이와 어휘 복잡도를 조절합니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {[
              {
                id: 'current' as DesiredAnswerLevel,
                label: '현재 수준 보완 (Current)',
                desc: '현재 답변의 문법과 어색한 표현을 다듬는 자연스러운 교정',
              },
              {
                id: 'one-step-better' as DesiredAnswerLevel,
                label: '한 단계 발전 (One Step Better)',
                desc: '논리적인 연결어와 비즈니스 어휘를 보강한 실용적 답변 (권장)',
              },
              {
                id: 'challenging' as DesiredAnswerLevel,
                label: '고급 도전 (Challenging)',
                desc: '풍부한 수식어와 다각도 논변을 담은 고급 수준 답변',
              },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleDesiredLevelChange(lvl.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  preferences.desiredAnswerLevel === lvl.id
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-sm font-bold">{lvl.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {lvl.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Language */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-slate-500" />
            AI 코칭 피드백 기본 언어
          </label>
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleFeedbackLangChange('ko')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                preferences.feedbackLanguage === 'ko'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              한국어 피드백
            </button>
            <button
              type="button"
              onClick={() => handleFeedbackLangChange('en')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                preferences.feedbackLanguage === 'en'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              English Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          데이터 관리 및 보안
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          SPA Speaking Trainer는 사용자의 모든 연습 기록(질문, 전사 텍스트, 말하기 지표, 재시도 비교 기록)을 브라우저 로컬 저장소(LocalStorage)에 안전하게 보관합니다. 별도 서버 데이터베이스로 자동 전송되거나 저장되지 않습니다.
        </p>

        {/* Data Export Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              학습 데이터 백업 다운로드 (JSON)
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              세션 기록, 시도별 지표, 전사 텍스트 및 설정 정보를 표준 JSON 형식으로 안전하게 내려받습니다.
              (오디오 원본 파일 및 API 키는 제외됩니다.)
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition-colors flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            JSON 백업 다운로드
          </button>
        </div>

        {/* Data Reset Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-rose-900 dark:text-rose-200">
              전체 데이터 초기화
            </div>
            <div className="text-xs text-rose-700 dark:text-rose-300">
              모든 연습 세션, 시도 기록, 재시도 비교 데이터, 주간 목표가 브라우저에서 영구적으로 삭제됩니다.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowResetDialog(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors flex-shrink-0 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            데이터 전체 초기화
          </button>
        </div>
      </div>

      {/* Disclaimers & Notes */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="font-semibold text-slate-700 dark:text-slate-300">안내 사항</div>
        <p>
          • 본 서비스는 현대자동차그룹의 공식 SPA 시험 서비스가 아니며, 응시자의 자가 말하기 훈련을 돕기 위해 비공식으로 제작된 연습 도구입니다.
        </p>
        <p>
          • 제공되는 말하기 지표(WPM, 어휘 다양성, 채움말 비율 등) 및 AI 코칭은 연습 피드백용이며, 실제 시험의 평가 점수나 합격 여부를 예측하거나 보장하지 않습니다.
        </p>
      </div>

      {/* Reset Confirmation Dialog */}
      <ResetDataDialog
        isOpen={showResetDialog}
        onCancel={() => setShowResetDialog(false)}
        onConfirmReset={handleResetConfirm}
      />
    </div>
  );
};
