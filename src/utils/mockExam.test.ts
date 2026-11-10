/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_MOCK_EXAM_BLUEPRINT } from '../config/mockExamBlueprint';
import { generateMockExamSet, MOCK_VISUAL_POOL } from '../data/mockExamPool';

describe('MockExamBlueprint and Generator', () => {
  it('has 6 parts and 780s total duration by default', () => {
    expect(DEFAULT_MOCK_EXAM_BLUEPRINT.parts.length).toBe(6);
    expect(DEFAULT_MOCK_EXAM_BLUEPRINT.totalMaxTimeSeconds).toBe(13 * 60);
  });

  it('correctly defines timing for each part according to specifications', () => {
    const parts = DEFAULT_MOCK_EXAM_BLUEPRINT.parts;
    // Part 1 & 2: 40s answer, 0s prep
    expect(parts[0].answerMaxSeconds).toBe(40);
    expect(parts[0].prepSeconds).toBe(0);
    expect(parts[1].answerMaxSeconds).toBe(40);
    expect(parts[1].prepSeconds).toBe(0);

    // Part 3: 90s answer, 0s prep
    expect(parts[2].answerMaxSeconds).toBe(90);
    expect(parts[2].prepSeconds).toBe(0);

    // Part 4: 60s answer, 0s prep
    expect(parts[3].answerMaxSeconds).toBe(60);
    expect(parts[3].prepSeconds).toBe(0);

    // Part 5: 15s prep, 90s answer
    expect(parts[4].prepSeconds).toBe(15);
    expect(parts[4].answerMaxSeconds).toBe(90);

    // Part 6: 30s prep, 120s answer
    expect(parts[5].prepSeconds).toBe(30);
    expect(parts[5].answerMaxSeconds).toBe(120);
  });

  it('generates a full 6-question set with unique personal questions and connected follow-up', () => {
    const set = generateMockExamSet(DEFAULT_MOCK_EXAM_BLUEPRINT, []);
    expect(set.questions.length).toBe(6);

    // Part 1 and 2 must have distinct prompts
    expect(set.questions[0].promptText).not.toBe(set.questions[1].promptText);

    // Part 3 must have passageText
    expect(set.questions[2].passageText).toBeDefined();
    expect(typeof set.questions[2].passageText).toBe('string');

    // Part 6 must have visual prompt
    expect(set.questions[5].visual).toBeDefined();
    expect(['chart', 'photo']).toContain(set.questions[5].visual?.type);
    expect(set.questions[5].visual?.imageUrl).toBeDefined();
  });

  it('supports visual item exclusion for recent attempts', () => {
    const firstVisualId = MOCK_VISUAL_POOL[0].id;
    // If we exclude firstVisualId and force its type, the picker should avoid it if possible
    const set = generateMockExamSet(DEFAULT_MOCK_EXAM_BLUEPRINT, [firstVisualId]);
    if (set.pickedVisualItem.type === MOCK_VISUAL_POOL[0].type) {
      expect(set.pickedVisualItem.id).not.toBe(firstVisualId);
    }
  });
});
