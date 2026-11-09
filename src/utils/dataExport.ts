import { StoredPracticeData } from '../types/practiceSession';
import { CURRENT_SCHEMA_VERSION, loadStoredPracticeData } from './storageMigrations';

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  app: string;
  sessions: StoredPracticeData['sessions'];
  attempts: StoredPracticeData['attempts'];
  goals: StoredPracticeData['goals'];
  preferences: StoredPracticeData['preferences'];
}

/**
 * Pure function: Generates a clean, sanitized export payload from given practice data.
 * Guarantees that audio Blobs, object URLs, MediaStreams, and API keys are never included.
 */
export function exportPracticeData(data: StoredPracticeData): ExportPayload {
  const sanitizedAttempts = (data.attempts || []).map((a) => ({
    id: a.id,
    sessionId: a.sessionId,
    attemptNumber: a.attemptNumber || 1,
    parentAttemptId: a.parentAttemptId,
    retrySource: a.retrySource,
    retryContext: a.retryContext,
    questionId: a.questionId,
    category: a.category,
    categoryLabel: a.categoryLabel,
    question: a.question,
    recordedAt: a.recordedAt,
    recordingDurationSeconds: a.recordingDurationSeconds,
    originalTranscript: a.originalTranscript,
    editedTranscript: a.editedTranscript,
    metrics: a.metrics,
    transcriptionStatus: a.transcriptionStatus,
    aiCoaching: a.aiCoaching
      ? {
          status: a.aiCoaching.status,
          promptVersion: a.aiCoaching.promptVersion,
          transcriptHash: a.aiCoaching.transcriptHash,
          feedbackLanguage: a.aiCoaching.feedbackLanguage,
          desiredAnswerLevel: a.aiCoaching.desiredAnswerLevel,
          generatedAt: a.aiCoaching.generatedAt,
          result: a.aiCoaching.result,
        }
      : undefined,
  }));

  return {
    schemaVersion: data.schemaVersion,
    exportedAt: new Date().toISOString(),
    app: 'SPA Speaking Trainer',
    sessions: data.sessions || [],
    attempts: sanitizedAttempts,
    goals: data.goals || [],
    preferences: data.preferences,
  };
}

/**
 * Loads current stored practice data and returns sanitized ExportPayload.
 */
export function generateExportData(): ExportPayload {
  const data = loadStoredPracticeData();
  return exportPracticeData(data);
}

/**
 * Triggers a browser download of the user's practice data as a JSON file.
 */
export function downloadBackupFile(): boolean {
  try {
    const payload = generateExportData();
    const jsonStr = JSON.stringify(payload, null, 2);

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const filename = `spa-speaking-trainer-backup-${yyyy}-${mm}-${dd}.json`;

    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to export backup file:', err);
    return false;
  }
}
