'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/lib/questions';
import {
  clearProgress,
  getDeviceId,
  getName,
  getProgress,
  getResponseId,
  saveProgress,
  saveResponseId,
} from '@/lib/storage';
import { calculateCharacter } from '@/lib/character-algorithm';
import { supabase } from '@/lib/supabase';
import QuestionCard from '@/components/QuestionCard';

const AI_LABELS: Record<string, string> = {
  A: 'ChatGPT',
  B: 'Claude',
  C: 'Gemini',
  D: '다 써봄',
};

export default function SurveyPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeCount, setResumeCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (getResponseId()) {
      router.replace('/result');
      return;
    }
    if (!getName()) {
      router.replace('/');
      return;
    }
    const progress = getProgress();
    if (progress && Object.keys(progress.answers).length > 0) {
      setResumeCount(Object.keys(progress.answers).length);
      setShowResumeModal(true);
    }
  }, [router]);

  const handleResume = () => {
    const progress = getProgress();
    if (progress) {
      setAnswers(progress.answers);
      setCurrentIndex(progress.currentQuestion);
    }
    setShowResumeModal(false);
  };

  const handleRestart = () => {
    clearProgress();
    setCurrentIndex(0);
    setAnswers({});
    setShowResumeModal(false);
  };

  const handleAnswer = async (value: string) => {
    const question = questions[currentIndex];
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      saveProgress(nextIndex, newAnswers);
    } else {
      await submitSurvey(newAnswers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const submitSurvey = async (finalAnswers: Record<number, string>) => {
    setIsSubmitting(true);
    try {
      const name = getName()!;
      const deviceId = getDeviceId();
      const { characterId, scores, isFlexible } = calculateCharacter(finalAnswers);

      const { data, error } = await supabase
        .from('responses')
        .insert({
          name,
          answers: finalAnswers,
          scores,
          self_role: finalAnswers[10] ?? '',
          character_id: characterId,
          is_flexible: isFlexible,
          cafe_preference: finalAnswers[3] === 'A' ? '아아' : '따아',
          favorite_ai: AI_LABELS[finalAnswers[7]] ?? null,
          device_id: deviceId,
        })
        .select('id')
        .single();

      if (error) throw error;

      saveResponseId(data.id);
      clearProgress();
      router.push('/result');
    } catch (err) {
      console.error('제출 실패:', err);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  // 제출 중 로딩 화면
  if (isSubmitting) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔍</div>
          <p className="text-lg font-bold text-gray-700">캐릭터 분석 중...</p>
          <p className="text-sm text-gray-400 mt-2">잠깐만 기다려주세요!</p>
        </div>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <main className="min-h-screen flex flex-col items-center p-6 pt-8 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* 이어하기 모달 */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🔖</div>
              <h2 className="text-lg font-bold text-gray-800">이어서 하실래요?</h2>
              <p className="text-sm text-gray-500 mt-1">
                {resumeCount}번 문항까지 완료했어요
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 active:scale-[0.98] transition-transform"
              >
                처음부터
              </button>
              <button
                onClick={handleResume}
                className="flex-1 py-3 bg-indigo-500 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-transform"
              >
                이어서 하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <QuestionCard
          questionNumber={currentIndex + 1}
          total={questions.length}
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedValue={answers[currentQuestion.id]}
          onSelect={handleAnswer}
        />

        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="mt-4 text-sm text-gray-400 flex items-center gap-1 hover:text-gray-600 transition-colors"
          >
            ← 이전 문항
          </button>
        )}
      </div>
    </main>
  );
}
