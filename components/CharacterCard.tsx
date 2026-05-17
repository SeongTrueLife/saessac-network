'use client';

import { forwardRef } from 'react';
import type { Character } from '@/types';
import { getCharacterById } from '@/lib/characters';
import { CHARACTER_COLORS } from '@/lib/character-colors';

interface CharacterCardProps {
  character: Character;
  userName: string;
  cafePreference?: string;
  favoriteAi?: string;
}

const CharacterCard = forwardRef<HTMLDivElement, CharacterCardProps>(
  ({ character, userName, cafePreference, favoriteAi }, ref) => {
    const matchCharacter = getCharacterById(character.matchWith);
    const tikitakaCharacter = getCharacterById(character.tikitaka);
    const gradient = CHARACTER_COLORS[character.id] ?? 'from-indigo-400 to-pink-500';

    return (
      <div ref={ref} className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* 헤더 그라데이션 */}
        <div className={`bg-gradient-to-br ${gradient} p-8 text-center text-white`}>
          <div className="text-7xl mb-3">{character.emoji}</div>
          <p className="text-sm font-medium opacity-80 mb-1">{userName}님은</p>
          <h2 className="text-2xl font-bold mb-2">{character.name}</h2>
          <p className="text-sm opacity-90 leading-relaxed">{character.tagline}</p>
        </div>

        {/* 본문 */}
        <div className="p-5 space-y-4">
          {/* 강점 */}
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs font-bold text-green-600 mb-1">💪 강점</p>
            <p className="text-sm text-gray-700">{character.strengths}</p>
          </div>

          {/* 아쉬운 점 */}
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-600 mb-1">🤔 살짝 아쉬운 점</p>
            <p className="text-sm text-gray-700">{character.weaknesses}</p>
          </div>

          {/* 찰떡궁합 / 티키타카 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-pink-500 mb-2">💕 찰떡궁합</p>
              {matchCharacter && (
                <>
                  <div className="text-2xl">{matchCharacter.emoji}</div>
                  <p className="text-xs text-gray-600 mt-1">{matchCharacter.name}</p>
                </>
              )}
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-indigo-500 mb-2">⚡ 티키타카</p>
              {tikitakaCharacter && (
                <>
                  <div className="text-2xl">{tikitakaCharacter.emoji}</div>
                  <p className="text-xs text-gray-600 mt-1">{tikitakaCharacter.name}</p>
                </>
              )}
            </div>
          </div>

          {/* 양념 */}
          {(cafePreference || favoriteAi) && (
            <div className="border border-gray-100 rounded-xl p-3 flex justify-around text-center">
              {cafePreference && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">카페 취향</p>
                  <p className="text-sm font-medium text-gray-700">
                    {cafePreference === '아아' ? '🧊 아아' : '☕ 따아'}
                  </p>
                </div>
              )}
              {favoriteAi && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">최애 AI</p>
                  <p className="text-sm font-medium text-gray-700">{favoriteAi}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CharacterCard.displayName = 'CharacterCard';
export default CharacterCard;
