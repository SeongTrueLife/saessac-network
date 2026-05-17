import { questions } from './questions';
import { characters } from './characters';
import type { AxisScores } from '@/types';

export function calculateCharacter(answers: Record<number, string>): {
  characterId: string;
  scores: AxisScores;
  isFlexible: Partial<Record<keyof AxisScores, boolean>>;
} {
  const scores: AxisScores = { pace: 0, voice: 0, conflict: 0, learning: 0 };
  const isFlexible: Partial<Record<keyof AxisScores, boolean>> = {};

  // 1. 각 축별 점수 계산
  for (const question of questions) {
    const axis = question.axis;
    if (!['pace', 'voice', 'conflict', 'learning'].includes(axis)) continue;

    const answer = answers[question.id];
    if (!answer) continue;

    const weight = question.weight ?? 1;
    const value = answer === 'A' ? 1 : -1;
    scores[axis as keyof AxisScores] += value * weight;
  }

  // 2. 동률 처리 — pace, conflict, learning은 2문항이라 0점 가능
  if (scores.pace === 0) {
    isFlexible.pace = true;
    const selfRole = answers[10];
    if (['A', 'C'].includes(selfRole)) scores.pace = 1;       // 주도/소통 → 즉흥
    else if (['B', 'D'].includes(selfRole)) scores.pace = -1; // 실행/디자인 → 계획
    else scores.pace = Math.random() > 0.5 ? 1 : -1;          // 서포트 → 랜덤
  }
  if (scores.conflict === 0) {
    isFlexible.conflict = true;
    scores.conflict = Math.random() > 0.5 ? 1 : -1;
  }
  if (scores.learning === 0) {
    isFlexible.learning = true;
    scores.learning = Math.random() > 0.5 ? 1 : -1;
  }

  // 3. 4축 → 캐릭터 ID 매핑
  const axes = {
    pace: scores.pace > 0 ? 'impulsive' : 'planned',
    voice: scores.voice > 0 ? 'leading' : 'observing',
    conflict: scores.conflict > 0 ? 'direct' : 'gentle',
    learning: scores.learning > 0 ? 'experimental' : 'systematic',
  } as const;

  const character = characters.find(
    (c) =>
      c.axes.pace === axes.pace &&
      c.axes.voice === axes.voice &&
      c.axes.conflict === axes.conflict &&
      c.axes.learning === axes.learning
  );

  return {
    characterId: character!.id,
    scores,
    isFlexible,
  };
}
