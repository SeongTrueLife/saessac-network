/**
 * 팀 배정 알고리즘
 *
 * 라운드 1: 다양성 우선 (한 팀 내 캐릭터 골고루)
 * 라운드 2~4: 이전 라운드와 중복 최소화 (그리디 + 100회 시도 중 최선 선택)
 */

export interface AlgorithmInput {
  id: string;
  character_id: string;
}

export interface RoundTeam {
  teamNumber: number;
  memberIds: string[];
}

const DEFAULT_TEAM_COUNT = 6;
const ATTEMPTS_PER_ROUND = 100;

export function generateAllRounds(
  responses: AlgorithmInput[],
  totalRounds: number = 4
): RoundTeam[][] {
  const teamSizes = calculateTeamSizes(responses.length, DEFAULT_TEAM_COUNT);
  const allRounds: RoundTeam[][] = [];
  const meetingHistory = new Map<string, Set<string>>();

  for (let round = 1; round <= totalRounds; round++) {
    let bestAssignment: RoundTeam[] = [];
    let lowestOverlap = Infinity;

    for (let i = 0; i < ATTEMPTS_PER_ROUND; i++) {
      const candidate =
        round === 1
          ? generateDiverseTeams(responses, teamSizes)
          : generateMinOverlapTeams(responses, teamSizes, meetingHistory);

      const overlap = calculateOverlap(candidate, meetingHistory);
      if (overlap < lowestOverlap) {
        lowestOverlap = overlap;
        bestAssignment = candidate;
      }
    }

    updateMeetingHistory(meetingHistory, bestAssignment);
    allRounds.push(bestAssignment);
  }

  return allRounds;
}

/**
 * 인원수에 맞게 팀별 사이즈 계산
 * 예: 38명 → [7, 7, 6, 6, 6, 6]
 */
export function calculateTeamSizes(totalPeople: number, teamCount: number): number[] {
  const base = Math.floor(totalPeople / teamCount);
  const remainder = totalPeople % teamCount;
  const sizes = Array(teamCount).fill(base);
  for (let i = 0; i < remainder; i++) sizes[i]++;
  return sizes;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 라운드 1용: 캐릭터별로 그룹화 후 라운드 로빈 분배 → 한 팀에 다양한 캐릭터 들어가게
 */
function generateDiverseTeams(
  responses: AlgorithmInput[],
  teamSizes: number[]
): RoundTeam[] {
  // 캐릭터별 그룹화
  const groups = new Map<string, AlgorithmInput[]>();
  for (const r of responses) {
    if (!groups.has(r.character_id)) groups.set(r.character_id, []);
    groups.get(r.character_id)!.push(r);
  }

  // 각 그룹 셔플 후 큰 그룹부터 분배
  const groupArrays = Array.from(groups.values()).map(shuffle);
  groupArrays.sort((a, b) => b.length - a.length);

  const teams: RoundTeam[] = teamSizes.map((_, i) => ({
    teamNumber: i + 1,
    memberIds: [],
  }));

  // 각 사람을 "가장 인원 적은 팀" 중 capacity 안 찬 곳에 배치
  for (const group of groupArrays) {
    for (const member of group) {
      const targetIdx = findLeastFilledTeam(teams, teamSizes);
      if (targetIdx >= 0) teams[targetIdx].memberIds.push(member.id);
    }
  }

  return teams;
}

/**
 * 라운드 2~4용: 그리디로 "이미 만난 사람 수가 가장 적은" 팀에 배치
 */
function generateMinOverlapTeams(
  responses: AlgorithmInput[],
  teamSizes: number[],
  history: Map<string, Set<string>>
): RoundTeam[] {
  const shuffled = shuffle(responses);
  const teams: RoundTeam[] = teamSizes.map((_, i) => ({
    teamNumber: i + 1,
    memberIds: [],
  }));

  for (const person of shuffled) {
    let bestTeamIdx = -1;
    let bestScore = Infinity;
    const myHistory = history.get(person.id) ?? new Set();

    for (let i = 0; i < teams.length; i++) {
      if (teams[i].memberIds.length >= teamSizes[i]) continue;

      // 점수: 만난 사람 수 가중치 + 팀 인원수 (적은 팀 우선)
      let metCount = 0;
      for (const memberId of teams[i].memberIds) {
        if (myHistory.has(memberId)) metCount++;
      }
      const score = metCount * 100 + teams[i].memberIds.length;

      if (score < bestScore) {
        bestScore = score;
        bestTeamIdx = i;
      }
    }

    if (bestTeamIdx >= 0) teams[bestTeamIdx].memberIds.push(person.id);
  }

  return teams;
}

function findLeastFilledTeam(teams: RoundTeam[], teamSizes: number[]): number {
  let minIdx = -1;
  let minSize = Infinity;
  for (let i = 0; i < teams.length; i++) {
    if (teams[i].memberIds.length < teamSizes[i] && teams[i].memberIds.length < minSize) {
      minSize = teams[i].memberIds.length;
      minIdx = i;
    }
  }
  return minIdx;
}

/**
 * 팀 배정에서 "이미 만난 적 있는 페어"의 개수 (낮을수록 좋음)
 */
function calculateOverlap(
  teams: RoundTeam[],
  history: Map<string, Set<string>>
): number {
  let count = 0;
  for (const team of teams) {
    for (let i = 0; i < team.memberIds.length; i++) {
      for (let j = i + 1; j < team.memberIds.length; j++) {
        const a = team.memberIds[i];
        const b = team.memberIds[j];
        if (history.get(a)?.has(b)) count++;
      }
    }
  }
  return count;
}

function updateMeetingHistory(
  history: Map<string, Set<string>>,
  teams: RoundTeam[]
): void {
  for (const team of teams) {
    for (let i = 0; i < team.memberIds.length; i++) {
      for (let j = 0; j < team.memberIds.length; j++) {
        if (i === j) continue;
        const a = team.memberIds[i];
        const b = team.memberIds[j];
        if (!history.has(a)) history.set(a, new Set());
        history.get(a)!.add(b);
      }
    }
  }
}
