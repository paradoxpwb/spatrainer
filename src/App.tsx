/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { AppStep, RecordingResultData } from './types/recording';
import {
  CategorySelection,
  PracticeSelection,
  PracticeSettings,
  SpeakingQuestion,
} from './types/question';
import { PracticeAttempt, RetrySource } from './types/practiceAttempt';
import { RetryContext, RetryMode } from './types/coaching';
import {
  loadPracticeSettings,
  savePracticeSettings,
  getRandomQuestion,
  getQuestionById,
  getDisplayPrompt,
  getTopicLabel,
  mapLegacyCategoryToTopic,
} from './utils/questionUtils';
import { usePracticeSessions } from './hooks/usePracticeSessions';
import { AppHeader } from './components/AppHeader';
import { HomePage } from './pages/HomePage';
import { PracticeSetupPage } from './pages/PracticeSetupPage';
import { QuestionReadyPage } from './pages/QuestionReadyPage';
import { PracticePage } from './pages/PracticePage';
import { ResultPage } from './pages/ResultPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ProgressPage } from './pages/ProgressPage';
import { HistoryPage } from './pages/HistoryPage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { SpaGuidePage } from './pages/SpaGuidePage';
import { MockExamPage } from './pages/MockExamPage';
import { PrivacyPolicyModal } from './components/legal/PrivacyPolicyModal';
import { TermsOfServiceModal } from './components/legal/TermsOfServiceModal';
import { AboutModal } from './components/legal/AboutModal';
import { useDDayOnboarding } from './hooks/useDDayOnboarding';
import { useDailyUsageLimit } from './hooks/useDailyUsageLimit';
import { DDayOnboardingModal } from './components/monetization/DDayOnboardingModal';
import { PaywallModal } from './components/monetization/PaywallModal';
import { PaywallSource } from './types/monetization';

