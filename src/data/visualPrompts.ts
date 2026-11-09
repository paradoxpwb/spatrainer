/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VisualPromptQuestion } from '../types/question';

/**
 * Practice questions for Area 5 (Visual & Chart-based Response).
 * In Area 5, all visual prompts are authentic data charts (bar charts, pie/donut charts,
 * trend graphs, and comparative metric charts) designed for speaking evaluations.
 */
export const VISUAL_PROMPTS: VisualPromptQuestion[] = [
  {
    id: 'vis-op-01',
    practiceArea: 'area-5-visual-prompt',
    topic: 'opinion',
    difficulty: 'intermediate',
    practiceMode: 'visual-prompt',
    visualType: 'graph',
    visualAlt:
      'Survey pie and bar chart displaying employee preferences for future office layouts: 55% prefer quiet private focus pods, 25% prefer open collaborative benches, and 20% prefer flexible hot-desking.',
    title: 'Employee Office Space Preference Survey',
    question:
      'Based on the survey results, describe the dominant preferences of employees and give your opinion on how the company should renovate the new office building.',
    expectedElements: [
      'Majority (55%) demand private focus pods over open spaces',
      'Open collaborative benches at 25% and hot-desking at 20%',
      'Your logical recommendation for spatial renovation and budget distribution',
    ],
    taskType: 'recommendation',
    category: 'opinion',
    categoryLabel: '의견',
  },
  {
    id: 'vis-wp-02',
    practiceArea: 'area-5-visual-prompt',
    topic: 'workplace',
    difficulty: 'basic',
    practiceMode: 'visual-prompt',
    visualType: 'graph',
    visualAlt:
      'Monthly trend column chart illustrating customer inquiry response times from January (45 min) to June (12 min), showing a target SLA line at 15 minutes and sharp drop in April.',
    title: 'Customer Response Time Trends (Jan - Jun)',
    question:
      'Review the monthly response time trend chart. Describe the overall change in response time from January to June and explain what might have caused the significant improvement starting in April.',
    expectedElements: [
      'January to March average was high at 40-45 minutes',
      'Sharp drop in April down to 18 minutes, continuing down to 12 minutes in June',
      'Plausible business explanations such as AI ticket routing, automated triage, or staff training',
    ],
    taskType: 'explain-trend',
    category: 'work',
    categoryLabel: '직장생활',
  },
  {
    id: 'vis-wp-01',
    practiceArea: 'area-5-visual-prompt',
    topic: 'workplace',
    difficulty: 'intermediate',
    practiceMode: 'visual-prompt',
    visualType: 'graph',
    visualAlt:
      'Comparative bar chart illustrating quarterly productivity, overtime hours, and budget compliance across three software development teams: Team Alpha, Team Beta, and Team Gamma.',
    title: 'Development Teams Performance & Overtime Chart',
    question:
      'Review the team performance comparison chart below. Compare the completion rates and overtime hours among the three teams, and explain which team performed most efficiently this quarter.',
    expectedElements: [
      'Team Alpha: 94% task completion, 12 overtime hours/month, 98% budget used',
      'Team Beta: 82% task completion, 28 overtime hours/month, 104% budget (over)',
      'Team Gamma: 91% task completion, 15 overtime hours/month, 95% budget',
      'Evaluation of which team had the best balance of output vs extra hours',
    ],
    taskType: 'compare',
    category: 'work',
    categoryLabel: '직장생활',
  },
  {
    id: 'vis-dl-01',
    practiceArea: 'area-5-visual-prompt',
    topic: 'daily-life',
    difficulty: 'basic',
    practiceMode: 'visual-prompt',
    visualType: 'graph',
    visualAlt:
      'Comparative feature utilization and cost chart between Plan A ($60/month basic) and Plan B ($85/month all-inclusive wellness).',
    title: 'Fitness Membership Cost & Feature Value Comparison Chart',
    question:
      'Compare the features, pricing, and utilization rates of Plan A and Plan B in the chart. Which plan would you choose for yourself or recommend to a busy office worker, and why?',
    expectedElements: [
      'Plan A: $60/month with focus on gym access and 2 PT sessions',
      'Plan B: $85/month with pool, sauna, and unlimited yoga/pilates classes',
      'Personal recommendation supported by practical lifestyle or budget reasoning',
    ],
    taskType: 'preference',
    category: 'daily-life',
    categoryLabel: '일상생활',
  },
  {
    id: 'vis-ps-01',
    practiceArea: 'area-5-visual-prompt',
    topic: 'problem-solving',
    difficulty: 'intermediate',
    practiceMode: 'visual-prompt',
    visualType: 'graph',
    visualAlt:
      'Comparative contingency trade-off chart analyzing Option 1 (On-demand courier) vs Option 2 (Truck re-routing) in response to a delivery vehicle breakdown.',
    title: 'Urgent Logistics Dispatch: Contingency Risk & Cost Chart',
    question:
      'Examine the logistics contingency analysis chart below. Describe the immediate problem, evaluate Option 1 and Option 2 in terms of cost and delivery delay, and state your final action plan.',
    expectedElements: [
      'Vehicle breakdown affecting 15 priority retail stores scheduled before 2:00 PM',
      'Option 1: Extra cost +$1,200 (+100%), 0 min delay (100% on-time guarantee)',
      'Option 2: Extra cost +$180 (+15%), 90 min delivery delay with 20% cancellation risk',
      'Clear decision with cost-benefit trade-off rationale',
    ],
    taskType: 'recommendation',
    category: 'problem-solving',
    categoryLabel: '문제 해결',
  },
  {
    id: 'vis-tl-01',
    practiceArea: 'area-5-visual-prompt',
    topic: 'travel-leisure',
    difficulty: 'basic',
    practiceMode: 'visual-prompt',
    visualType: 'graph',
    visualAlt:
      'Comparative transit time, departure interval, and on-time reliability chart for Express Train, Airport Limousine Bus, and Terminal Shuttle to Downtown City Center.',
    title: 'Terminal 2 Transit Times & Departure Frequency Chart',
    question:
      'Examine the transit time and departure frequency chart. Advise an international passenger arriving at Gate 4 on the best transit option to reach Downtown City Center, comparing travel time and convenience.',
    expectedElements: [
      'Express Train (Level B1): 22 min travel time, 10 min departure interval, 99% reliability',
      'Airport Limousine Bus (Level 1): 45 min travel time, 15 min interval, 85% reliability',
      'Terminal Shuttle + Metro: 58 min travel time, 5 min interval, 92% reliability',
      'Clear passenger guidance emphasizing speed and platform access',
    ],
    taskType: 'describe',
    category: 'travel-leisure',
    categoryLabel: '여행 및 여가',
  },
];
