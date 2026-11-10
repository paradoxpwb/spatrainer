/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Play,
  CheckCircle2,
  Headphones,
  BarChart2,
  MessageSquare,
  Sparkles,
  Volume2,
  ShieldAlert,
} from 'lucide-react';
import { PRACTICE_AREAS } from '../config/practiceTaxonomy';

interface SpaGuidePageProps {
  onStartPractice: () => void;
  onGoHome: () => void;
}

export const SpaGuidePage: React.FC<SpaGuidePageProps> = ({ onStartPractice, onGoHome }) => {
  const [activeTab, setActiveTab] = useState<'areas' | 'rubrics' | 'templates' | 'faq'>('areas');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const faqItems = [
    {
      question: 'SPA 시험의 기본 진행 방식과 시험 시간은 어떻게 되나요?',
      answer:
        'SPA(Speaking Proficiency Assessment)는 약 10~15분간 진행되는 실전 영어 구술 면접 시험입니다. 1~2명의 원어민 면접관이 질문을 던지고 응시자가 즉시 영어로 답변하는 방식으로 진행되며, 일상 질문부터 비즈니스 후속 질문, 논리적 의견 제시, 음성 지문 요약, 시각 도표 묘사까지 5개 영역에 걸쳐 종합적인 비즈니스 회화 소통 역량을 평가합니다.',
    },
    {
      question: '발화 속도(WPM: Words Per Minute)는 어느 정도가 가장 이상적인가요?',
      answer:
        '원어민의 일상 대화 속도는 약 140~160 WPM이지만, 비원어민 영어 시험에서는 100~130 WPM 수준이 가장 권장됩니다. 지나치게 빠른 속도(140 이상)는 발음 부정확이나 문법 실수를 유발하기 쉽고, 80 WPM 이하로 너무 느리면 유창성에서 감점을 받을 수 있습니다. 명확한 발음과 적절한 억양을 유지하며 분당 110단어 내외로 또박또박 전달하는 것이 가장 높은 평가를 받습니다.',
    },
    {
      question: 'Area 4(듣기 지문 요약)에서 핵심 내용을 놓쳤을 때는 어떻게 대처하나요?',
      answer:
        '지문은 규정상 정확히 2회 청취할 수 있습니다. 1차 청취에서는 전체적인 주제와 큰 맥락(화자가 무엇에 대해 말하고 있는가)을 파악하고, 2차 청취에서 핵심 수치나 핵심 논거 2~3가지를 보완하세요. 세부 수치를 일부 놓쳤더라도 침묵하기보다는 "According to the passage, the speaker discusses [주제] and mainly highlights [파악한 내용]"과 같이 큰 틀을 논리적으로 요약하는 것이 감점을 최소화하는 핵심 전략입니다.',
    },
    {
      question: '문법 실수와 발화 유창성(말을 끊김 없이 이어가는 것) 중 무엇이 더 중요한가요?',
      answer:
        'SPA는 완벽한 문법 시험이 아닌 실전 의사소통 능력(Communicative Competence) 평가입니다. 작은 문법 실수(단수/복수, 전치사 등) 때문에 말을 멈추고 주저하기보다는, 의미가 통하는 문장으로 자연스럽게 대화를 이어가는 것이 유창성 측면에서 훨씬 유리합니다. 다만 시제(과거 경험을 이야기할 때 과거 시제 유지)와 주어-동사 수일치는 기본적이므로 평소 반복 연습으로 자동화해 두어야 합니다.',
    },
    {
      question: '본 트레이너의 분석 지표와 피드백은 공식 시험 등급을 보증하나요?',
      answer:
        '본 서비스는 현대자동차그룹이나 공식 시험 주관사와 무관한 비공식 자가 학습 도구입니다. 제공되는 WPM, 어휘 다양성, 휴지기 비율은 브라우저에서 측정된 객관적인 발화 데이터 기반 지표이며, 실제 면접관의 주관적 평가나 공식 SPA 등급(Level 1~8)을 직접 산출하거나 보증하지 않습니다. 실전 감각 배양과 자가 점검용으로 활용해 주세요.',
    },
  ];

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>SPA 종합 시험 가이드 & 실전 전략 허브</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
          SPA Speaking 완벽 대비 가이드
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          5대 평가 영역별 출제 구조부터 채점 루브릭 해설, 고득점 답변 템플릿과 실전 팁까지 체계적으로 정리했습니다.
        </p>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('areas')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'areas'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            5대 평가 영역 구조
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rubrics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'rubrics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            채점 기준 & 발화 지표
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            고득점 답변 템플릿
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'faq'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            자주 묻는 질문 (FAQ)
          </button>
        </div>
      </div>

      {/* =======================================================================
          TAB 1: 5대 평가 영역 상세
          ======================================================================= */}
      {activeTab === 'areas' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PRACTICE_AREAS.map((area) => (
              <div
                key={area.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      PART 0{area.order}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      준비 {area.defaultPreparationSeconds}초 · 답변 {area.defaultAnswerSeconds}초
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {area.labelKo}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-3">{area.labelEn}</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {area.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">핵심 훈련 포인트:</span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                    {area.id === 'area-1-personal-workplace' && (
                      <>
                        <li>명확하고 간결한 자기 표현 및 과거 경험 시제 일치</li>
                        <li>단순 단답형 탈피, 이유와 구체적 사례 1가지 이상 덧붙이기</li>
                      </>
                    )}
                    {area.id === 'area-2-business-follow-up' && (
                      <>
                        <li>면접관의 꼬리 질문 의도를 정확히 파악하여 문맥 유지</li>
                        <li>비즈니스 문제 발생 시 해결 과정과 대안 제시 역량</li>
                      </>
                    )}
                    {area.id === 'area-3-opinion-extended' && (
                      <>
                        <li>주장(Claim) - 근거(Reason) - 예시(Example) 3단 논리 구조화</li>
                        <li>다양한 연결사(However, Furthermore, Consequently) 구사</li>
                      </>
                    )}
                    {area.id === 'area-4-listening-summary' && (
                      <>
                        <li>지문 2회 청취 중 핵심 키워드 및 5W1H 정보 파악</li>
                        <li>자신의 문장으로 패러프레이징하여 서론-본론-결론 재구성</li>
                      </>
                    )}
                    {area.id === 'area-5-visual-prompt' && (
                      <>
                        <li>도표/사진의 핵심 특징 30초 내 파악 및 대조 비교</li>
                        <li>단순 수치 나열이 아닌 의미 해석 및 비즈니스 제언 도출</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center space-y-3">
            <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
              실전 감각을 기르는 가장 빠른 방법은 직접 소리 내어 말해보는 것입니다
            </h4>
            <button
              type="button"
              onClick={onStartPractice}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>지금 5개 영역 실전 연습 시작하기</span>
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 2: 채점 기준 & 발화 지표 해설
          ======================================================================= */}
      {activeTab === 'rubrics' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                SPA 5대 종합 평가 기준 (Assessment Rubrics)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                원어민 면접관은 답변의 단순 문법뿐만 아니라 실제 글로벌 업무 환경에서의 원활한 의사소통 수행 역량을 입체적으로 측정합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <strong className="block text-slate-900 dark:text-slate-100 font-bold text-sm">
                  1. 발화 유창성 및 전달력 (Fluency & Delivery)
                </strong>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  불필요하게 긴 침묵(Pause)이나 잦은 더듬거림 없이, 안정적인 리듬과 적절한 억양으로 자연스럽게 발화를 이어나갈 수 있는지를 평가합니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <strong className="block text-slate-900 dark:text-slate-100 font-bold text-sm">
                  2. 문법 정확성 및 문장 복잡성 (Grammar & Accuracy)
                </strong>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  주어-동사 수일치, 과거/완료 시제 구사, 접속사를 활용한 복합문(Complex sentences) 구성 등 문법적 안정성을 점검합니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <strong className="block text-slate-900 dark:text-slate-100 font-bold text-sm">
                  3. 어휘 다양성 및 비즈니스 적합도 (Vocabulary & Word Choice)
                </strong>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  중복되는 기초 단어(good, bad, very)를 지양하고, 상황에 맞는 명확한 비즈니스 어휘와 다채로운 표현을 사용하는지 평가합니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <strong className="block text-slate-900 dark:text-slate-100 font-bold text-sm">
                  4. 청취 이해력 및 답변 관련성 (Listening Comprehension)
                </strong>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  면접관의 질문 핵심 의도를 정확하게 파악했는지, 엉뚱한 대답(Off-topic) 없이 질문에 부합하는 직접적인 답변을 내놓는지 평가합니다.
                </p>
              </div>
            </div>

            {/* Speaking Metrics Explained */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <span>본 트레이너가 측정하는 4대 객관적 지표</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">WPM (말하기 속도)</span>
                  <span className="text-slate-600 dark:text-slate-400">적정 구간: 100~130 WPM. 의사소통 전달력과 유창성의 기본 척도입니다.</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">어휘 다양성 (TTR)</span>
                  <span className="text-slate-600 dark:text-slate-400">총 단어 수 대비 고유 어휘 비율(Type-Token Ratio)로 어휘 풍부도를 측정합니다.</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">필러어 비율 (Filler Rate)</span>
                  <span className="text-slate-600 dark:text-slate-400">um, uh, you know 등 습관적인 군더더기 표현 비율을 분석하여 감축을 돕습니다.</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">휴지기 비율 (Pause Ratio)</span>
                  <span className="text-slate-600 dark:text-slate-400">전체 답변 시간 중 묵음 또는 정적이 차지하는 비율을 계산하여 개선점을 제시합니다.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 3: 고득점 답변 템플릿
          ======================================================================= */}
      {activeTab === 'templates' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
            {/* Template 1: PREP */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  01
                </span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  PREP 논리 템플릿 (의견 제시 및 일반 질문)
                </h3>
              </div>
              <p className="text-xs text-slate-500">질문에 대해 확실한 주장을 펼치고 논리적으로 뒷받침할 때 가장 효과적입니다.</p>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-xs space-y-2 border border-slate-100 dark:border-slate-700">
                <p><strong className="text-blue-600">P (Point):</strong> In my opinion, [주장 한 문장].</p>
                <p><strong className="text-blue-600">R (Reason):</strong> The main reason is that [이유 설명].</p>
                <p><strong className="text-blue-600">E (Example):</strong> For example, in my previous project, [구체적 사례].</p>
                <p><strong className="text-blue-600">P (Point):</strong> Therefore, I strongly believe that [결론 요약].</p>
              </div>
            </div>

            {/* Template 2: STAR */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                  02
                </span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  STAR 경험 설명 템플릿 (과거 프로젝트/난관 극복)
                </h3>
              </div>
              <p className="text-xs text-slate-500">과거 직장이나 팀 프로젝트에서 겪은 문제와 해결 경험을 설명할 때 권장됩니다.</p>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-xs space-y-2 border border-slate-100 dark:border-slate-700">
                <p><strong className="text-emerald-600">S (Situation):</strong> When I was working on [상황 배경],</p>
                <p><strong className="text-emerald-600">T (Task):</strong> My responsibility was to [직면한 과제].</p>
                <p><strong className="text-emerald-600">A (Action):</strong> To solve this, I took the initiative to [내가 취한 행동].</p>
                <p><strong className="text-emerald-600">R (Result):</strong> As a result, we successfully achieved [성과 및 교훈].</p>
              </div>
            </div>

            {/* Template 3: Area 4 Summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                  03
                </span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  듣기 지문 요약 템플릿 (Area 4 Summary)
                </h3>
              </div>
              <p className="text-xs text-slate-500">2회 청취한 음성 지문을 60초 안에 서론-본론-결론으로 정리할 때 활용합니다.</p>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-xs space-y-2 border border-slate-100 dark:border-slate-700">
                <p><strong className="text-purple-600">Intro:</strong> The passage mainly discusses [지문의 핵심 주제].</p>
                <p><strong className="text-purple-600">Body 1:</strong> First, the speaker emphasizes that [첫 번째 요점].</p>
                <p><strong className="text-purple-600">Body 2:</strong> In addition, it mentions that [두 번째 보충 내용].</p>
                <p><strong className="text-purple-600">Outro:</strong> Overall, the key takeaway is [화자의 최종 결론/시사점].</p>
              </div>
            </div>

            {/* Template 4: Area 5 Visual */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                  04
                </span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  시각 자료 분석 템플릿 (Area 5 Chart/Photo)
                </h3>
              </div>
              <p className="text-xs text-slate-500">도표의 전반적인 트렌드를 짚고 가장 두드러진 수치를 대조한 후 의견을 덧붙입니다.</p>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-xs space-y-2 border border-slate-100 dark:border-slate-700">
                <p><strong className="text-amber-600">Overview:</strong> This chart illustrates [도표 제목 및 전체 개요].</p>
                <p><strong className="text-amber-600">Key Trend:</strong> As we can see, [가장 높은 항목] accounts for the largest share at [수치].</p>
                <p><strong className="text-amber-600">Comparison:</strong> In contrast, [가장 낮은 항목] remains significantly lower at [수치].</p>
                <p><strong className="text-amber-600">Implication:</strong> Based on these figures, I recommend that [실무 제언].</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 4: 자주 묻는 질문 (FAQ)
          ======================================================================= */}
      {activeTab === 'faq' && (
        <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{item.question}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Floating Banner */}
      <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            가이드를 숙지하셨나요?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            실전과 동일한 64개 엄선 문항으로 지금 바로 말하기 연습을 시작해 보세요.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onGoHome}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            홈으로 가기
          </button>
          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>실전 연습 시작</span>
          </button>
        </div>
      </div>
    </div>
  );
};
