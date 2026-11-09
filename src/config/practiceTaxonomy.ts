/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PracticeAreaDefinition,
  PracticeAreaId,
  TopicDefinition,
  TopicId,
} from '../types/question';

/**
 * 5 Practice Area definitions for SPA Speaking Trainer.
 *
 * NOTE: The 5 Practice Areas are training taxonomy designed for effective
 * practice and DO NOT represent official fixed Part names disclosed by the test administrator.
 */
export const PRACTICE_AREAS: PracticeAreaDefinition[] = [
  {
    id: 'area-1-personal-workplace',
    order: 1,
    labelKo: '개인 및 직장 기본 문답',
    labelEn: 'Personal & Workplace Q&A',
    description: '자기소개, 일상생활, 담당 업무와 직장 경험에 관한 질문에 직접 답하는 연습',
    practiceMode: 'standard-question',
    defaultPreparationSeconds: 15,
    defaultAnswerSeconds: 60,
    enabled: true,
    availableTopicIds: [
      'self-introduction',
      'daily-life',
      'workplace',
      'experience',
      'travel-leisure',
    ],
  },
  {
    id: 'area-2-business-follow-up',
    order: 2,
    labelKo: '비즈니스 문답 및 후속 질문',
    labelEn: 'Business Q&A & Follow-up',
    description: '업무, 고객, 기술, 제품, 조직 및 문제 해결 질문에 답하고 후속 질문에 대응하는 연습',
    practiceMode: 'follow-up-question',
    defaultPreparationSeconds: 15,
    defaultAnswerSeconds: 90,
    enabled: true,
    availableTopicIds: [
      'workplace',
      'experience',
      'situation',
      'problem-solving',
    ],
  },
  {
    id: 'area-3-opinion-extended',
    order: 3,
    labelKo: '의견 및 확장 답변',
    labelEn: 'Opinion & Extended Response',
    description: '업무 또는 일반 주제에 대해 의견, 이유, 예시와 결론을 포함해 답하는 연습',
    practiceMode: 'extended-response',
    defaultPreparationSeconds: 30,
    defaultAnswerSeconds: 120,
    enabled: true,
    availableTopicIds: [
      'opinion',
      'workplace',
      'problem-solving',
      'daily-life',
      'travel-leisure',
    ],
  },
  {
    id: 'area-4-listening-summary',
    order: 4,
    labelKo: '듣기 지문 요약',
    labelEn: 'Listening Passage Summarization',
    description: '약 40~50초 분량의 영어 Passage를 두 번 듣고 핵심 내용을 요약하는 연습',
    practiceMode: 'listening-summary',
    defaultPreparationSeconds: 15,
    defaultAnswerSeconds: 60,
    enabled: true,
    availableTopicIds: [
      'workplace',
      'daily-life',
      'experience',
      'situation',
      'problem-solving',
      'travel-leisure',
      'opinion',
    ],
  },
  {
    id: 'area-5-visual-prompt',
    order: 5,
    labelKo: '시각 자료 및 제시문 답변',
    labelEn: 'Visual & Prompt-based Response',
    description: '사진, 그래프, 표, 지도 또는 짧은 제시문을 보고 묘사, 비교하거나 의견을 설명하는 연습',
    practiceMode: 'visual-prompt',
    defaultPreparationSeconds: 30,
    defaultAnswerSeconds: 90,
    enabled: true,
    availableTopicIds: [
      'workplace',
      'daily-life',
      'opinion',
      'problem-solving',
      'travel-leisure',
    ],
  },
];

/**
 * 8 Core Topics converted from legacy categories with extensibility.
 */
