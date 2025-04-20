import Image from 'next/image';
import Link from 'next/link';

export default function LeaderboardPreviewCard({ players = [], showWorkouts = false, teamName = null }) {
  const medalIcons = ['🥇', '🥈', '🥉'];

  const filteredPlayers = teamName ? players.filter(p => p.team === teamName) : players;

  return (
    <Link href="/leaderboard" className="block cursor-pointer">
      <div className="bg-[#1a1a2a] border border-purple-700 p-4 rounded-lg shadow-md hover:shadow-glow hover:border-purple-500 transition">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
  <h3 className="text-lg font-semibold">🌍 Global Leaderboard</h3>
  <select className="text-sm bg-gray-800 text-white border border-gray-600 rounded px-2 py-1">
    <option>All Time</option>
    <option>Monthly</option>
    <option>Weekly</option>
  </select>
</div>
        <div className="rounded-md overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {filteredPlayers.map((player, index) => (
              <li key={player.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap text-left">
                  <span className="text-sm text-gray-300 font-mono">
                    {medalIcons[index] || `#${index + 1}`}
                  </span>
                  {player.avatar_url ? (
                    <Image
                      src={`https://uitlajpnqruvvykrcyyg.supabase.co/storage/v1/object/public/avatars/${player.avatar_url}`}
                      alt={player.name}
                      width={28}
                      height={28}
                      style={{ height: 'auto', width: 'auto' }}
                      className="rounded-full border"
                    />
                  ) : (
                    <Image
                      src="/default-avatar.png"
                      alt="avatar"
                      width={28}
                      height={28}
                      style={{ height: 'auto', width: 'auto' }}
                      className="rounded-full border"
                    />
                  )}
                  <div className="text-white font-semibold">
                    {player.name}
                    {player.team && (
                      <span className="ml-2 text-sm text-gray-400">({player.team})</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 ml-4">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600"
                      style={{ width: `${Math.min((player.points || 0) / 5, 100)}%` }}
                    ></div>
                  </div>
                </div>
                {showWorkouts ? (
                  <span className="text-xs text-gray-400 ml-4 min-w-[100px] text-right">
                    ⏱ {Math.round(player.workoutTime / 60)} mins • 🔁 {player.sessions}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 ml-4 min-w-[60px] text-right">{player.points} XP</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Link>
  );
}
