/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VisualPromptQuestion } from '../../types/question';
import { BarChart3, TrendingUp, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface VisualPromptCardProps {
  question: VisualPromptQuestion;
  compact?: boolean;
}

export const VisualPromptCard: React.FC<VisualPromptCardProps> = ({ question, compact = false }) => {
  const getTaskBadge = (taskType?: string) => {
    switch (taskType) {
      case 'compare':
        return { label: '비교 및 대조 (Compare)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' };
      case 'explain-trend':
        return { label: '추세 설명 (Explain Trend)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
      case 'preference':
        return { label: '선호도 선택 (Preference)', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
      case 'recommendation':
        return { label: '제안 및 권고 (Recommendation)', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' };
      case 'describe':
      default:
        return { label: '상세 묘사 (Describe)', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' };
    }
  };

  const badge = getTaskBadge(question.taskType);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
      {/* Visual Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <span className="text-slate-900 dark:text-slate-100 font-bold">
            Area 5 · 시각 자료 제시문
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</span>
          <span className="uppercase text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-wider">
            CHART GRAPHIC
          </span>
        </div>

        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Question Title */}
      {question.title && (
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
          {question.title}
        </h3>
      )}

      {/* Visual Material Box - Real Chart Container */}
      <div className="mb-4 p-3 sm:p-5 rounded-xl bg-slate-50/90 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700">
        {/* ========================================================================= */}
        {/* CHART 1: vis-wp-01 Development Teams Performance & Overtime Dual-Axis Grouped Bar Chart */}
        {/* ========================================================================= */}
        {question.id === 'vis-wp-01' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Quarterly Productivity (%) vs. Overtime Hours per Member
              </span>
              <div className="flex items-center gap-3 text-[11px] flex-wrap">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                  <span>Task Completion (%) [Left Axis]</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-3 h-3 rounded-xs bg-blue-500"></span>
                  <span>Overtime (hrs/mo) [Right Axis]</span>
                </span>
              </div>
            </div>

            {/* REAL SVG GROUPED COLUMN BAR CHART */}
            <div className="w-full bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-750 shadow-2xs">
              <svg
                viewBox="0 0 540 290"
                className="w-full h-auto overflow-visible select-none"
                aria-label="Development Teams Performance and Overtime Grouped Column Chart"
              >
                <defs>
                  <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                  <linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" />
                    <stop offset="100%" stopColor="#E11D48" />
                  </linearGradient>
                  <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>

                {/* Left Y-Axis labels (Task Completion %: 0% to 100%) */}
                <text x="40" y="44" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">100%</text>
                <text x="40" y="89" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">75%</text>
                <text x="40" y="134" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">50%</text>
                <text x="40" y="179" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">25%</text>
                <text x="40" y="224" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">0%</text>

                {/* Right Y-Axis labels (Overtime: 0 to 30 hrs/mo) */}
                <text x="500" y="44" textAnchor="start" className="text-[10px] font-semibold fill-slate-400">30h</text>
                <text x="500" y="104" textAnchor="start" className="text-[10px] font-semibold fill-slate-400">20h</text>
                <text x="500" y="164" textAnchor="start" className="text-[10px] font-semibold fill-slate-400">10h</text>
                <text x="500" y="224" textAnchor="start" className="text-[10px] font-semibold fill-slate-400">0h</text>

                {/* Horizontal Dashed Gridlines */}
                <line x1="48" y1="40" x2="492" y2="40" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="48" y1="85" x2="492" y2="85" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="48" y1="130" x2="492" y2="130" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="48" y1="175" x2="492" y2="175" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                {/* Baseline Axis */}
                <line x1="48" y1="220" x2="492" y2="220" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="1.5" />

                {/* ================= CLUSTER 1: Team Alpha (x center = 125) ================= */}
                {/* Completion Bar (94% = 169.2px) */}
                <rect x="98" y="50.8" width="26" height="169.2" rx="4" fill="url(#gradEmerald)" />
                <text x="111" y="44" textAnchor="middle" className="text-[11px] font-extrabold fill-emerald-600 dark:fill-emerald-400">94%</text>

                {/* Overtime Bar (12h of 30h = 40% = 72px) */}
                <rect x="128" y="148" width="26" height="72" rx="4" fill="url(#gradBlue)" />
                <text x="141" y="141" textAnchor="middle" className="text-[11px] font-extrabold fill-blue-600 dark:fill-blue-400">12h</text>

                {/* Team Alpha X Label */}
                <text x="125" y="242" textAnchor="middle" className="text-xs font-bold fill-slate-900 dark:fill-slate-100">Team Alpha</text>
                <text x="125" y="258" textAnchor="middle" className="text-[10px] font-semibold fill-emerald-600 dark:fill-emerald-400">최고 효율 (예산 98%)</text>

                {/* ================= CLUSTER 2: Team Beta (x center = 270) ================= */}
                {/* Completion Bar (82% = 147.6px) */}
                <rect x="243" y="72.4" width="26" height="147.6" rx="4" fill="url(#gradAmber)" />
                <text x="256" y="65" textAnchor="middle" className="text-[11px] font-extrabold fill-amber-600 dark:fill-amber-400">82%</text>

                {/* Overtime Bar (28h of 30h = 93.3% = 168px) */}
                <rect x="273" y="52" width="26" height="168" rx="4" fill="url(#gradRose)" />
                <text x="286" y="45" textAnchor="middle" className="text-[11px] font-extrabold fill-rose-600 dark:fill-rose-400">28h ⚠️</text>

                {/* Team Beta X Label */}
                <text x="270" y="242" textAnchor="middle" className="text-xs font-bold fill-slate-900 dark:fill-slate-100">Team Beta</text>
                <text x="270" y="258" textAnchor="middle" className="text-[10px] font-semibold fill-rose-600 dark:fill-rose-400">야근 과다 (예산 104% 초과)</text>

                {/* ================= CLUSTER 3: Team Gamma (x center = 415) ================= */}
                {/* Completion Bar (91% = 163.8px) */}
                <rect x="388" y="56.2" width="26" height="163.8" rx="4" fill="url(#gradEmerald)" />
                <text x="401" y="49" textAnchor="middle" className="text-[11px] font-extrabold fill-emerald-600 dark:fill-emerald-400">91%</text>

                {/* Overtime Bar (15h of 30h = 50% = 90px) */}
                <rect x="418" y="130" width="26" height="90" rx="4" fill="url(#gradBlue)" />
                <text x="431" y="123" textAnchor="middle" className="text-[11px] font-extrabold fill-blue-600 dark:fill-blue-400">15h</text>

                {/* Team Gamma X Label */}
                <text x="415" y="242" textAnchor="middle" className="text-xs font-bold fill-slate-900 dark:fill-slate-100">Team Gamma</text>
                <text x="415" y="258" textAnchor="middle" className="text-[10px] font-semibold fill-slate-500 dark:text-slate-400">안정 완수 (예산 95%)</text>
              </svg>
            </div>

            {/* Quick Metric Matrix Table */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">Team Alpha</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">완수 94% · 야근 12h</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">예산 98% 준수</div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                <div className="font-bold text-rose-900 dark:text-rose-200">Team Beta</div>
                <div className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">완수 82% · 야근 28h</div>
                <div className="text-[10px] text-rose-600 font-semibold mt-0.5">예산 104% 초과</div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="font-bold text-blue-900 dark:text-blue-200">Team Gamma</div>
                <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">완수 91% · 야근 15h</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-0.5">예산 95% 절감</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHART 2: vis-op-01 Employee Office Space Preference Survey (Real Pie & Donut Chart) */}
        {/* ========================================================================= */}
        {question.id === 'vis-op-01' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Survey Results: Which workspace arrangement do you find most conducive to focus?
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                Sample N = 450 HQ Employees
              </span>
            </div>

            {/* REAL SVG PIE / DONUT CHART WITH DATA CALLOUTS */}
            <div className="w-full bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-750 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* SVG Circular Donut Chart */}
                <div className="md:col-span-6 flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-full h-full -rotate-90 transform select-none"
                      aria-label="Survey Pie Chart: 55% Quiet Pods, 25% Open Benches, 20% Hot-desking"
                    >
                      {/* Circumference = 2 * PI * 65 ≈ 408.4 */}
                      {/* Background circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="65"
                        className="stroke-slate-100 dark:stroke-slate-800"
                        strokeWidth="32"
                        fill="transparent"
                      />

                      {/* Slice 1: Quiet Private Focus Pods - 55% (0.55 * 408.4 = 224.6) */}
                      <circle
                        cx="100"
                        cy="100"
                        r="65"
                        stroke="#2563EB"
                        strokeWidth="32"
                        strokeDasharray="224.6 408.4"
                        strokeDashoffset="0"
                        fill="transparent"
                        className="transition-all duration-700"
                      />

                      {/* Slice 2: Open Collaborative Benches - 25% (0.25 * 408.4 = 102.1) */}
                      <circle
                        cx="100"
                        cy="100"
                        r="65"
                        stroke="#F59E0B"
                        strokeWidth="32"
                        strokeDasharray="102.1 408.4"
                        strokeDashoffset="-224.6"
                        fill="transparent"
                        className="transition-all duration-700"
                      />

                      {/* Slice 3: Flexible Hot-desking - 20% (0.20 * 408.4 = 81.7) */}
                      <circle
                        cx="100"
                        cy="100"
                        r="65"
                        stroke="#64748B"
                        strokeWidth="32"
                        strokeDasharray="81.7 408.4"
                        strokeDashoffset="-326.7"
                        fill="transparent"
                        className="transition-all duration-700"
                      />
                    </svg>

                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">55%</span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Top Preference</span>
                      <span className="text-[9px] text-slate-400">Focus Pods</span>
                    </div>
                  </div>
                </div>

                {/* Breakdown Legend and Distribution Bars */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-blue-600"></span>
                        <span>Quiet Private Focus Pods</span>
                      </span>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">55% (248명)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '55%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
                        <span>Open Collaborative Benches</span>
                      </span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">25% (112명)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-slate-500"></span>
                        <span>Flexible Hot-desking</span>
                      </span>
                      <span className="text-sm font-black text-slate-600 dark:text-slate-300">20% (90명)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-slate-500 h-full rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>

                  {/* 100% Stacked Distribution Scale */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Total 100% Distribution Scale
                    </span>
                    <div className="w-full h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-blue-600 h-full" style={{ width: '55%' }} title="55% Focus Pods"></div>
                      <div className="bg-amber-500 h-full" style={{ width: '25%' }} title="25% Benches"></div>
                      <div className="bg-slate-500 h-full" style={{ width: '20%' }} title="20% Hot-desks"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>0%</span>
                      <span>55%</span>
                      <span>80%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHART 3: vis-wp-02 Customer Response Time Trends (Real Column & Trendline Combo Chart) */}
        {/* ========================================================================= */}
        {question.id === 'vis-wp-02' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Monthly Average Customer Inquiry Response Times (Minutes)
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>SLA Target Met (June: 12m)</span>
                </span>
              </div>
            </div>

            {/* REAL SVG COLUMN & TRENDLINE CHART */}
            <div className="w-full bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-750 shadow-2xs">
              <svg
                viewBox="0 0 540 280"
                className="w-full h-auto overflow-visible select-none"
                aria-label="Monthly Customer Inquiry Response Time Trend Line and Column Chart"
              >
                <defs>
                  <linearGradient id="colSlate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#64748B" />
                  </linearGradient>
                  <linearGradient id="colBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                  <linearGradient id="colEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Ticks (0m to 50m) */}
                <text x="35" y="44" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">50m</text>
                <text x="35" y="79" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">40m</text>
                <text x="35" y="114" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">30m</text>
                <text x="35" y="149" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">20m</text>
                <text x="35" y="184" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">10m</text>
                <text x="35" y="219" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">0m</text>

                {/* Horizontal Gridlines */}
                <line x1="42" y1="40" x2="510" y2="40" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="42" y1="75" x2="510" y2="75" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="42" y1="110" x2="510" y2="110" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="42" y1="145" x2="510" y2="145" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="42" y1="180" x2="510" y2="180" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />

                {/* Target SLA Guideline at 15m (y = 215 - (15/50)*175 = 162.5) */}
                <line x1="42" y1="162.5" x2="510" y2="162.5" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" />
                <rect x="420" y="152" width="88" height="18" rx="4" fill="#FEE2E2" />
                <text x="464" y="165" textAnchor="middle" className="text-[10px] font-bold fill-rose-700">SLA Target: 15m</text>

                {/* Baseline Axis */}
                <line x1="42" y1="215" x2="510" y2="215" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="1.5" />

                {/* Monthly Column Bars (scale: height = (val / 50) * 175, y = 215 - height) */}
                {/* Jan: 45m -> h=157.5, y=57.5, x=80 */}
                <rect x="62" y="57.5" width="36" height="157.5" rx="4" fill="url(#colSlate)" />
                <text x="80" y="50" textAnchor="middle" className="text-xs font-bold fill-slate-700 dark:fill-slate-200">45m</text>
                <text x="80" y="235" textAnchor="middle" className="text-xs font-semibold fill-slate-600 dark:fill-slate-400">Jan</text>

                {/* Feb: 42m -> h=147, y=68, x=154 */}
                <rect x="136" y="68" width="36" height="147" rx="4" fill="url(#colSlate)" />
                <text x="154" y="61" textAnchor="middle" className="text-xs font-bold fill-slate-700 dark:fill-slate-200">42m</text>
                <text x="154" y="235" textAnchor="middle" className="text-xs font-semibold fill-slate-600 dark:fill-slate-400">Feb</text>

                {/* Mar: 40m -> h=140, y=75, x=228 */}
                <rect x="210" y="75" width="36" height="140" rx="4" fill="url(#colSlate)" />
                <text x="228" y="68" textAnchor="middle" className="text-xs font-bold fill-slate-700 dark:fill-slate-200">40m</text>
                <text x="228" y="235" textAnchor="middle" className="text-xs font-semibold fill-slate-600 dark:fill-slate-400">Mar</text>

                {/* Apr: 18m -> h=63, y=152, x=302 */}
                <rect x="284" y="152" width="36" height="63" rx="4" fill="url(#colBlue)" stroke="#60A5FA" strokeWidth="2" />
                <text x="302" y="145" textAnchor="middle" className="text-xs font-extrabold fill-blue-600 dark:fill-blue-400">18m*</text>
                <text x="302" y="235" textAnchor="middle" className="text-xs font-bold fill-blue-600 dark:fill-blue-400">Apr*</text>

                {/* May: 15m -> h=52.5, y=162.5, x=376 */}
                <rect x="358" y="162.5" width="36" height="52.5" rx="4" fill="url(#colBlue)" />
                <text x="376" y="155" textAnchor="middle" className="text-xs font-bold fill-blue-600 dark:fill-blue-400">15m</text>
                <text x="376" y="235" textAnchor="middle" className="text-xs font-semibold fill-slate-600 dark:fill-slate-400">May</text>

                {/* Jun: 12m -> h=42, y=173, x=450 */}
                <rect x="432" y="173" width="36" height="42" rx="4" fill="url(#colEmerald)" />
                <text x="450" y="166" textAnchor="middle" className="text-xs font-bold fill-emerald-600 dark:fill-emerald-400">12m</text>
                <text x="450" y="235" textAnchor="middle" className="text-xs font-bold fill-emerald-600 dark:fill-emerald-400">Jun</text>

                {/* Trendline Curve overlay */}
                <path
                  d="M 80 57.5 L 154 68 L 228 75 L 302 152 L 376 162.5 L 450 173"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeDasharray="none"
                />
                {/* Data points on trendline */}
                <circle cx="80" cy="57.5" r="4.5" fill="#2563EB" stroke="#fff" strokeWidth="2" />
                <circle cx="154" cy="68" r="4.5" fill="#2563EB" stroke="#fff" strokeWidth="2" />
                <circle cx="228" cy="75" r="4.5" fill="#2563EB" stroke="#fff" strokeWidth="2" />
                <circle cx="302" cy="152" r="5" fill="#2563EB" stroke="#fff" strokeWidth="2" />
                <circle cx="376" cy="162.5" r="4.5" fill="#2563EB" stroke="#fff" strokeWidth="2" />
                <circle cx="450" cy="173" r="5" fill="#10B981" stroke="#fff" strokeWidth="2" />

                {/* System Launch Callout Box pointing to April */}
                <rect x="236" y="104" width="132" height="24" rx="4" fill="#1E40AF" />
                <text x="302" y="120" textAnchor="middle" className="text-[10px] font-bold fill-white">★ AI 자동 라우팅 도입</text>
                <line x1="302" y1="128" x2="302" y2="148" stroke="#1E40AF" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>*4월: AI 자동 문의 분류 및 챗봇 1차 응대 솔루션 가동</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">1월(45분) 대비 6월(12분) 73.3% 응답 시간 단축</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHART 4: vis-dl-01 Fitness Membership Feature & Price Comparison Chart */}
        {/* ========================================================================= */}
        {question.id === 'vis-dl-01' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Fitness Membership Comparative Rating & Feature Access Chart
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                  <span className="w-3 h-3 rounded-xs bg-indigo-500"></span>
                  <span>Plan A ($60/mo)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                  <span>Plan B ($85/mo)</span>
                </span>
              </div>
            </div>

            {/* REAL SVG HORIZONTAL COMPARATIVE BAR CHART */}
            <div className="w-full bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-750 shadow-2xs">
              <svg
                viewBox="0 0 540 260"
                className="w-full h-auto overflow-visible select-none"
                aria-label="Fitness Membership Feature Value Comparison Bar Chart"
              >
                {/* Vertical Gridlines at 0%, 25%, 50%, 75%, 100% */}
                <line x1="160" y1="20" x2="160" y2="215" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" />
                <line x1="242.5" y1="20" x2="242.5" y2="215" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="325" y1="20" x2="325" y2="215" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="407.5" y1="20" x2="407.5" y2="215" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="490" y1="20" x2="490" y2="215" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />

                <text x="160" y="230" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">0%</text>
                <text x="242.5" y="230" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">25%</text>
                <text x="325" y="230" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">50%</text>
                <text x="407.5" y="230" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">75%</text>
                <text x="490" y="230" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">100%</text>

                {/* ROW 1: 24/7 Gym Floor Access */}
                <text x="150" y="44" textAnchor="end" className="text-xs font-bold fill-slate-800 dark:fill-slate-200">24/7 Gym Access</text>
                <rect x="160" y="32" width="330" height="12" rx="3" fill="#6366F1" />
                <rect x="160" y="46" width="330" height="12" rx="3" fill="#10B981" />
                <text x="496" y="42" textAnchor="start" className="text-[10px] font-bold fill-indigo-600">100%</text>
                <text x="496" y="56" textAnchor="start" className="text-[10px] font-bold fill-emerald-600">100%</text>

                {/* ROW 2: Pool & Thermal Sauna */}
                <text x="150" y="90" textAnchor="end" className="text-xs font-bold fill-slate-800 dark:fill-slate-200">Pool & Sauna</text>
                <rect x="160" y="78" width="0" height="12" rx="3" fill="#CBD5E1" />
                <text x="165" y="88" textAnchor="start" className="text-[10px] font-bold fill-slate-400">None (0%)</text>
                <rect x="160" y="92" width="330" height="12" rx="3" fill="#10B981" />
                <text x="496" y="102" textAnchor="start" className="text-[10px] font-bold fill-emerald-600">Included (100%)</text>

                {/* ROW 3: Group Pilates & PT */}
                <text x="150" y="136" textAnchor="end" className="text-xs font-bold fill-slate-800 dark:fill-slate-200">Pilates & PT</text>
                <rect x="160" y="124" width="82.5" height="12" rx="3" fill="#6366F1" />
                <text x="248" y="134" textAnchor="start" className="text-[10px] font-bold fill-indigo-600">2 PT (25%)</text>
                <rect x="160" y="138" width="313.5" height="12" rx="3" fill="#10B981" />
                <text x="480" y="148" textAnchor="start" className="text-[10px] font-bold fill-emerald-600">Unlimited (95%)</text>

                {/* ROW 4: Overall Member Satisfaction */}
                <text x="150" y="182" textAnchor="end" className="text-xs font-bold fill-slate-800 dark:fill-slate-200">Satisfaction Score</text>
                <rect x="160" y="170" width="244.2" height="12" rx="3" fill="#6366F1" />
                <text x="410" y="180" textAnchor="start" className="text-[10px] font-bold fill-indigo-600">74%</text>
                <rect x="160" y="184" width="303.6" height="12" rx="3" fill="#10B981" />
                <text x="470" y="194" textAnchor="start" className="text-[10px] font-bold fill-emerald-600">92%</text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                <div className="font-bold text-indigo-950 dark:text-indigo-200">Plan A: $60 / month</div>
                <div className="text-[11px] text-indigo-800 dark:text-indigo-300 mt-1">
                  웨이트/유산소 전용 회원 적합 · PT 2회 제공 · 수영/사우나 미포함
                </div>
              </div>
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="font-bold text-emerald-950 dark:text-emerald-200">Plan B: $85 / month (추천)</div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1">
                  월 $25 추가로 수영장, 사우나, 무제한 필라테스/요가 전면 이용
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHART 5: vis-ps-01 Logistics Incident Contingency Risk & Cost Chart */}
        {/* ========================================================================= */}
        {question.id === 'vis-ps-01' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Logistics Crisis Contingency: Additional Cost ($) vs. Expected Delay (Min)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-bold">
                15 Stores Impacted
              </span>
            </div>

            {/* REAL SVG CONTINGENCY TRADE-OFF CHART */}
            <div className="w-full bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-750 shadow-2xs">
              <svg
                viewBox="0 0 540 230"
                className="w-full h-auto overflow-visible select-none"
                aria-label="Contingency Options Cost and Delay Tradeoff Bar Chart"
              >
                {/* Horizontal gridlines */}
                <line x1="50" y1="40" x2="490" y2="40" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50" y1="95" x2="490" y2="95" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50" y1="150" x2="490" y2="150" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />

                {/* Option 1 Cluster */}
                <text x="145" y="24" textAnchor="middle" className="text-xs font-bold fill-indigo-900 dark:fill-indigo-300">Option 1: On-Demand Courier Express</text>
                {/* Cost Bar: $1,200 */}
                <rect x="75" y="40" width="60" height="130" rx="4" fill="#F43F5E" />
                <text x="105" y="32" textAnchor="middle" className="text-xs font-bold fill-rose-600">+$1,200 (비용)</text>
                {/* Delay Bar: 0m */}
                <rect x="145" y="166" width="60" height="4" rx="2" fill="#10B981" />
                <text x="175" y="160" textAnchor="middle" className="text-xs font-bold fill-emerald-600">0분 지연 (정시)</text>

                {/* Option 2 Cluster */}
                <text x="395" y="24" textAnchor="middle" className="text-xs font-bold fill-amber-900 dark:fill-amber-300">Option 2: Re-Route Secondary Truck #2</text>
                {/* Cost Bar: $180 */}
                <rect x="325" y="150.5" width="60" height="19.5" rx="4" fill="#10B981" />
                <text x="355" y="142" textAnchor="middle" className="text-xs font-bold fill-emerald-600">+$180 (절감)</text>
                {/* Delay Bar: 90m */}
                <rect x="395" y="72.5" width="60" height="97.5" rx="4" fill="#F59E0B" />
                <text x="425" y="64" textAnchor="middle" className="text-xs font-bold fill-amber-600">+90분 지연 ⚠️</text>

                {/* Baseline */}
                <line x1="50" y1="170" x2="490" y2="170" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="1.5" />

                {/* X labels */}
                <text x="145" y="195" textAnchor="middle" className="text-xs font-bold fill-slate-800 dark:fill-slate-200">옵션 1 (추가비용 100% / 납기 100% 보장)</text>
                <text x="395" y="195" textAnchor="middle" className="text-xs font-bold fill-slate-800 dark:fill-slate-200">옵션 2 (비용 15% / 오후 배송 90분 지연)</text>
              </svg>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>핵심 의사결정 쟁점:</strong> 비용 2배를 감수하고 고객 신뢰 및 위약금을 방지할 것인가(옵션 1), 비용을 아끼되 3개 매장 지연 사전 안내 조치를 취할 것인가(옵션 2)?
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHART 6: vis-tl-01 Terminal 2 Transit Times & Frequency Chart */}
        {/* ========================================================================= */}
        {question.id === 'vis-tl-01' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Airport Terminal 2 to Downtown City Center Transit Mode Comparison Chart
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Gate 4 Arrival Standard</span>
            </div>

            {/* REAL SVG HORIZONTAL TIMELINE BAR CHART */}
            <div className="w-full bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-750 shadow-2xs">
              <svg
                viewBox="0 0 540 230"
                className="w-full h-auto overflow-visible select-none"
                aria-label="Airport Transit Options Travel Time and Frequency Chart"
              >
                {/* Vertical Time Gridlines: 0, 15, 30, 45, 60 min */}
                <line x1="170" y1="20" x2="170" y2="175" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" />
                <line x1="250" y1="20" x2="250" y2="175" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="330" y1="20" x2="330" y2="175" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="410" y1="20" x2="410" y2="175" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="490" y1="20" x2="490" y2="175" className="stroke-slate-200 dark:stroke-slate-750" strokeWidth="1" strokeDasharray="3 3" />

                <text x="170" y="195" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">0 min</text>
                <text x="250" y="195" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">15 min</text>
                <text x="330" y="195" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">30 min</text>
                <text x="410" y="195" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">45 min</text>
                <text x="490" y="195" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">60 min</text>

                {/* ROW 1: Express Train (Level B1) - 22 min */}
                <text x="160" y="44" textAnchor="end" className="text-xs font-bold fill-blue-600 dark:fill-blue-400">Express Train (B1)</text>
                <rect x="170" y="30" width="117.3" height="22" rx="4" fill="#2563EB" />
                <text x="295" y="45" textAnchor="start" className="text-xs font-extrabold fill-blue-600">22분 (배차 10분 · 99% 정시)</text>

                {/* ROW 2: Limousine Bus (1F Gate 4) - 45 min */}
                <text x="160" y="94" textAnchor="end" className="text-xs font-bold fill-amber-600 dark:fill-amber-400">Limousine Bus (1F)</text>
                <rect x="170" y="80" width="240" height="22" rx="4" fill="#F59E0B" />
                <text x="418" y="95" textAnchor="start" className="text-xs font-bold fill-amber-600">45분 (배차 15분 · 정체변수)</text>

                {/* ROW 3: Terminal Shuttle + Subway - 58 min */}
                <text x="160" y="144" textAnchor="end" className="text-xs font-bold fill-slate-600 dark:fill-slate-300">Shuttle + Subway</text>
                <rect x="170" y="130" width="309.3" height="22" rx="4" fill="#64748B" />
                <text x="486" y="145" textAnchor="start" className="text-xs font-bold fill-slate-600">58분 (배차 5분)</text>
              </svg>
            </div>

            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
              <span><strong>환승 추천 안내:</strong> 4번 게이트 앞 에스컬레이터를 타고 지하 1층 직통열차 탑승 시 도심까지 22분 만에 도착.</span>
            </div>
          </div>
        )}

        {/* Accessibility Visual Alt description */}
        <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 italic">
          [자료 설명: {question.visualAlt}]
        </p>
      </div>

      {/* Expected Elements Preview (if not compact) */}
      {!compact && question.expectedElements && question.expectedElements.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            답변에 포함할 핵심 포인트:
          </span>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
            {question.expectedElements.map((elem, idx) => (
              <li key={idx}>{elem}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