export const TOPICS: TopicDefinition[] = [
  {
    id: 'self-introduction',
    labelKo: '자기소개',
    labelEn: 'Self-introduction',
    description: '자신의 역할, 강점, 커리어 목표 및 개인적 특성을 설명하는 주제',
    enabled: true,
  },
  {
    id: 'daily-life',
    labelKo: '일상생활',
    labelEn: 'Daily Life',
    description: '하루 일과, 주말 활동, 건강 관리 및 일상적인 습관에 대한 주제',
    enabled: true,
  },
  {
    id: 'workplace',
    labelKo: '직장생활',
    labelEn: 'Workplace',
    description: '업무 환경, 동료와의 협업, 회의 및 직무 전문성에 관한 주제',
    enabled: true,
  },
  {
    id: 'experience',
    labelKo: '경험',
    labelEn: 'Experience',
    description: '성공 경험, 실패 극복, 프로젝트 완수 및 기억에 남는 배움에 관한 주제',
    enabled: true,
  },
  {
    id: 'situation',
    labelKo: '상황 대응',
    labelEn: 'Situational Response',
    description: '고객 응대, 일정 변경, 갑작스러운 난관 등 특정 상황에 대처하는 주제',
    enabled: true,
  },
  {
    id: 'opinion',
    labelKo: '의견',
    labelEn: 'Opinion',
    description: '업무 트렌드, 효율성 vs 정확성, 신기술 도입 등 주제에 대한 논리적 주장',
    enabled: true,
  },
  {
    id: 'problem-solving',
    labelKo: '문제 해결',
    labelEn: 'Problem Solving',
    description: '마감 지연, 리소스 부족, 팀 내 갈등 등 실제 비즈니스 문제 해결 방안',
    enabled: true,
  },
  {
    id: 'travel-leisure',
    labelKo: '여행 및 여가',
    labelEn: 'Travel & Leisure',
    description: '기억에 남는 여행, 선호하는 휴식 방식 및 취미 활동에 대한 주제',
    enabled: true,
  },
];

/**
 * Practice Area to Topic Mapping - Single Source of Truth
 */
export const PRACTICE_AREA_TOPIC_MAP: Record<PracticeAreaId, TopicId[]> = {
  'area-1-personal-workplace': [
    'self-introduction',
    'daily-life',
    'workplace',
    'experience',
    'travel-leisure',
  ],
  'area-2-business-follow-up': [
    'workplace',
    'experience',
    'situation',
    'problem-solving',
  ],
  'area-3-opinion-extended': [
    'opinion',
    'workplace',
    'problem-solving',
    'daily-life',
    'travel-leisure',
  ],
  'area-4-listening-summary': [
    'workplace',
    'daily-life',
    'experience',
    'situation',
    'problem-solving',
    'travel-leisure',
    'opinion',
  ],
  'area-5-visual-prompt': [
    'workplace',
    'daily-life',
    'opinion',
    'problem-solving',
    'travel-leisure',
  ],
};

/**
 * Official disclaimer for practice areas
 */
export const PRACTICE_AREA_DISCLAIMER =
  '5개 Practice Area는 효과적인 연습을 위해 구성한 분류이며 공식 시험기관의 고정 Part 명칭을 의미하지 않습니다.';

/**
 * SEO Route slugs
 */
export const PRACTICE_AREA_SEO_SLUGS: Record<PracticeAreaId, string> = {
  'area-1-personal-workplace': '/spa-practice/personal-workplace',
  'area-2-business-follow-up': '/spa-practice/business-follow-up',
  'area-3-opinion-extended': '/spa-practice/opinion',
  'area-4-listening-summary': '/spa-practice/listening-summary',
  'area-5-visual-prompt': '/spa-practice/visual-description',
};

export function getPracticeAreaDefinition(id: PracticeAreaId): PracticeAreaDefinition | undefined {
  return PRACTICE_AREAS.find((area) => area.id === id);
}

export function getTopicDefinition(id: TopicId): TopicDefinition | undefined {
  return TOPICS.find((topic) => topic.id === id);
}

export function isTopicAvailableForArea(areaId: PracticeAreaId, topicId: TopicId): boolean {
  const allowed = PRACTICE_AREA_TOPIC_MAP[areaId];
  return Array.isArray(allowed) && allowed.includes(topicId);
}
