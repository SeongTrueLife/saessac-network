'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
import { characters, getCharacterById } from '@/lib/characters';
import { generateDummyResponses } from '@/lib/dummy-data';
import { exportResponsesToCsv } from '@/lib/csv-export';
import { generateAllRounds } from '@/lib/team-algorithm';
import type { AxisScores, DisplayMode } from '@/types';

const TOTAL_PARTICIPANTS = 38;

interface ResponseRow {
  id: string;
  name: string;
  character_id: string;
  scores: AxisScores;
  self_role: string;
  cafe_preference: string | null;
  favorite_ai: string | null;
  answers: Record<number, string>;
  created_at: string;
}

const MODE_OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: 'qr', label: 'QR 모드' },
  { value: 'round1', label: '라운드 1' },
  { value: 'round2', label: '라운드 2' },
  { value: 'round3', label: '라운드 3' },
  { value: 'round4', label: '라운드 4' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [currentMode, setCurrentMode] = useState<DisplayMode>('qr');
  const [isGeneratingDummy, setIsGeneratingDummy] = useState(false);
  const [isGeneratingRounds, setIsGeneratingRounds] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // 인증 체크
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/admin');
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const loadResponses = useCallback(async () => {
    const { data, error } = await supabase
      .from('responses')
      .select('id, name, character_id, scores, self_role, cafe_preference, favorite_ai, answers, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) setResponses(data);
  }, []);

  const loadCurrentMode = useCallback(async () => {
    const { data } = await supabase
      .from('app_state')
      .select('value')
      .eq('key', 'display_mode')
      .single();
    if (data) setCurrentMode((data.value as { mode: DisplayMode }).mode);
  }, []);

  // 초기 로드 + Realtime 구독
  useEffect(() => {
    if (!authChecked) return;

    loadResponses();
    loadCurrentMode();

    const responsesChannel = supabase
      .channel('admin_responses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'responses' },
        () => loadResponses()
      )
      .subscribe();

    const stateChannel = supabase
      .channel('admin_app_state')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_state' },
        (payload) => {
          const row = payload.new as { key: string; value: { mode: DisplayMode } };
          if (row.key === 'display_mode') setCurrentMode(row.value.mode);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(responsesChannel);
      supabase.removeChannel(stateChannel);
    };
  }, [authChecked, loadResponses, loadCurrentMode]);

  const handleModeChange = async (newMode: DisplayMode) => {
    const { error } = await supabase
      .from('app_state')
      .update({ value: { mode: newMode }, updated_at: new Date().toISOString() })
      .eq('key', 'display_mode');
    if (error) {
      alert('모드 변경 실패: ' + error.message);
      return;
    }
    setCurrentMode(newMode);
  };

  const handleDeleteResponse = async (id: string) => {
    if (!confirm('이 응답을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('responses').delete().eq('id', id);
    if (error) alert('삭제 실패: ' + error.message);
  };

  const handleGenerateDummy = async () => {
    if (!confirm('더미 데이터 38명을 생성합니다. 진행할까요?')) return;
    setIsGeneratingDummy(true);
    try {
      const dummies = generateDummyResponses(TOTAL_PARTICIPANTS);
      const { error } = await supabase.from('responses').insert(dummies);
      if (error) {
        alert('더미 생성 실패: ' + error.message);
      } else {
        alert(`${TOTAL_PARTICIPANTS}명 더미 데이터 생성 완료!`);
      }
    } finally {
      setIsGeneratingDummy(false);
    }
  };

  const handleCsvDownload = () => {
    if (responses.length === 0) {
      alert('다운로드할 응답이 없습니다.');
      return;
    }
    const characterMap = new Map(characters.map((c) => [c.id, c.name]));
    exportResponsesToCsv(responses, characterMap);
  };

  const handleGenerateRounds = async () => {
    if (responses.length < 2) {
      alert('응답이 2명 이상 있어야 합니다.');
      return;
    }
    if (
      !confirm(
        `현재 ${responses.length}명 응답으로 4라운드 팀을 생성합니다.\n기존 팀 배정은 삭제됩니다. 계속할까요?`
      )
    )
      return;

    setIsGeneratingRounds(true);
    try {
      // 1. 기존 팀 배정 전체 삭제
      const { error: deleteError } = await supabase
        .from('team_assignments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (deleteError) throw deleteError;

      // 2. 알고리즘 실행
      const algorithmInput = responses.map((r) => ({
        id: r.id,
        character_id: r.character_id,
      }));
      const allRounds = generateAllRounds(algorithmInput, 4);

      // 3. team_assignments 테이블에 insert
      const insertData = allRounds.flatMap((round, roundIdx) =>
        round
          .filter((t) => t.memberIds.length > 0)
          .map((team) => ({
            round_number: roundIdx + 1,
            team_number: team.teamNumber,
            member_ids: team.memberIds,
          }))
      );

      const { error: insertError } = await supabase
        .from('team_assignments')
        .insert(insertData);
      if (insertError) throw insertError;

      alert(
        `4라운드 × ${allRounds[0].length}팀 = ${insertData.length}개 팀 배정 완료!`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('팀 생성 실패: ' + message);
    } finally {
      setIsGeneratingRounds(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const [{ error: e1 }, { error: e2 }, { error: e3 }] = await Promise.all([
        supabase.from('responses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('team_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase
          .from('app_state')
          .update({ value: { mode: 'qr' }, updated_at: new Date().toISOString() })
          .eq('key', 'display_mode'),
      ]);
      if (e1 || e2 || e3) {
        alert('초기화 중 오류: ' + (e1?.message || e2?.message || e3?.message));
      } else {
        alert('전체 초기화 완료');
        setShowResetModal(false);
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/admin');
  };

  if (!authChecked) return null;

  const progressPct = Math.min((responses.length / TOTAL_PARTICIPANTS) * 100, 100);
  const lastResponse = responses[0];
  const lastResponseTime = lastResponse
    ? new Date(lastResponse.created_at).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">🎯 새싹 4기 관리 페이지</h1>
            <p className="text-xs text-gray-500 mt-1">실시간 응답 모니터링 + 팀 배정</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            로그아웃
          </button>
        </div>

        {/* 응답 현황 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">응답 현황</p>
              <p className="text-3xl font-bold text-gray-800">
                {responses.length}
                <span className="text-base text-gray-400 ml-1">/ {TOTAL_PARTICIPANTS}</span>
              </p>
            </div>
            <p className="text-xs text-gray-500">마지막 응답: {lastResponseTime}</p>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 응답자 리스트 */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-700">응답자 리스트</h2>
            <p className="text-xs text-gray-400">최근순 정렬</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {responses.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">
                아직 응답이 없습니다
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {responses.map((r) => {
                  const character = getCharacterById(r.character_id);
                  const time = new Date(r.created_at).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                      <span className="text-2xl">{character?.emoji ?? '❓'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{r.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {character?.name ?? r.character_id}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">{time}</p>
                      <button
                        onClick={() => handleDeleteResponse(r.id)}
                        className="text-xs text-red-400 hover:text-red-600 px-2"
                      >
                        삭제
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* 컨트롤 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700">컨트롤</h2>

          {/* 라운드 생성 */}
          <button
            onClick={handleGenerateRounds}
            disabled={isGeneratingRounds}
            className="w-full py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            {isGeneratingRounds ? '생성 중... (몇 초 걸려요)' : '🎲 라운드 1~4 일괄 생성'}
          </button>

          {/* 큰 화면 모드 변경 */}
          <div>
            <p className="text-xs text-gray-600 mb-2">큰 화면 모드 변경</p>
            <div className="grid grid-cols-5 gap-2">
              {MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleModeChange(opt.value)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentMode === opt.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 기타 액션 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">기타</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCsvDownload}
              className="py-2 px-3 border border-slate-200 rounded-lg text-sm text-gray-700 hover:bg-slate-50"
            >
              📥 CSV 다운로드
            </button>
            <button
              onClick={handleGenerateDummy}
              disabled={isGeneratingDummy}
              className="py-2 px-3 border border-slate-200 rounded-lg text-sm text-gray-700 hover:bg-slate-50 disabled:opacity-40"
            >
              {isGeneratingDummy ? '생성 중...' : '🧪 더미 38명 생성'}
            </button>
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full py-2 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50"
          >
            🗑️ 전체 초기화
          </button>
        </div>
      </div>

      {/* 초기화 확인 모달 */}
      {showResetModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !isResetting && setShowResetModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-bold text-gray-800">전체 초기화</h3>
              <p className="text-sm text-gray-600 mt-2">
                모든 응답과 팀 배정 결과가 삭제됩니다.
                <br />
                되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="flex-1 py-3 bg-slate-100 rounded-xl text-sm font-medium text-gray-700 disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
              >
                {isResetting ? '초기화 중...' : '삭제 진행'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
