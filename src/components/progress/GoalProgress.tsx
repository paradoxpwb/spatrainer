import React, { useState } from 'react';
import { PracticeGoal } from '../../types/goals';
import { Target, Edit2, CheckCircle2, Check, X } from 'lucide-react';

interface GoalProgressProps {
  goals: PracticeGoal[];
  onUpdateGoals: (goals: PracticeGoal[]) => void;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goals, onUpdateGoals }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftGoals, setDraftGoals] = useState<PracticeGoal[]>(goals);

  const handleStartEdit = () => {
    setDraftGoals(goals.map((g) => ({ ...g })));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdateGoals(draftGoals);
    setIsEditing(false);
  };

  const handleChangeTarget = (id: string, value: number) => {
    setDraftGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        // Clamp boundaries according to specs
        let clamped = value;
        if (g.type === 'weekly-attempts') clamped = Math.max(1, Math.min(30, value));
        else if (g.type === 'weekly-days') clamped = Math.max(1, Math.min(7, value));
        else if (g.type === 'weekly-retries') clamped = Math.max(0, Math.min(20, value));
        return { ...g, targetValue: clamped, updatedAt: new Date().toISOString() };
      })
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              이번 주 연습 목표 (Weekly Goals)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              월요일부터 일요일까지 주간 단위로 계산되는 개인 자가 학습 목표입니다.
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={handleStartEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl transition-colors min-h-[36px]"
          >
            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>목표 수정</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveEdit}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>저장</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              취소
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progressPercent =
            goal.targetValue > 0
              ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
              : 100;
          const isCompleted = goal.currentValue >= goal.targetValue;
          const remaining = Math.max(0, goal.targetValue - goal.currentValue);

          return (
            <div
              key={goal.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">{goal.label}</span>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>달성</span>
                    </span>
                  )}
                </div>

                {/* Values & Progress percentage */}
                <div className="flex items-baseline justify-between mt-1 mb-2">
                  <span className="text-xl font-mono font-bold text-slate-900">
                    {goal.currentValue}
                    <span className="text-xs font-sans text-slate-400 font-normal">
                      {' '}
                      / {goal.targetValue}
                      {goal.unit}
                    </span>
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Status Note or Edit Input */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <label htmlFor={`edit-${goal.id}`} className="text-[11px] text-slate-500 shrink-0">
                      목표치:
                    </label>
                    <input
                      id={`edit-${goal.id}`}
                      type="number"
                      value={draftGoals.find((g) => g.id === goal.id)?.targetValue || goal.targetValue}
                      onChange={(e) => handleChangeTarget(goal.id, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus-visible:outline-blue-600"
                    />
                    <span className="text-xs text-slate-500">{goal.unit}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600">
                    {isCompleted
                      ? `이번 주 목표를 성공적으로 달성했습니다! (+${goal.currentValue - goal.targetValue}${goal.unit})`
                      : `이번 주 목표까지 ${remaining}${goal.unit} 남았습니다.`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
