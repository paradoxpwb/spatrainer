import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';

interface AudioPlayerProps {
  src: string;
  blob?: Blob | null;
  fallbackDuration?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, blob, fallbackDuration = 0 }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(fallbackDuration || 0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlaybackError(null);

    const handleLoadedMetadata = () => {
      console.log('[SPA DEBUG] AudioPlayer onLoadedMetadata fired, raw duration:', audio.duration);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      } else if (fallbackDuration && fallbackDuration > 0) {
        setDuration(fallbackDuration);
      }
    };

    const handleCanPlay = () => {
      console.log('[SPA DEBUG] AudioPlayer onCanPlay fired');
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleError = () => {
      const code = audio.error ? audio.error.code : 'UNKNOWN';
      console.error(
        '[SPA DEBUG] Audio playback failed. Blob size:',
        blob?.size,
        'MIME:',
        blob?.type,
        'MediaError code:',
        code
      );
      setPlaybackError('녹음 파일을 재생하지 못했습니다. 다시 녹음해 주세요.');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [src, blob, fallbackDuration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error(
          '[SPA DEBUG] Audio play() promise rejected:',
          err,
          'Blob size:',
          blob?.size,
          'MIME:',
          blob?.type
        );
        setPlaybackError('녹음 파일을 재생하지 못했습니다. 다시 녹음해 주세요.');
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = parseFloat(e.target.value);
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().catch(() => {});
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex flex-col gap-4">
        {/* Track Title & Times */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-medium">녹음된 내 음성 재생</span>
          <div className="font-mono tabular-nums text-slate-200">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1 text-slate-500">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Seek Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            aria-label="재생 위치 탐색"
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus-visible:outline-2 focus-visible:outline-blue-400"
          />
        </div>

        {/* Error message banner */}
        {playbackError && (
          <div role="alert" className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs">
            {playbackError}
          </div>
        )}

        {/* Controls row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-400"
              title="처음부터 다시 재생"
              aria-label="처음부터 다시 재생"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 shadow-sm"
              aria-label={isPlaying ? '일시 정지' : '재생'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>일시정지</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>재생하기</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-400"
              aria-label={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
