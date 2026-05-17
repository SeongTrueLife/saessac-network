'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDeviceId, getName, getResponseId, saveName } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (getResponseId()) {
      router.replace('/result');
      return;
    }
    const saved = getName();
    if (saved) setName(saved);
    getDeviceId(); // device_id 없으면 생성
  }, [router]);

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveName(trimmed);
    router.push('/survey');
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🌱</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">새싹 4기 캐릭터 테스트</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            나는 어떤 팀원 캐릭터일까?<br />
            밸런스 게임 10문항으로 알아보기 ✨
          </p>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름을 입력해주세요
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="홍길동"
            maxLength={10}
            className="w-full px-4 py-3 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            autoFocus
          />
          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className="mt-4 w-full py-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold text-lg rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            시작하기 🚀
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          약 3분 소요 · 솔직하게 답할수록 정확해요 😉
        </p>
      </div>
    </main>
  );
}
