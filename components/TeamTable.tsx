export interface TeamMember {
  id: string;
  name: string;
  emoji: string;
}

export interface TeamData {
  teamNumber: number;
  members: TeamMember[];
}

const TEAM_GRADIENTS = [
  'linear-gradient(to right, #ef4444, #ea580c)',
  'linear-gradient(to right, #3b82f6, #4f46e5)',
  'linear-gradient(to right, #22c55e, #0d9488)',
  'linear-gradient(to right, #a855f7, #7c3aed)',
  'linear-gradient(to right, #f59e0b, #ca8a04)',
  'linear-gradient(to right, #ec4899, #e11d48)',
];

interface TeamTableProps {
  teams: TeamData[];
}

export default function TeamTable({ teams }: TeamTableProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto w-full">
      {teams.map((team) => {
        const bg = TEAM_GRADIENTS[(team.teamNumber - 1) % TEAM_GRADIENTS.length];
        return (
          <div
            key={team.teamNumber}
            className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden border border-white/20"
          >
            {/* 팀 헤더 */}
            <div className="px-4 py-3 text-center" style={{ background: bg }}>
              <p className="text-white font-bold text-2xl">{team.teamNumber}팀</p>
            </div>
            {/* 팀원 목록 */}
            <div className="p-4 space-y-2">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <span className="text-xl">{member.emoji}</span>
                  <span className="text-white font-medium text-lg leading-tight">
                    {member.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
