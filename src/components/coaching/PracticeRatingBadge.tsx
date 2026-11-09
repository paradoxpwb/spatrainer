import React from 'react';
import { PracticeRating } from '../../types/coaching';
import { CheckCircle2, TrendingUp, AlertTriangle, Star } from 'lucide-react';

interface PracticeRatingBadgeProps {
  rating: PracticeRating;
  labelPrefix?: string;
}

export const PracticeRatingBadge: React.FC<PracticeRatingBadgeProps> = ({
  rating,
  labelPrefix,
}) => {
  const getRatingConfig = () => {
    switch (rating) {
      case 'strong':
        return {
          label: '강점 있음 (Strong)',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: Star,
        };
      case 'effective':
        return {
          label: '효과적 (Effective)',
          color: 'bg-blue-50 text-blue-800 border-blue-300',
          icon: CheckCircle2,
        };
      case 'developing':
        return {
          label: '발전 중 (Developing)',
          color: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: TrendingUp,
        };
      case 'needs-development':
      default:
        return {
          label: '보완 필요 (Needs Development)',
          color: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: AlertTriangle,
        };
    }
  };

  const config = getRatingConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>
        {labelPrefix ? `${labelPrefix}: ` : ''}
        {config.label}
      </span>
    </span>
  );
};
