/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  PracticeAreaId,
  PracticeAreaSelection,
  PracticeSelection,
  PracticeSettings,
  TopicId,
  TopicSelection,
} from '../types/question';
import {
  PRACTICE_AREAS,
  PRACTICE_AREA_DISCLAIMER,
  PRACTICE_AREA_TOPIC_MAP,
  TOPICS,
  getPracticeAreaDefinition,
} from '../config/practiceTaxonomy';
import { QUESTION_BANK } from '../data/questionBank';
import {
  ArrowLeft,
  Play,
  Shuffle,
  AlertCircle,
  Clock,
  Mic,
  Headphones,
  Eye,
  Layers,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';
import { mapLegacyCategoryToTopic } from '../utils/questionUtils';

interface PracticeSetupPageProps {
  settings: PracticeSettings;
  onUpdateSettings: (newSettings: PracticeSettings) => void;
  onStartQuestion: (selection: PracticeSelection | any) => void;
  onBack: () => void;
}

const PREP_TIME_OPTIONS = [
  { value: 15, label: '15초', desc: '기본 권장 (실제 시험 유형)' },
  { value: 30, label: '30초', desc: '여유로운 생각 정리' },
  { value: 45, label: '45초', desc: '초심자용 충분한 준비' },
];

const ANSWER_TIME_OPTIONS = [
  { value: 60, label: '60초', desc: '1분 (기본 답변)' },
  { value: 90, label: '90초', desc: '1분 30초 (상세 답변)' },
  { value: 120, label: '120초', desc: '2분 (심층 논리 전개)' },
];

export const PracticeSetupPage: React.FC<PracticeSetupPageProps> = ({
  settings,
  onUpdateSettings,
  onStartQuestion,
  onBack,
}) => {
  // Practice Area selection state
  const [selectedArea, setSelectedArea] = useState<PracticeAreaSelection>(
    () => settings.lastSelectedPracticeArea || 'area-1-personal-workplace'
  );

  // Topic selection state
  const [selectedTopic, setSelectedTopic] = useState<TopicSelection>(() => {
    if (settings.lastSelectedTopic) return settings.lastSelectedTopic;
    if (settings.lastSelectedCategory) return mapLegacyCategoryToTopic(settings.lastSelectedCategory);
    return 'all';
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter available topics based on selected Area
  const availableTopicsForArea = useMemo(() => {
    if (selectedArea === 'all') {
      return TOPICS.map((topic) => {
        const count = QUESTION_BANK.filter((q) => q.topic === topic.id).length;
        return { ...topic, questionCount: count, isAllowed: true };
      });
    }

    const allowedTopicIds = PRACTICE_AREA_TOPIC_MAP[selectedArea] || [];
    return TOPICS.map((topic) => {
      const isAllowed = allowedTopicIds.includes(topic.id);
      const count = QUESTION_BANK.filter(
        (q) => q.practiceArea === selectedArea && q.topic === topic.id
      ).length;
      return { ...topic, questionCount: count, isAllowed };
    });
  }, [selectedArea]);

  const handleSelectArea = (area: PracticeAreaSelection) => {
    setSelectedArea(area);
    setValidationError(null);

    // If currently selected topic is not valid for this area, reset topic to 'all'
    if (area !== 'all') {
      const allowed = PRACTICE_AREA_TOPIC_MAP[area] || [];
      if (selectedTopic !== 'all' && !allowed.includes(selectedTopic)) {
        setSelectedTopic('all');
      }
    }

    onUpdateSettings({
      ...settings,
      lastSelectedPracticeArea: area === 'all' ? null : area,
    });
  };

  const handleSelectTopic = (topic: TopicSelection) => {
    setSelectedTopic(topic);
    setValidationError(null);
    onUpdateSettings({
      ...settings,
      lastSelectedTopic: topic,
    });
  };

  const handlePrepTimeChange = (duration: number) => {
    onUpdateSettings({
      ...settings,
      preparationDuration: duration,
    });
  };

  const handleAnswerTimeChange = (duration: number) => {
    onUpdateSettings({
      ...settings,
      answerDuration: duration,
    });
  };

  const handleStart = () => {
    if (!selectedArea) {
      setValidationError('먼저 연습할 Practice Area를 선택해 주세요.');
      return;
    }
    if (!selectedTopic) {
      setValidationError('연습할 Topic을 선택해 주세요.');
      return;
    }

    // Verify questions exist
    const matchingCount = QUESTION_BANK.filter((q) => {
      if (selectedArea !== 'all' && q.practiceArea !== selectedArea) return false;
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
      return true;
    }).length;

    if (matchingCount === 0) {
      setValidationError('현재 선택한 Area와 Topic 조합에 사용할 수 있는 문제가 없습니다.');
      return;
    }

    const selection: PracticeSelection = {
      practiceArea: selectedArea,
      topic: selectedTopic,
    };
    onStartQuestion(selection);
  };

  const handleStartAllRandom = () => {
    setSelectedArea('all');
    setSelectedTopic('all');
    onStartQuestion({ practiceArea: 'all', topic: 'all' });
  };

  const getAreaIcon = (areaId: PracticeAreaId) => {
    switch (areaId) {
      case 'area-1-personal-workplace':
        return <Mic className="w-5 h-5 text-blue-600" />;
      case 'area-2-business-follow-up':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'area-3-opinion-extended':
        return <Layers className="w-5 h-5 text-amber-600" />;
      case 'area-4-listening-summary':
        return <Headphones className="w-5 h-5 text-purple-600" />;
      case 'area-5-visual-prompt':
        return <Eye className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-2 rounded-md py-1 pr-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>뒤로 가기</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            연습 환경 설정 (Practice Setup)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            연습 영역(Area)과 주제(Topic)를 2단계로 선택하고 실전 스피킹 훈련을 시작하세요.
          </p>
        </div>

        {/* Quick full random button */}
        <button
          type="button"
          onClick={handleStartAllRandom}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto shrink-0"
        >
          <Shuffle className="w-4 h-4 text-blue-400 dark:text-blue-600" aria-hidden="true" />
          <span>전체 영역 무작위 시작</span>
        </button>
      </div>

      {/* Official Disclaimer Banner */}
      <div className="mb-8 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-300 text-xs flex items-center gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
        <span className="font-medium">{PRACTICE_AREA_DISCLAIMER}</span>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm flex items-center gap-3 animate-shake"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
          <span className="font-semibold">{validationError}</span>
        </div>
      )}

      {/* Step 1: Practice Area Selection */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Step 1. Practice Area 선택 (5대 연습 영역)
            </h2>
            <p className="text-xs text-slate-500">
              학습하려는 문제 유형의 특성에 맞추어 연습 영역을 선택하세요.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md">
            {selectedArea === 'all'
              ? '전체 Area 무작위'
              : getPracticeAreaDefinition(selectedArea)?.labelKo}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 'All Areas' Card */}
          <button
            type="button"
            onClick={() => handleSelectArea('all')}
            className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
              selectedArea === 'all'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-600/30 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Shuffle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase">전체</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    전체 영역 혼합 (All Areas)
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                5개 모든 연습 영역의 문항 중 무작위로 선택되어 실전 모의 연습을 진행합니다.
              </p>
            </div>
          </button>

          {/* 5 Practice Areas */}
          {PRACTICE_AREAS.map((area) => {
            const isSelected = selectedArea === area.id;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => handleSelectArea(area.id)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-600/30 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getAreaIcon(area.id)}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">
                        Area {area.order}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {area.labelKo}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium mb-1">
                    {area.labelEn}
                  </span>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {area.description}
                  </p>

                  {area.id === 'area-4-listening-summary' && (
                    <div className="mt-2 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-1 rounded">
                      약 40~50초 Passage를 두 번 듣고 영어로 요약합니다.
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>권장 답변: {area.id === 'area-1-personal-workplace' ? '30~60초' : area.id === 'area-3-opinion-extended' ? '60~120초' : '45~90초'}</span>
                  <span className="font-mono text-blue-600 font-bold">{area.practiceMode}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Topic Selection */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Step 2. Topic 선택 (주제별 집중)
            </h2>
            <p className="text-xs text-slate-500">
              선택한 Area에서 사용 가능한 주제를 선택하거나 '전체 Topic'을 선택하세요.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md">
            {selectedTopic === 'all'
              ? '전체 Topic (무작위)'
              : TOPICS.find((t) => t.id === selectedTopic)?.labelKo}
          </span>
        </div>

        {/* 'All Topics' Option */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => handleSelectTopic('all')}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              selectedTopic === 'all'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Shuffle className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  전체 Topic (무작위)
                </span>
                <span className="text-[11px] text-slate-500">
                  선택한 Area 내 모든 주제의 문항에서 무작위로 출제됩니다.
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600">All Topics</span>
          </button>
        </div>

        {/* Available Topics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {availableTopicsForArea.map((topic) => {
            const isSelected = selectedTopic === topic.id;
            const isDisabled = !topic.isAllowed || topic.questionCount === 0;

            return (
              <button
                key={topic.id}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelectTopic(topic.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isDisabled
                    ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                    : isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-600/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {topic.labelKo}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {topic.questionCount}문항
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block truncate">
                  {topic.labelEn}
                </span>
                {isDisabled && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-1">
                    {!topic.isAllowed ? '해당 Area 미지원' : '문항 없음'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 3: Timer Durations */}
      <section className="mb-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
          Step 3. 시간 설정 (타이머)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prep time */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>준비시간 (Preparation Time)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PREP_TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handlePrepTimeChange(opt.value)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    settings.preparationDuration === opt.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm font-bold block">{opt.label}</span>
                  <span className="text-[10px] opacity-80 block truncate">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Answer time */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-red-600" />
              <span>답변 제한시간 (Speaking Time)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ANSWER_TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleAnswerTimeChange(opt.value)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    settings.answerDuration === opt.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm font-bold block">{opt.label}</span>
                  <span className="text-[10px] opacity-80 block truncate">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Start Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          취소 및 홈으로
        </button>

        <button
          type="button"
          onClick={handleStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all min-h-[48px]"
        >
          <Play className="w-5 h-5 fill-current" aria-hidden="true" />
          <span>문제 출제 및 연습 시작</span>
        </button>
      </div>
    </div>
  );
};
