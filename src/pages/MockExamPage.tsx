/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  MockExamStage,
  MockExamResult,
  MockQuestionItem,
  MockVisualItem,
  MockVisualType,
} from '../types/mockExam';
import { DEFAULT_MOCK_EXAM_BLUEPRINT } from '../config/mockExamBlueprint';
import { generateMockExamSet } from '../data/mockExamPool';
import { useMockEntitlement } from '../hooks/useMockEntitlement';
import { MockIntro } from '../components/mock/MockIntro';
import { MockCheck } from '../components/mock/MockCheck';
import { MockRun } from '../components/mock/MockRun';
import { MockFinish } from '../components/mock/MockFinish';
import { MockResult } from '../components/mock/MockResult';

interface MockExamPageProps {
  onGoHome: () => void;
}

export const MockExamPage: React.FC<MockExamPageProps> = ({ onGoHome }) => {
  const [stage, setStage] = useState<MockExamStage>('intro');
  const entitlement = useMockEntitlement();

  // Keep track of recent visual items used to avoid immediate repetition
  const [recentVisualIds, setRecentVisualIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('spa_mock_recent_visuals');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Current Exam Set
  const [examQuestions, setExamQuestions] = useState<MockQuestionItem[]>([]);
  const [pickedVisualType, setPickedVisualType] = useState<MockVisualType>('chart');
  const [pickedVisualItem, setPickedVisualItem] = useState<MockVisualItem | null>(null);

  // Active persistent MediaStream from MockCheck
  const activeMediaStreamRef = useRef<MediaStream | null>(null);

  // Result data
  const [examResult, setExamResult] = useState<MockExamResult | null>(null);

  // Step 1: Proceed from Intro to Check
  const handleProceedToCheck = useCallback(() => {
    // Generate new mock set dynamically from blueprint
    const generated = generateMockExamSet(DEFAULT_MOCK_EXAM_BLUEPRINT, recentVisualIds);
    setExamQuestions(generated.questions);
    setPickedVisualType(generated.pickedVisualType);
    setPickedVisualItem(generated.pickedVisualItem);

    // Update recent visual tracking
    const updatedVisuals = [generated.pickedVisualItem.id, ...recentVisualIds.slice(0, 5)];
    setRecentVisualIds(updatedVisuals);
    try {
      localStorage.setItem('spa_mock_recent_visuals', JSON.stringify(updatedVisuals));
    } catch {
      // ignore
    }

    setStage('check');
  }, [recentVisualIds]);

  // Step 2: Start Exam Run with active mic stream
  const handleStartExamRun = useCallback((stream: MediaStream) => {
    activeMediaStreamRef.current = stream;
    setStage('run');
  }, []);

  // Step 3: Exam finished
  const handleExamFinished = useCallback((result: MockExamResult) => {
    setExamResult(result);
    setStage('finish');
  }, []);

  // Step 4: Proceed from finish transition to results
  const handleProceedToResult = useCallback(() => {
    setStage('result');
  }, []);

  // Retake exam
  const handleRetakeExam = useCallback(() => {
    setExamResult(null);
    setExamQuestions([]);
    setPickedVisualItem(null);
    setStage('intro');
  }, []);

  // Abort exam
  const handleAbortExam = useCallback(() => {
    if (activeMediaStreamRef.current) {
      try {
        activeMediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      activeMediaStreamRef.current = null;
    }
    setStage('intro');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-16">
      {stage === 'intro' && (
        <MockIntro
          blueprint={DEFAULT_MOCK_EXAM_BLUEPRINT}
          remainingTickets={entitlement.remainingTickets}
          onProceedToCheck={handleProceedToCheck}
          onCancel={onGoHome}
        />
      )}

      {stage === 'check' && (
        <MockCheck
          entitlement={entitlement}
          onStartExam={handleStartExamRun}
          onBackToIntro={() => setStage('intro')}
        />
      )}

      {stage === 'run' && pickedVisualItem && activeMediaStreamRef.current && (
        <MockRun
          blueprint={DEFAULT_MOCK_EXAM_BLUEPRINT}
          questions={examQuestions}
          pickedVisualType={pickedVisualType}
          pickedVisualItem={pickedVisualItem}
          mediaStream={activeMediaStreamRef.current}
          onExamFinished={handleExamFinished}
          onAbortExam={handleAbortExam}
        />
      )}

      {stage === 'finish' && examResult && (
        <MockFinish
          result={examResult}
          onProceedToResult={handleProceedToResult}
        />
      )}

      {stage === 'result' && examResult && (
        <MockResult
          result={examResult}
          onRetakeExam={handleRetakeExam}
          onGoHome={onGoHome}
        />
      )}
    </div>
  );
};
