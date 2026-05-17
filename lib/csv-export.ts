import type { AxisScores } from '@/types';

export interface CsvResponseRow {
  name: string;
  character_id: string;
  scores: AxisScores;
  self_role: string;
  cafe_preference: string | null;
  favorite_ai: string | null;
  answers: Record<number, string>;
  created_at: string;
}

const QUESTION_COUNT = 10;

/**
 * 응답 데이터를 CSV로 변환해 다운로드
 * @param characterMap characterId → 캐릭터 이름 매핑
 */
export function exportResponsesToCsv(
  responses: CsvResponseRow[],
  characterMap: Map<string, string>
): void {
  const questionHeaders = Array.from({ length: QUESTION_COUNT }, (_, i) => `Q${i + 1}`);
  const headers = [
    '이름',
    '캐릭터',
    'pace',
    'voice',
    'conflict',
    'learning',
    'self_role',
    '카페',
    '최애 AI',
    '응답 시각',
    ...questionHeaders,
  ];

  const rows = responses.map((r) => {
    const questionAnswers = Array.from(
      { length: QUESTION_COUNT },
      (_, i) => r.answers?.[i + 1] ?? ''
    );
    return [
      r.name,
      characterMap.get(r.character_id) ?? r.character_id,
      r.scores.pace,
      r.scores.voice,
      r.scores.conflict,
      r.scores.learning,
      r.self_role,
      r.cafe_preference ?? '',
      r.favorite_ai ?? '',
      new Date(r.created_at).toLocaleString('ko-KR'),
      ...questionAnswers,
    ];
  });

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  // BOM 추가해야 Excel에서 한국어 깨짐 방지
  const bom = '﻿';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const today = new Date().toISOString().split('T')[0];
  link.download = `saessac-responses-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
