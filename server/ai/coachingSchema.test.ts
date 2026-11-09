import { describe, expect, it } from 'vitest';
import { AICoachingResultSchema, CoachingRequestSchema } from './coachingSchema.ts';

describe('Server Coaching Zod Schemas', () => {
  const validRequest = {
    questionId: 'q-101',
    question: 'How do you prioritize urgent tasks at work?',
    category: '직장생활',
    difficulty: 'intermediate',
    transcript:
      'When I have multiple urgent tasks, I list them based on deadlines and talk with my manager.',
    recordingDurationSeconds: 45,
    metrics: {
      totalWords: 17,
      wordsPerMinute: 22,
      totalFillerCount: 0,
      repeatedWords: [],
      repeatedPhrases: [],
    },
    feedbackLanguage: 'ko',
    desiredAnswerLevel: 'one-step-better',
    answerTimeLimitSeconds: 60,
  };

  const validResponse = {
    version: 'v1',
    feedbackLanguage: 'ko',
    desiredAnswerLevel: 'one-step-better',
    overallSummary: '핵심 내용이 잘 전달된 답변입니다.',
    relevance: {
      rating: 'effective',
      explanation: '질문의 우선순위 설정 방법을 명확히 언급함',
      answeredMainQuestion: true,
      missingElements: [],
      evidence: [
        {
          quotedText: 'I list them based on deadlines',
          explanation: '구체적 기준 제시',
        },
      ],
    },
    structure: {
      rating: 'strong',
      explanation: '도입과 세부 설명이 자연스러움',
      hasOpening: true,
      hasSupportingDetails: true,
      hasExample: true,
      hasConclusion: true,
      evidence: [],
    },
    strengths: [
      {
        title: '핵심 직답',
        explanation: '서두에서 바로 답변함',
      },
    ],
    priorityImprovements: [
      {
        priority: 1,
        title: '구체적 사례 보강',
        explanation: '실제 경험했던 프로젝트 예를 들면 더욱 설득력 있음',
        action: '지난 분기 마감 사례 언급하기',
      },
    ],
    grammarCorrections: [
      {
        original: 'I talk with manager',
        corrected: 'I talk with my manager',
        explanation: '소유격 필요',
        category: 'article',
      },
    ],
    expressionImprovements: [
      {
        original: 'talk with',
        improved: 'consult with',
        explanation: '더 프로페셔널한 어휘',
      },
    ],
    answerOutline: [
      {
        order: 1,
        label: '도입',
        guidance: '업무 우선순위 판단 기준 제시',
        exampleStarter: 'When handling urgent tasks...',
      },
      {
        order: 2,
        label: '세부 전개',
        guidance: '일정 확인 및 매니저 조율',
      },
    ],
    improvedAnswer:
      'When managing urgent tasks, I first evaluate deadlines and coordinate directly with my manager.',
    usefulExpressions: ['evaluate deadlines', 'coordinate with'],
    retryChecklist: [
      {
        id: 'chk-1',
        instruction: '우선순위 결정 기준을 첫 문장에서 확실히 밝히기',
      },
      {
        id: 'chk-2',
        instruction: '구체적인 업무 사례 1가지를 언급하기',
      },
      {
        id: 'chk-3',
        instruction: 'filler word 사용을 줄이고 차분하게 말하기',
      },
    ],
    limitations: [
      '본 코칭은 발음, 억양, 성량 등 음향적 요소를 평가하지 않습니다.',
    ],
  };

  describe('CoachingRequestSchema', () => {
    it('passes for a valid complete request', () => {
      const parsed = CoachingRequestSchema.safeParse(validRequest);
      expect(parsed.success).toBe(true);
    });

    it('rejects transcripts shorter than 10 words', () => {
      const shortRequest = {
        ...validRequest,
        transcript: 'I talk to manager.', // only 4 words
      };
      const parsed = CoachingRequestSchema.safeParse(shortRequest);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toContain('10단어');
      }
    });

    it('rejects invalid feedbackLanguage values', () => {
      const invalidLang = {
        ...validRequest,
        feedbackLanguage: 'jp',
      };
      const parsed = CoachingRequestSchema.safeParse(invalidLang);
      expect(parsed.success).toBe(false);
    });

    it('rejects invalid desiredAnswerLevel values', () => {
      const invalidLevel = {
        ...validRequest,
        desiredAnswerLevel: 'expert-level',
      };
      const parsed = CoachingRequestSchema.safeParse(invalidLevel);
      expect(parsed.success).toBe(false);
    });
  });

  describe('AICoachingResultSchema', () => {
    it('passes for a valid coaching response object', () => {
      const parsed = AICoachingResultSchema.safeParse(validResponse);
      expect(parsed.success).toBe(true);
    });

    it('rejects invalid rating values outside the 4 allowed practice ratings', () => {
      const badRating = {
        ...validResponse,
        relevance: {
          ...validResponse.relevance,
          rating: 'grade-A', // Invalid rating! Must be needs-development, developing, effective, or strong
        },
      };
      const parsed = AICoachingResultSchema.safeParse(badRating);
      expect(parsed.success).toBe(false);
    });

    it('rejects when required improvedAnswer string is missing', () => {
      const missingImproved = { ...validResponse };
      delete (missingImproved as any).improvedAnswer;
      const parsed = AICoachingResultSchema.safeParse(missingImproved);
      expect(parsed.success).toBe(false);
    });
  });
});
