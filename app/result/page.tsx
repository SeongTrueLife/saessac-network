'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAll, getResponseId } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { getCharacterById } from '@/lib/characters';
import CharacterCard from '@/components/CharacterCard';
import CharacterGallery from '@/components/CharacterGallery';
import type { Character } from '@/types';

interface ResponseData {
  id: string;
  name: string;
  character_id: string;
  cafe_preference: string | null;
  favorite_ai: string | null;
}

type Tab = 'result' | 'gallery';

export default function ResultPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('result');
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const responseId = getResponseId();
    if (!responseId) {
      router.replace('/');
      return;
    }
    loadResponse(responseId);
  }, [router]);

  const loadResponse = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('id, name, character_id, cafe_preference, favorite_ai')
        .eq('id', id)
        .single();

      if (error || !data) {
        // Supabase에서 응답이 삭제됐거나 사라진 경우 — localStorage 정리 후 처음으로
        clearAll();
        router.replace('/');
        return;
      }

      setResponse(data);
      const char = getCharacterById(data.character_id);
      if (char) setCharacter(char);
    } catch (err) {
      console.error('응답 로드 실패:', err);
      clearAll();
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${character?.name ?? '캐릭터'}_결과.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('다운로드 실패:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">✨</div>
          <p className="text-gray-600 font-medium">결과 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (!response || !character) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <div className="text-center">
          <div className="text-4xl mb-3">😅</div>
          <p className="text-gray-600 mb-4">결과를 불러올 수 없어요.</p>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-500 font-medium text-sm"
          >
            처음으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* 탭 네비게이션 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex max-w-md mx-auto">
          <button
            onClick={() => setTab('result')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              tab === 'result'
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-400'
            }`}
          >
            내 결과 카드
          </button>
          <button
            onClick={() => setTab('gallery')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              tab === 'gallery'
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-400'
            }`}
          >
            전체 캐릭터 갤러리
          </button>
        </div>
      </div>

      <div className="p-5 max-w-md mx-auto pb-10">
        {tab === 'result' ? (
          <div>
            <CharacterCard
              ref={cardRef}
              character={character}
              userName={response.name}
              cafePreference={response.cafe_preference ?? undefined}
              favoriteAi={response.favorite_ai ?? undefined}
            />

            {/* 이미지 저장 */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="mt-4 w-full py-3 border-2 border-indigo-300 rounded-xl text-indigo-600 font-medium text-sm active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              {downloading ? '저장 중...' : '📸 이미지로 저장'}
            </button>

            {/* 대기 메시지 */}
            <div className="mt-5 bg-white rounded-2xl p-5 text-center shadow-sm">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm font-semibold text-gray-700">
                잠시 후 큰 화면에서 팀이 발표됩니다!
              </p>
              <p className="text-xs text-gray-400 mt-1">
                갤러리에서 다른 캐릭터들도 구경해보세요 👀
              </p>
            </div>
          </div>
        ) : (
          <CharacterGallery myCharacterId={character.id} />
        )}
      </div>
    </main>
  );
}
