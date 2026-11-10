/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MockExamBlueprint } from '../types/mockExam';

/**
 * Default Mock Exam Blueprint
 * Total test limit: 13 minutes (780 seconds).
 * 문항 수와 시간은 하드코딩되지 않고 이 Blueprint에서 동적으로 읽어옵니다.
 * 향후 5번 꼬리 질문 추가나 시간 변경 시 이 설정 파일만 수정하면 전체 모의고사에 반영됩니다.
 */
export const DEFAULT_MOCK_EXAM_BLUEPRINT: MockExamBlueprint = {
  title: 'SPA 실전 모의고사 (Full-Set)',
  totalMaxTimeSeconds: 13 * 60, // 780초 (13분 상한)
  parts: [
    {
      partNumber: 1,
      partId: 'personal_1',
      partTitle: 'Part 1. 개인 질문 (일상/직장)',
      prepSeconds: 0,
      answerMaxSeconds: 40,
      description: '일상 또는 직장 생활과 관련된 첫 번째 개인 질문에 답변합니다.',
    },
    {
      partNumber: 2,
      partId: 'personal_2',
      partTitle: 'Part 2. 개인 질문 (경험/가치관)',
      prepSeconds: 0,
      answerMaxSeconds: 40,
      description: '업무 또는 경험과 관련된 두 번째 개인 질문에 답변합니다.',
    },
    {
      partNumber: 3,
      partId: 'passage_summary',
      partTitle: 'Part 3. 청취 지문 요약',
      prepSeconds: 0,
      answerMaxSeconds: 90,
      description: '영어 안내 또는 공지 음성을 듣고 핵심 내용을 요약하여 말합니다.',
    },
    {
      partNumber: 4,
      partId: 'passage_followup',
      partTitle: 'Part 4. 지문 연계 꼬리 질문',
      prepSeconds: 0,
      answerMaxSeconds: 60,
      description: 'Part 3 지문의 상황과 연계된 심층 질문에 자신의 생각을 답변합니다.',
    },
    {
      partNumber: 5,
      partId: 'social_opinion',
      partTitle: 'Part 5. 사회적 이슈 의견 제시',
      prepSeconds: 15,
      answerMaxSeconds: 90,
      description: '15초의 준비 시간 후 비즈니스 및 사회적 이슈에 대한 견해를 논리적으로 제시합니다.',
    },
    {
      partNumber: 6,
      partId: 'visual_description',
      partTitle: 'Part 6. 시각 자료 묘사 및 제안',
      prepSeconds: 30,
      answerMaxSeconds: 120,
      description: '30초 동안 제시된 시각 자료(차트 또는 상황 사진)를 분석한 뒤 120초간 묘사하고 분석 의견을 제시합니다.',
    },
  ],
};
