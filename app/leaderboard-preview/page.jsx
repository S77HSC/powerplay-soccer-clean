'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';

export default function LeaderboardPreview() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: topPlayers } = await supabase
        .from('players')
        .select('name, points, country, avatar_url')
        .order('points', { ascending: false, nullsLast: true })
        .limit(5);

      setPlayers(topPlayers || []);
    };

    fetchData();
  }, []);

  const getCountryFlag = (countryName) => {
    if (!countryName) return null;
    const code = {
      'United Kingdom': 'gb',
      England: 'gb',
      Scotland: 'gb',
      Wales: 'gb',
      USA: 'us',
      'United States': 'us',
      Spain: 'es',
      'South Korea': 'kr',
    }[countryName] || countryName.toLowerCase().slice(0, 2);

    return `https://flagcdn.com/w40/${code}.png`;
  };

  return (
    <div
      onClick={() => window.top.location.href = '/leaderboard'}
      className="cursor-pointer max-w-2xl mx-auto bg-gradient-to-br from-[#1e1e2e] to-[#11111a] p-6 rounded-xl shadow-lg hover:shadow-xl hover:border-purple-500 transition-all"
    >
      <div className="mb-4 max-h-64 overflow-y-auto scrollbar-hide pr-1">
        <h4 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
        </h4>
        <div className="grid grid-cols-3 font-semibold text-sm text-gray-400 mb-2 border-b border-gray-600 pb-1">
          <span>Name</span>
          <span>Flag</span>
          <span className="text-right">XP</span>
        </div>
        {players.map((p, i) => (
          <div key={i} className="grid grid-cols-3 mb-3 items-center gap-2 text-sm">
            <span className="flex items-center gap-2 font-medium text-white">
              <span className="text-gray-400 mr-1">#{i + 1}</span>
              <Image
                src={p.avatar_url ? `https://uitlajpnqruvvykrcyyg.supabase.co/storage/v1/object/public/avatars/${p.avatar_url}` : '/default-avatar.png'}
                alt={p.name}
                width={28}
                height={28}
                className="rounded-full border border-gray-500"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png';
                }}
              />
              {p.name}
            </span>
            <span>
              {p.country && (
                <Image
                  src={getCountryFlag(p.country)}
                  alt={p.country}
                  width={24}
                  height={16}
                  className="inline-block"
                />
              )}
            </span>
            <div className="w-full">
              <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 h-full transition-all duration-700 animate-pulse"
                  style={{ width: `${Math.min((p.points % 1000) / 10, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 text-right mt-1">{p.points} XP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