const COACHING_MODE_TO_RETRY_SOURCE: Record<RetryMode, RetrySource> = {
  'outline-only': 'coaching_mode_a',
  'with-improved-answer': 'coaching_mode_b',
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('home');
  const [settings, setSettings] = useState<PracticeSettings>(() => loadPracticeSettings());

  // Monetization Sprint 1 Hooks & State
  const dDay = useDDayOnboarding();
  const dailyUsage = useDailyUsageLimit();
  const [isDDayModalOpen, setIsDDayModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallSource, setPaywallSource] = useState<PaywallSource>('home_hero_card');
  const hasAutoPromptedOnboardingRef = useRef(false);

  // Auto-prompt D-Day onboarding once on first visit to home if not completed
  useEffect(() => {
    if (currentStep === 'home' && !dDay.profile.onboardingCompleted && !hasAutoPromptedOnboardingRef.current) {
      hasAutoPromptedOnboardingRef.current = true;
      setIsDDayModalOpen(true);
    }
  }, [currentStep, dDay.profile.onboardingCompleted]);

  // Legal & Info Modals
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Sprint 5: Unified PracticeSelection (Area & Topic dual axis) - avoids redundant loadPracticeSettings()
  const [practiceSelection, setPracticeSelection] = useState<PracticeSelection>(() => ({
    practiceArea: settings.lastSelectedPracticeArea || 'area-1-personal-workplace',
    topic: settings.lastSelectedTopic || 'all',
  }));

  const [currentQuestion, setCurrentQuestion] = useState<SpeakingQuestion | null>(null);
  const [recordingResult, setRecordingResult] = useState<RecordingResultData | null>(null);
  const [retryContext, setRetryContext] = useState<RetryContext | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const showNotice = useCallback((msg: string) => {
    setNoticeMessage(msg);
  }, []);

  useEffect(() => {
    if (!noticeMessage) return;
    const timer = setTimeout(() => {
      setNoticeMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [noticeMessage]);

  // Sessions, attempts, goals & preferences
  const {
    sessions,
    attempts,
    goals,
    preferences,
    createNewSession,
    saveAttempt,
    deleteSession,
    resetAllData,
    updateGoals,
    updatePreferences,
  } = usePracticeSessions();

  // Active Session & Attempt State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentAttemptNumber, setCurrentAttemptNumber] = useState<number>(1);
  const [parentAttemptId, setParentAttemptId] = useState<string | null>(null);
  const [retrySource, setRetrySource] = useState<RetrySource | null>(null);
  const [lastSavedAttempt, setLastSavedAttempt] = useState<PracticeAttempt | null>(null);

  // Sub-navigation IDs
  const [selectedSessionIdForDetail, setSelectedSessionIdForDetail] = useState<string | null>(null);
  const [activeComparisonSessionId, setActiveComparisonSessionId] = useState<string | null>(null);

  // Keep track of the active audio URL to revoke on cleanup
  const activeAudioUrlRef = useRef<string | null>(null);

  const cleanupAudioUrl = useCallback(() => {
    if (activeAudioUrlRef.current) {
      try {
        URL.revokeObjectURL(activeAudioUrlRef.current);
      } catch {
        // ignore
      }
      activeAudioUrlRef.current = null;
    }
  }, []);

  // Update practice settings using functional updater
  const handleUpdateSettings = useCallback(
    (updater: PracticeSettings | ((prev: PracticeSettings) => PracticeSettings)) => {
      setSettings((prev) => (typeof updater === 'function' ? updater(prev) : updater));
    },
    []
  );

  // Synchronize settings changes to localStorage via dedicated effect
  useEffect(() => {
    savePracticeSettings(settings);
  }, [settings]);

  // Navigation handlers
  const handleGoHome = useCallback(() => {
    cleanupAudioUrl();
    setRecordingResult(null);
    setRetryContext(null);
    setCurrentStep('home');
  }, [cleanupAudioUrl]);

  const handleStartPractice = useCallback(() => {
    setRetryContext(null);
    setCurrentStep('setup');
  }, []);

  // Launch a question and initialize a linked PracticeSession
  const launchQuestion = useCallback(
    (question: SpeakingQuestion) => {
      cleanupAudioUrl();
      setCurrentQuestion(question);
      setRecordingResult(null);
      setRetryContext(null);

      const promptToStore = getDisplayPrompt(question);
      const topicLabel = getTopicLabel(question.topic);

      // Create new session for this question exercise
      const newSession = createNewSession({
        questionId: question.id,
        question: promptToStore,
        category: question.category || question.topic,
        categoryLabel: topicLabel,
        difficulty: question.difficulty,
        practiceArea: question.practiceArea,
        topic: question.topic,
        practiceMode: question.practiceMode,
      });

      setCurrentSessionId(newSession.id);
      setCurrentAttemptNumber(1);
      setParentAttemptId(null);
      setRetrySource(null);
      setLastSavedAttempt(null);

      setCurrentStep('question-ready');
    },
    [cleanupAudioUrl, createNewSession]
  );

  // TODO: Remove legacy CategorySelection path after migration is complete
  const handleStartQuestion = useCallback(
    (selectionOrCategory: PracticeSelection | CategorySelection) => {
      let selection: PracticeSelection;
      if (typeof selectionOrCategory === 'string') {
        selection = {
          practiceArea: 'all',
          topic: mapLegacyCategoryToTopic(selectionOrCategory),
        };
      } else {
        selection = selectionOrCategory;
      }

      setPracticeSelection(selection);
      handleUpdateSettings((prev) => ({
        ...prev,
        lastSelectedPracticeArea: selection.practiceArea,
        lastSelectedTopic: selection.topic,
      }));

      const question = getRandomQuestion({
        practiceArea: selection.practiceArea,
        topic: selection.topic,
      });
      if (!question) {
        showNotice('해당 조건의 문제가 없습니다.');
        return;
      }
      launchQuestion(question);
    },
    [handleUpdateSettings, launchQuestion, showNotice]
  );

  const launchQuestionById = useCallback(
    (questionId: string) => {
      const found = getQuestionById(questionId);
      if (found) {
        setPracticeSelection({
          practiceArea: found.practiceArea,
          topic: found.topic,
        });
        launchQuestion(found);
      } else {
        const fallback = getRandomQuestion({ practiceArea: 'all', topic: 'all' });
        if (!fallback) {
          showNotice('해당 조건의 문제가 없습니다.');
          return;
        }
        setPracticeSelection({ practiceArea: 'all', topic: 'all' });
        launchQuestion(fallback);
      }
    },
    [launchQuestion, showNotice]
  );

  // Common helper to pick and launch next random question without duplicate excludeQuestionId
  const pickAndLaunchNextQuestion = useCallback(
    (options?: { matchPracticeMode?: boolean }) => {
      cleanupAudioUrl();
      const excludeId = currentQuestion ? currentQuestion.id : undefined;
      const newQuestion = getRandomQuestion({
        practiceArea: practiceSelection.practiceArea,
        topic: practiceSelection.topic,
        excludeQuestionId: excludeId,
        practiceMode: options?.matchPracticeMode ? currentQuestion?.practiceMode : undefined,
      });
      if (!newQuestion) {
        showNotice('해당 조건의 문제가 없습니다.');
        return;
      }
      launchQuestion(newQuestion);
    },
    [cleanupAudioUrl, currentQuestion, practiceSelection, launchQuestion, showNotice]
  );

  const handleChangeQuestion = useCallback(() => {
    pickAndLaunchNextQuestion({ matchPracticeMode: true });
  }, [pickAndLaunchNextQuestion]);

  const handleNextQuestion = useCallback(() => {
    pickAndLaunchNextQuestion();
  }, [pickAndLaunchNextQuestion]);

  const handleStartPreparation = useCallback(() => {
    setCurrentStep('practice');
  }, []);

  const handleRecordingComplete = useCallback((data: RecordingResultData) => {
    cleanupAudioUrl();
    console.log('[SPA DEBUG] App state stored recordingResult, blob exists:', Boolean(data.audioBlob), 'size:', data.audioBlob?.size);
    const validUrl = data.audioUrl || (data.audioBlob ? URL.createObjectURL(data.audioBlob) : null);
    activeAudioUrlRef.current = validUrl;
    setRecordingResult({
      ...data,
      audioUrl: validUrl,
    });
    setCurrentStep('result');
  }, [cleanupAudioUrl]);

  // Save attempt and track as last saved
  const handleSaveAttempt = useCallback(
    (attempt: PracticeAttempt) => {
      const enrichedAttempt: PracticeAttempt = {
        ...attempt,
        practiceArea: attempt.practiceArea || currentQuestion?.practiceArea,
        topic: attempt.topic || currentQuestion?.topic,
        practiceMode: attempt.practiceMode || currentQuestion?.practiceMode,
        listeningContext:
          currentQuestion?.practiceMode === 'listening-summary'
            ? {
                passageId: currentQuestion.id,
                playbackCount: recordingResult?.listeningPlaybackCount ?? (attempt.listeningContext?.playbackCount ?? 2),
                expectedPlaybackCount: 2,
                passageDurationSeconds: currentQuestion.estimatedListeningSeconds,
              }
            : attempt.listeningContext,
        visualContext:
          currentQuestion?.practiceMode === 'visual-prompt'
            ? {
                visualType: currentQuestion.visualType,
                taskType: currentQuestion.taskType,
              }
            : attempt.visualContext,
      };

      saveAttempt(enrichedAttempt);
      setLastSavedAttempt(enrichedAttempt);

      // Sprint 1: Track daily free-usage (non-blocking)
      if (enrichedAttempt.id) {
        dailyUsage.recordPracticeAttempt(enrichedAttempt.id);
      }
      if (enrichedAttempt.aiCoaching?.status === 'completed') {
        const coachingKey = enrichedAttempt.aiCoaching.transcriptHash || `${enrichedAttempt.id}-coaching`;
        dailyUsage.recordAiFeedback(coachingKey);
      }
    },
    [saveAttempt, currentQuestion, recordingResult, dailyUsage]
  );

  // Direct Retry: same question, increment attempt number, link parent
  const handleRetrySameQuestion = useCallback(() => {
    cleanupAudioUrl();
    setRecordingResult(null);
    setRetryContext(null);
    setCurrentAttemptNumber((prev) => prev + 1);
    setParentAttemptId(lastSavedAttempt?.id || null);
    setRetrySource('direct');
    // If listening-summary, start at question-ready or practice listening
    setCurrentStep('question-ready');
  }, [cleanupAudioUrl, lastSavedAttempt]);

  // Coaching Retry: same question with outline/checklist context using object mapping
  const handleRetryWithCoaching = useCallback(
    (context: RetryContext) => {
      cleanupAudioUrl();
      setRecordingResult(null);
      setRetryContext(context);
      setCurrentAttemptNumber((prev) => prev + 1);
      setParentAttemptId(lastSavedAttempt?.id || null);
      setRetrySource(COACHING_MODE_TO_RETRY_SOURCE[context.mode]);
      setCurrentStep('practice');
    },
    [cleanupAudioUrl, lastSavedAttempt]
  );

  const handleFinishPractice = useCallback(() => {
    cleanupAudioUrl();
    setRecordingResult(null);
    setCurrentQuestion(null);
    setRetryContext(null);
    setCurrentStep('home');
  }, [cleanupAudioUrl]);

  // Open comparison for current session
  const handleOpenCurrentComparison = useCallback(() => {
    if (currentSessionId) {
      setActiveComparisonSessionId(currentSessionId);
    }
    setCurrentStep('comparison');
  }, [currentSessionId]);

  // Open comparison from history/detail
  const handleOpenComparisonForSession = useCallback((sessionId: string) => {
    setActiveComparisonSessionId(sessionId);
    setCurrentStep('comparison');
  }, []);

  // Open session detail
  const handleOpenSessionDetail = useCallback((sessionId: string) => {
    setSelectedSessionIdForDetail(sessionId);
    setCurrentStep('session-detail');
  }, []);

  // Attempts to pass into ComparisonPage: return [] if < 2 attempts for the same session or question
  const comparisonAttempts = useMemo(() => {
    if (activeComparisonSessionId) {
      const filtered = attempts.filter((a) => a.sessionId === activeComparisonSessionId);
      if (filtered.length >= 2) return filtered;
      return [];
    }
    if (currentQuestion) {
      const qAttempts = attempts.filter((a) => a.questionId === currentQuestion.id);
      if (qAttempts.length >= 2) return qAttempts;
      return [];
    }
    return [];
  }, [attempts, activeComparisonSessionId, currentQuestion]);

  // Selected session for SessionDetailPage
  const selectedSessionData = useMemo(() => {
    if (!selectedSessionIdForDetail) return null;
    const session = sessions.find((s) => s.id === selectedSessionIdForDetail);
    if (!session) return null;
    const sessionAttempts = attempts.filter((a) => a.sessionId === session.id);
    return { session, attempts: sessionAttempts };
  }, [sessions, attempts, selectedSessionIdForDetail]);

  // Check if comparison is available for current result: strictly based on saved attempt count (>= 2)
  const hasComparisonAvailable = useMemo(() => {
    if (currentSessionId) {
      const count = attempts.filter((a) => a.sessionId === currentSessionId).length;
      if (count >= 2) return true;
    }
    if (currentQuestion) {
      const count = attempts.filter((a) => a.questionId === currentQuestion.id).length;
      if (count >= 2) return true;
    }
    return false;
  }, [currentSessionId, attempts, currentQuestion]);

  // Delete session handler with stale state cleanup
  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      deleteSession(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      if (selectedSessionIdForDetail === sessionId) {
        setSelectedSessionIdForDetail(null);
      }
      if (activeComparisonSessionId === sessionId) {
        setActiveComparisonSessionId(null);
      }
      if (currentStep === 'session-detail' && selectedSessionIdForDetail === sessionId) {
        setCurrentStep('history');
      }
    },
    [deleteSession, currentSessionId, selectedSessionIdForDetail, activeComparisonSessionId, currentStep]
  );

  // Clear all data with user confirmation and state reset
  const handleResetAllData = useCallback(() => {
    if (typeof window !== 'undefined' && !window.confirm('모든 연습 기록을 초기화하시겠습니까?')) {
      return;
    }
    resetAllData();
    cleanupAudioUrl();
    setCurrentSessionId(null);
    setSelectedSessionIdForDetail(null);
    setActiveComparisonSessionId(null);
    setLastSavedAttempt(null);
    setParentAttemptId(null);
    setRecordingResult(null);
    setCurrentQuestion(null);
    if (currentStep === 'session-detail' || currentStep === 'comparison') {
      setCurrentStep('history');
    }
  }, [resetAllData, cleanupAudioUrl, currentStep]);

  // Retry in existing session (from History / SessionDetailPage)
  const handleRetryInExistingSession = useCallback(
    (sessionId: string, questionId: string) => {
      cleanupAudioUrl();
      const question = getQuestionById(questionId);
      if (!question) {
        showNotice('해당 문제를 찾을 수 없습니다.');
        return;
      }
      const sessionAttempts = attempts.filter((a) => a.sessionId === sessionId);
      const nextAttemptNumber = sessionAttempts.length + 1;
      const latestAttempt = sessionAttempts[sessionAttempts.length - 1];

      setPracticeSelection({
        practiceArea: question.practiceArea,
        topic: question.topic,
      });
      setCurrentQuestion(question);
      setRecordingResult(null);
      setRetryContext(null);
      setCurrentSessionId(sessionId);
      setCurrentAttemptNumber(nextAttemptNumber);
      setParentAttemptId(latestAttempt?.id || null);
      setRetrySource('history');
      setLastSavedAttempt(latestAttempt || null);

      setCurrentStep('question-ready');
    },
    [cleanupAudioUrl, attempts, showNotice]
  );

  // Guard against blank screens when required state for a step is missing
  useEffect(() => {
    if (currentStep === 'question-ready' || currentStep === 'practice') {
      if (!currentQuestion) {
        setCurrentStep('home');
      }
    } else if (currentStep === 'result') {
      if (!currentQuestion || !recordingResult) {
        setCurrentStep('home');
      }
    } else if (currentStep === 'session-detail') {
      if (!selectedSessionIdForDetail || !selectedSessionData) {
        setCurrentStep('history');
      }
    }
  }, [currentStep, currentQuestion, recordingResult, selectedSessionIdForDetail, selectedSessionData]);

  useEffect(() => {
    return () => {
      cleanupAudioUrl();
    };
  }, [cleanupAudioUrl]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100">
      {/* Universal App Header with Navigation */}
      <AppHeader
        currentStep={currentStep}
        onGoHome={handleGoHome}
        onNavigateProgress={() => setCurrentStep('progress')}
        onNavigateHistory={() => setCurrentStep('history')}
        onNavigateSettings={() => setCurrentStep('settings')}
        onNavigateGuide={() => setCurrentStep('guide')}
        onNavigateMockExam={() => setCurrentStep('mock-exam')}
        formattedDDay={dDay.formattedDDay}
        onOpenOnboarding={() => setIsDDayModalOpen(true)}
      />

      {/* Floating Notice Toast */}
      {noticeMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium transition-all duration-200"
        >
          {noticeMessage}
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentStep === 'home' && (
          <HomePage
            onStartPractice={handleStartPractice}
            onNavigateProgress={() => setCurrentStep('progress')}
            onNavigateHistory={() => setCurrentStep('history')}
            onNavigateGuide={() => setCurrentStep('guide')}
            onNavigateMockExam={() => setCurrentStep('mock-exam')}
            history={attempts}
            onClearHistory={handleResetAllData}
            onSelectAttempt={(attempt) => {
              if (attempt.sessionId) {
                handleOpenSessionDetail(attempt.sessionId);
              }
            }}
            formattedDDay={dDay.formattedDDay}
            targetLevel={dDay.profile.targetLevel}
            dailyStudyMinutes={dDay.profile.dailyStudyMinutes}
            recommendedArea={dDay.recommendedArea}
            remainingPracticeCount={dailyUsage.remainingPracticeCount}
            practiceLimit={dailyUsage.practiceLimit}
            remainingAiFeedbackCount={dailyUsage.remainingAiFeedbackCount}
            aiFeedbackLimit={dailyUsage.aiFeedbackLimit}
            onOpenOnboarding={() => setIsDDayModalOpen(true)}
            onOpenPaywall={(source) => {
              setPaywallSource(source);
              setIsPaywallOpen(true);
            }}
          />
        )}

        {currentStep === 'setup' && (
          <PracticeSetupPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onStartQuestion={handleStartQuestion}
            onBack={handleGoHome}
          />
        )}

        {currentStep === 'question-ready' && currentQuestion && (
          <QuestionReadyPage
            question={currentQuestion}
            settings={settings}
            onStartPreparation={handleStartPreparation}
            onChangeQuestion={handleChangeQuestion}
            onBackToSetup={() => setCurrentStep('setup')}
          />
        )}

        {currentStep === 'practice' && currentQuestion && (
          <PracticePage
            question={currentQuestion}
            settings={settings}
            onRecordingComplete={handleRecordingComplete}
            onBackToSetup={() => setCurrentStep('setup')}
            retryContext={retryContext}
          />
        )}

        {currentStep === 'result' && currentQuestion && recordingResult && (
          <ResultPage
            question={currentQuestion}
            settings={settings}
            resultData={recordingResult}
            sessionId={currentSessionId || undefined}
            attemptNumber={currentAttemptNumber}
            parentAttemptId={parentAttemptId}
            retrySource={retrySource}
            retryContext={retryContext || undefined}
            hasComparisonAvailable={hasComparisonAvailable}
            onOpenComparison={handleOpenCurrentComparison}
            onRetrySameQuestion={handleRetrySameQuestion}
            onRetryWithCoaching={handleRetryWithCoaching}
            onNextQuestion={handleNextQuestion}
            onFinishPractice={handleFinishPractice}
            onSaveAttempt={handleSaveAttempt}
          />
        )}

        {currentStep === 'comparison' && (
          <ComparisonPage
            attempts={comparisonAttempts}
            activeAudioUrl={recordingResult?.audioUrl}
            onRetryQuestion={launchQuestionById}
            onNextQuestion={handleNextQuestion}
            onBackToSession={() => {
              if (selectedSessionIdForDetail) {
                setCurrentStep('session-detail');
              } else if (currentQuestion && recordingResult) {
                setCurrentStep('result');
              } else {
                setCurrentStep('home');
              }
            }}
            onGoHome={handleGoHome}
          />
        )}

        {currentStep === 'progress' && (
          <ProgressPage
            attempts={attempts}
            sessions={sessions}
            goals={goals}
            onUpdateGoals={updateGoals}
            onStartPractice={handleStartPractice}
            onSelectCategoryPractice={(catId) => {
              handleStartQuestion(catId as CategorySelection);
            }}
            onRetryQuestion={launchQuestionById}
            onGoHome={handleGoHome}
            formattedDDay={dDay.formattedDDay}
            targetLevel={dDay.profile.targetLevel}
            dailyStudyMinutes={dDay.profile.dailyStudyMinutes}
            recommendedArea={dDay.recommendedArea}
            remainingPracticeCount={dailyUsage.remainingPracticeCount}
            practiceLimit={dailyUsage.practiceLimit}
            remainingAiFeedbackCount={dailyUsage.remainingAiFeedbackCount}
            aiFeedbackLimit={dailyUsage.aiFeedbackLimit}
            onOpenOnboarding={() => setIsDDayModalOpen(true)}
            onOpenPaywall={(source) => {
              setPaywallSource(source);
              setIsPaywallOpen(true);
            }}
          />
        )}

        {currentStep === 'history' && (
          <HistoryPage
            sessions={sessions}
            attempts={attempts}
            onOpenSessionDetail={handleOpenSessionDetail}
            onOpenComparison={handleOpenComparisonForSession}
            onRetryQuestion={launchQuestionById}
            onDeleteSession={handleDeleteSession}
            onGoHome={handleGoHome}
          />
        )}

        {currentStep === 'session-detail' && selectedSessionData && (
          <SessionDetailPage
            session={selectedSessionData.session}
            attempts={selectedSessionData.attempts}
            activeAudioUrl={recordingResult?.audioUrl}
            onBackToHistory={() => setCurrentStep('history')}
            onOpenComparison={handleOpenComparisonForSession}
            onRetryInSession={handleRetryInExistingSession}
            onStartNewSession={launchQuestionById}
            onRetryQuestion={launchQuestionById}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {currentStep === 'guide' && (
          <SpaGuidePage
            onStartPractice={handleStartPractice}
            onGoHome={handleGoHome}
          />
        )}

        {currentStep === 'mock-exam' && (
          <MockExamPage
            onGoHome={handleGoHome}
          />
        )}

        {currentStep === 'settings' && (
          <SettingsPage
            onBack={handleGoHome}
            onNavigateHome={handleGoHome}
          />
        )}
      </main>

      {/* Footer with AdSense & Legal Compliance */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <nav className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300" aria-label="Legal and guide navigation">
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(true)}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                서비스 소개
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('guide')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                시험 가이드 & 루브릭
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('mock-exam')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold text-indigo-600 dark:text-indigo-400"
              >
                실전 모의고사
              </button>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                개인정보처리방침
              </button>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                이용약관
              </button>
            </nav>
            <div className="text-[11px] text-slate-400">
              고객 및 제휴 문의: <span className="font-mono text-slate-600 dark:text-slate-300">support@spatrainer.app</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} SPA Speaking Trainer. 비즈니스 영어 말하기 실전 자가 훈련 서비스.</p>
            <p>Google AdSense 광고 및 쿠키 정책 준수 · 사용자 녹음 및 학습 데이터 브라우저 로컬 보관</p>
          </div>
        </div>
      </footer>

      {/* Legal & About Modals */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <TermsOfServiceModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Monetization Sprint 1 Modals */}
      <DDayOnboardingModal
        isOpen={isDDayModalOpen}
        onClose={() => setIsDDayModalOpen(false)}
        initialProfile={dDay.profile}
        onSaveProfile={dDay.updateProfile}
      />
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        source={paywallSource}
        formattedDDay={dDay.formattedDDay}
      />
    </div>
  );
}
