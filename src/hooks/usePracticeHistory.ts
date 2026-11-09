import { useCallback, useEffect, useState } from 'react';
import { PracticeAttempt } from '../types/practiceAttempt';
import { clearPracticeHistory, loadPracticeHistory, savePracticeAttempt } from '../utils/practiceHistoryUtils';

export interface UsePracticeHistoryReturn {
  history: PracticeAttempt[];
  addOrUpdateAttempt: (attempt: PracticeAttempt) => void;
  clearHistory: () => void;
  reloadHistory: () => void;
}

export function usePracticeHistory(): UsePracticeHistoryReturn {
  const [history, setHistory] = useState<PracticeAttempt[]>(() => loadPracticeHistory());

  const reloadHistory = useCallback(() => {
    setHistory(loadPracticeHistory());
  }, []);

  const addOrUpdateAttempt = useCallback((attempt: PracticeAttempt) => {
    const updated = savePracticeAttempt(attempt);
    setHistory(updated);
  }, []);

  const clearHistoryCallback = useCallback(() => {
    clearPracticeHistory();
    setHistory([]);
  }, []);

  useEffect(() => {
    reloadHistory();
  }, [reloadHistory]);

  return {
    history,
    addOrUpdateAttempt,
    clearHistory: clearHistoryCallback,
    reloadHistory,
  };
}
