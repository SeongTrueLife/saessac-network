'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { getCharacterById } from '@/lib/characters';
import TeamTable, { type TeamData } from '@/components/TeamTable';
import type { DisplayMode } from '@/types';

const TOTAL_PARTICIPANTS = 38;

export default function DisplayPage() {
  const [mode, setMode] = useState<DisplayMode>('qr');
  const [responseCount, setResponseCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);

  const appUrl = mounted ? window.location.origin : '';

  useEffect(() => {
    setMounted(true);
    loadInitialState();

    // app_state 구독 (모드 전환 실시간 반영)
    const stateChannel = supabase
      .channel('display_app_state')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_state' },
        (payload) => {
          const row = payload.new as { key: string; value: { mode: DisplayMode } };
          if (row.key === 'display_mode') {
            handleModeChange(row.value.mode);
          }
        }
      )
      .subscribe();

    // responses 구독 (응답 수 실시간 반영)
    const responsesChannel = supabase
      .channel('display_responses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'responses' },
        () => loadResponseCount()
      )
      .subscribe();

    // team_assignments 구독 (라운드 모드 표시 중에 재생성 시 자동 반영)
    const teamsChannel = supabase
      .channel('display_team_assignments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_assignments' },
        () => {
          // 라운드 모드일 때만 다시 로드
          setMode((current) => {
            if (current !== 'qr') {
              const num = parseInt(current.replace('round', ''));
              loadTeams(num);
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stateChannel);
      supabase.removeChannel(responsesChannel);
      supabase.removeChannel(teamsChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeChange = async (newMode: DisplayMode) => {
    setMode(newMode);
    if (newMode !== 'qr') {
      const num = parseInt(newMode.replace('round', ''));
      setRoundNumber(num);
      await loadTeams(num);
    }
  };

  const loadInitialState = async () => {
    const [{ data: stateData }, { count }] = await Promise.all([
      supabase.from('app_state').select('value').eq('key', 'display_mode').single(),
      supabase.from('responses').select('*', { count: 'exact', head: true }),
    ]);

    if (stateData) {
      const currentMode = (stateData.value as { mode: DisplayMode }).mode;
      setMode(currentMode);
      if (currentMode !== 'qr') {
        const num = parseInt(currentMode.replace('round', ''));
        setRoundNumber(num);
        await loadTeams(num);
      }
    }
    setResponseCount(count ?? 0);
  };

  const loadResponseCount = async () => {
    const { count } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true });
    setResponseCount(count ?? 0);
  };

  const loadTeams = async (roundNum: number) => {
    const { data: assignments } = await supabase
      .from('team_assignments')
      .select('team_number, member_ids')
      .eq('round_number', roundNum)
      .order('team_number');

    if (!assignments || assignments.length === 0) {
      setTeams([]);
      return;
    }

    const allIds = assignments.flatMap((a) => a.member_ids as string[]);
    const { data: responses } = await supabase
      .from('responses')
      .select('id, name, character_id')
      .in('id', allIds);

    const teamData: TeamData[] = assignments.map((a) => ({
      teamNumber: a.team_number,
      members: (a.member_ids as string[]).map((id) => {
        const r = responses?.find((res) => res.id === id);
        return {
          id,
          name: r?.name ?? '?',
          emoji: getCharacterById(r?.character_id ?? '')?.emoji ?? '❓',
        };
      }),
    }));

    setTeams(teamData);
  };

  const progressPct = Math.min((responseCount / TOTAL_PARTICIPANTS) * 100, 100);

  return (
    <main
      className="min-h-screen flex flex-col relative overflow-hidden text-white"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%)',
      }}
    >
      {/* 응답 현황 (항상 우측 상단) */}
      <div className="absolute top-5 right-7 text-right z-10">
        <p className="text-sm opacity-50 mb-1">응답 현황</p>
        <p className="text-3xl font-bold leading-none">
          {responseCount}
          <span className="text-lg opacity-50 ml-1">/ {TOTAL_PARTICIPANTS}</span>
        </p>
        <div className="w-36 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* QR 모드 */}
      {mode === 'qr' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
          <div className="text-center mb-10">
            <p className="text-xl font-light opacity-60 mb-3">새싹 4기 캐릭터 테스트</p>
            <h1 className="text-5xl font-bold">QR 스캔으로 참여하기 📱</h1>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8">
            {appUrl && <QRCodeSVG value={appUrl} size={300} level="H" />}
          </div>

          <p className="text-2xl font-mono opacity-80 mb-3">{appUrl}</p>
          <p className="text-base opacity-40">
            QR 코드를 스캔하거나 위 주소로 접속해주세요
          </p>
        </div>
      )}

      {/* 라운드 발표 모드 */}
      {mode !== 'qr' && (
        <div className="flex-1 flex flex-col p-8 gap-6">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold">
              🎉 라운드 {roundNumber} 팀 발표
            </h1>
          </div>

          {teams.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-white/40 text-2xl">
              팀이 아직 배정되지 않았어요
            </div>
          ) : (
            <TeamTable teams={teams} />
          )}
        </div>
      )}
    </main>
  );
}
