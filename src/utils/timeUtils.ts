/**
 * Format total seconds into MM:SS string (e.g. 75 -> "01:15", 9 -> "00:09")
 */
export function formatTime(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format duration into human readable Korean representation
 * (e.g. 60 -> "60초", 75 -> "1분 15초", 120 -> "2분 00초")
 */
export function formatDurationLabel(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  if (safeSec < 60) {
    return `${safeSec}초`;
  }
  const mins = Math.floor(safeSec / 60);
  const remainder = safeSec % 60;
  if (remainder === 0) {
    return `${mins}분 (${safeSec}초)`;
  }
  return `${mins}분 ${remainder}초 (${safeSec}초)`;
}
