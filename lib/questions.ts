import type { Question } from '@/types';

export const questions: Question[] = [
  {
    id: 1,
    question: "금요일 밤 11시. 친구가 갑자기 \"내일 당일치기 부산 어때?\" 톡 보냄. 나는?",
    options: [
      { value: 'A', label: '"콜! 몇 시 차야?" 바로 짐 싸기 시작', emoji: '🚄' },
      { value: 'B', label: '"내일? 갑자기? 다음 주에 미리 계획해서 가자"', emoji: '📅' },
    ],
    axis: 'pace',
    weight: 1,
  },
  {
    id: 2,
    question: "새로 시킨 떡볶이. 맛있는데 좀 짜다. 나는?",
    options: [
      { value: 'A', label: '"사장님 다음에 좀 덜 짜게 해주세요" 바로 리뷰 남김', emoji: '🌶️' },
      { value: 'B', label: '그냥 다음엔 다른 데서 시키지 뭐... 별점만 살짝 깎음', emoji: '😶' },
    ],
    axis: 'conflict',
    weight: 1,
  },
  {
    id: 3,
    question: "1년 365일, 카페에서 나는?",
    options: [
      { value: 'A', label: '무조건 아아 - 한겨울에도 얼죽아', emoji: '🧊' },
      { value: 'B', label: '따뜻한 거 - 따아가 진리', emoji: '☕' },
    ],
    axis: 'flavor',
  },
  {
    id: 4,
    question: "새 카페 갔는데 키오스크가 처음 보는 디자인. 나는?",
    options: [
      { value: 'A', label: '일단 화면 여기저기 눌러본다, 뭐 어떻게든 되겠지', emoji: '🎮' },
      { value: 'B', label: '직원한테 물어보거나 옆 사람 어떻게 하는지 본다', emoji: '📖' },
    ],
    axis: 'learning',
    weight: 1,
  },
  {
    id: 5,
    question: "단톡방에 누가 \"이번 주말에 뭐 할까?\" 톡 던졌다. 30초 정적. 나는?",
    options: [
      { value: 'A', label: '"○○ 어때?" 일단 던진다', emoji: '💬' },
      { value: 'B', label: '누가 먼저 말하나 본다, 의견 모이면 정리해서 말함', emoji: '👀' },
    ],
    axis: 'voice',
    weight: 1,
  },
  {
    id: 6,
    question: "인스타에 올릴 사진 한 장. 보정 시간은?",
    options: [
      { value: 'A', label: '30분 이상. 색감·구도·필터 다 비교', emoji: '🎨' },
      { value: 'B', label: '1분 컷. 기본 필터 하나 씌우고 끝', emoji: '📸' },
    ],
    axis: 'pace',
    weight: -1,
  },
  {
    id: 7,
    question: "내 최애 AI는?",
    options: [
      { value: 'A', label: 'ChatGPT - 다재다능 만능 친구', emoji: '💬' },
      { value: 'B', label: 'Claude - 글 잘 쓰는 츤데레', emoji: '🎭' },
      { value: 'C', label: 'Gemini - 구글빨 정보왕', emoji: '🔍' },
      { value: 'D', label: '아직 정착 못함, 다 써봄', emoji: '🤷' },
    ],
    axis: 'ai',
  },
  {
    id: 8,
    question: "팀플 PPT 마감 D-1. 팀원이 자료를 안 보냈다. 나는?",
    options: [
      { value: 'A', label: '바로 전화한다 "야 자료 어떻게 됐어?"', emoji: '📞' },
      { value: 'B', label: '일단 좀 더 기다려본다... 무슨 사정 있겠지', emoji: '💭' },
    ],
    axis: 'conflict',
    weight: 1,
  },
  {
    id: 9,
    question: "처음 가는 식당. 메뉴 고를 때 나는?",
    options: [
      { value: 'A', label: '리뷰 5개 이상 정독 후 결정', emoji: '🍽️' },
      { value: 'B', label: '사장님 추천 or 직감으로 픽', emoji: '🎲' },
    ],
    axis: 'learning',
    weight: -1,
  },
  {
    id: 10,
    question: "🎯 마지막! 솔직 모드: 조별과제에서 나의 진짜 모습은?",
    options: [
      { value: 'A', label: '발표·진행형 - "야 우리 이거 정리하자, 내가 발표할게"', emoji: '🎤' },
      { value: 'B', label: '자료조사·실행형 - "구체적인 건 내가 만들게"', emoji: '🛠️' },
      { value: 'C', label: '일정·소통형 - "다들 언제 시간 돼? 회의 잡을게"', emoji: '🧭' },
      { value: 'D', label: '디자인·마무리형 - "이거 디자인 좀 더 다듬으면 좋을 듯"', emoji: '🎨' },
      { value: 'E', label: '분위기·서포트형 - "다들 화이팅! 뭐 도와줄 거 없어?"', emoji: '🌊' },
    ],
    axis: 'self_role',
  },
];
