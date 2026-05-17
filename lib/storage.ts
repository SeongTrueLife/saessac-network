const KEYS = {
  DEVICE_ID: 'saessac_device_id',
  USER_NAME: 'saessac_user_name',
  PROGRESS: 'saessac_progress',
  RESPONSE_ID: 'saessac_response_id',
} as const;

interface SurveyProgress {
  currentQuestion: number; // 0-indexed
  answers: Record<number, string>;
}

export function getDeviceId(): string {
  let id = localStorage.getItem(KEYS.DEVICE_ID);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEYS.DEVICE_ID, id);
  }
  return id;
}

export function saveName(name: string): void {
  localStorage.setItem(KEYS.USER_NAME, name);
}

export function getName(): string | null {
  return localStorage.getItem(KEYS.USER_NAME);
}

export function saveProgress(currentQuestion: number, answers: Record<number, string>): void {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify({ currentQuestion, answers }));
}

export function getProgress(): SurveyProgress | null {
  const raw = localStorage.getItem(KEYS.PROGRESS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SurveyProgress;
  } catch {
    return null;
  }
}

export function clearProgress(): void {
  localStorage.removeItem(KEYS.PROGRESS);
}

export function saveResponseId(id: string): void {
  localStorage.setItem(KEYS.RESPONSE_ID, id);
}

export function getResponseId(): string | null {
  return localStorage.getItem(KEYS.RESPONSE_ID);
}

export function clearAll(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
