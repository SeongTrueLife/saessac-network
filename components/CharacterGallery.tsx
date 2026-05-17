'use client';

import { useState } from 'react';
import { characters, getCharacterById } from '@/lib/characters';
import { CHARACTER_COLORS } from '@/lib/character-colors';
import type { Character } from '@/types';

interface CharacterGalleryProps {
  myCharacterId?: string;
}

export default function CharacterGallery({ myCharacterId }: CharacterGalleryProps) {
  const [selected, setSelected] = useState<Character | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {characters.map((char) => {
          const gradient = CHARACTER_COLORS[char.id] ?? 'from-indigo-400 to-pink-500';
          const isMe = char.id === myCharacterId;

          return (
            <button
              key={char.id}
              onClick={() => setSelected(char)}
              className="relative bg-white rounded-xl shadow-sm overflow-hidden active:scale-[0.97] transition-transform text-left"
            >
              {isMe && (
                <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  나!
                </div>
              )}
              <div className={`bg-gradient-to-br ${gradient} p-5 text-center`}>
                <div className="text-3xl">{char.emoji}</div>
              </div>
              <div className="p-2 text-center">
                <p className="text-xs font-semibold text-gray-700">{char.name}</p>
                <p className="text-xs text-gray-400 truncate px-1 mt-0.5">{char.tagline}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 pb-0"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div
              className={`bg-gradient-to-br ${CHARACTER_COLORS[selected.id] ?? 'from-indigo-400 to-pink-500'} p-6 text-center text-white rounded-t-2xl`}
            >
              <div className="text-5xl mb-2">{selected.emoji}</div>
              <h3 className="text-xl font-bold">{selected.name}</h3>
              <p className="text-sm opacity-90 mt-1">{selected.tagline}</p>
              {selected.id === myCharacterId && (
                <div className="mt-2 inline-block bg-white/20 rounded-full px-3 py-1 text-xs font-bold">
                  ⭐ 나의 캐릭터
                </div>
              )}
            </div>

            {/* 모달 본문 */}
            <div className="p-5 space-y-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs font-bold text-green-600 mb-1">💪 강점</p>
                <p className="text-sm text-gray-700">{selected.strengths}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-600 mb-1">🤔 살짝 아쉬운 점</p>
                <p className="text-sm text-gray-700">{selected.weaknesses}</p>
              </div>

              {/* 궁합 */}
              <div className="grid grid-cols-2 gap-2">
                {(() => {
                  const matchChar = getCharacterById(selected.matchWith);
                  const tikitakaChar = getCharacterById(selected.tikitaka);
                  return (
                    <>
                      <div className="bg-pink-50 rounded-xl p-3 text-center">
                        <p className="text-xs font-bold text-pink-500 mb-1">💕 찰떡궁합</p>
                        {matchChar && (
                          <>
                            <div className="text-2xl">{matchChar.emoji}</div>
                            <p className="text-xs text-gray-600 mt-1">{matchChar.name}</p>
                          </>
                        )}
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-3 text-center">
                        <p className="text-xs font-bold text-indigo-500 mb-1">⚡ 티키타카</p>
                        {tikitakaChar && (
                          <>
                            <div className="text-2xl">{tikitakaChar.emoji}</div>
                            <p className="text-xs text-gray-600 mt-1">{tikitakaChar.name}</p>
                          </>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full py-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 active:scale-[0.98] transition-transform"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
