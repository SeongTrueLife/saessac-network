import { calculateCharacter } from './character-algorithm';
import { questions } from './questions';
import type { AxisScores } from '@/types';

export interface DummyResponse {
  name: string;
  answers: Record<number, string>;
  scores: AxisScores;
  self_role: string;
  character_id: string;
  is_flexible: Partial<Record<keyof AxisScores, boolean>>;
  cafe_preference: string;
  favorite_ai: string;
  device_id: string;
}

const AI_LABELS: Record<string, string> = {
  A: 'ChatGPT',
  B: 'Claude',
  C: 'Gemini',
  D: '미정',
};

/**
 * 38명(또는 count명) 더미 응답 생성
 */
export function generateDummyResponses(count: number = 38): DummyResponse[] {
  const responses: DummyResponse[] = [];

  for (let i = 1; i <= count; i++) {
    const name = `더미${String(i).padStart(2, '0')}`;
    const answers: Record<number, string> = {};

    // 각 문항에 대해 옵션 중 랜덤 선택
    for (const q of questions) {
      const randomOption = q.options[Math.floor(Math.random() * q.options.length)];
      answers[q.id] = randomOption.value;
    }

    const { characterId, scores, isFlexible } = calculateCharacter(answers);

    responses.push({
      name,
      answers,
      scores,
      self_role: answers[10],
      character_id: characterId,
      is_flexible: isFlexible,
      cafe_preference: answers[3] === 'A' ? '아아' : '따아',
      favorite_ai: AI_LABELS[answers[7]] ?? '미정',
      device_id: crypto.randomUUID(),
    });
  }

  return responses;
}
