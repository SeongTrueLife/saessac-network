export interface Question {
  id: number;
  question: string;
  options: { value: string; label: string; emoji: string }[];
  axis: 'pace' | 'voice' | 'conflict' | 'learning' | 'self_role' | 'flavor' | 'ai';
  weight?: 1 | -1;
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  axes: {
    pace: 'impulsive' | 'planned';
    voice: 'leading' | 'observing';
    conflict: 'direct' | 'gentle';
    learning: 'experimental' | 'systematic';
  };
  strengths: string;
  weaknesses: string;
  matchWith: string;
  tikitaka: string;
}

export interface AxisScores {
  pace: number;
  voice: number;
  conflict: number;
  learning: number;
}

export interface Response {
  id: string;
  name: string;
  answers: Record<number, string>;
  scores: AxisScores;
  selfRole: string;
  characterId: string;
  isFlexible: Partial<Record<keyof AxisScores, boolean>>;
  cafePreference: string;
  favoriteAi: string;
  deviceId: string;
  createdAt: string;
}

export interface Team {
  roundNumber: number;
  teamNumber: number;
  members: Response[];
}

export type DisplayMode = 'qr' | 'round1' | 'round2' | 'round3' | 'round4';
