import React, { useMemo } from 'react';
import { useParticipants } from '../context/ParticipantsContext';
import { LEVELS } from '../constants';
import type { Participant, Level } from '../types';

interface ParticipantStats extends Participant {
  totalDistance: number;
  runCount: number;
  level: Level;
  nextLevel: Level | null;
  progressToNextLevel: number;
}

const getLevelForDistance = (distance: number): Level => {
  return LEVELS.find(level => distance >= level.minDistance) ?? LEVELS[LEVELS.length - 1];
};

const ParticipantCard: React.FC<{ participant: ParticipantStats; rank: number }> = ({ participant, rank }) => {
  const { level, nextLevel, totalDistance } = participant;
  const progressPercentage = nextLevel ? ((totalDistance - level.minDistance) / (nextLevel.minDistance - level.minDistance)) * 100 : 100;

  return (
    <div className={`rounded-xl shadow-lg p-4 flex flex-col space-y-3 transition-all duration-300 transform hover:scale-105 ${level.color} ${level.textColor}`}>
      <div className="flex items-center space-x-4">
        <span className="text-3xl font-black w-8 text-center">{rank}</span>
        <img src={participant.photo} alt={participant.name} className="w-16 h-16 rounded-full object-cover border-4 border-white/50" />
        <div className="flex-1">
          <h3 className="text-xl font-bold">{participant.name}</h3>
          <p className="text-sm font-semibold opacity-90">{level.name}</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-4xl font-extrabold">{participant.totalDistance.toFixed(1)} <span className="text-xl font-semibold">km</span></p>
        <p className="text-sm opacity-80">{participant.runCount}회 달림</p>
      </div>
      <div>
        <div className="w-full bg-black/20 rounded-full h-4">
          <div 
            className="bg-white/80 h-4 rounded-full" 
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-center mt-1 font-medium">
          {nextLevel 
            ? `${nextLevel.name}까지 ${(nextLevel.minDistance - totalDistance).toFixed(1)}km 남음`
            : "최고 레벨 달성!"}
        </p>
      </div>
    </div>
  );
};

const PodiumItem: React.FC<{ participant: ParticipantStats; rank: number; metric: string; metricValue: string | number }> = ({ participant, rank, metric, metricValue }) => {
  const rankStyles = {
    1: { order: 2, transform: 'translateY(-1.5rem) scale(1.1)', color: 'bg-amber-400', medal: '🥇' },
    // FIX: Added 'transform: undefined' to ensure consistent object shape and prevent type errors when accessing 'style.transform'.
    2: { order: 1, color: 'bg-slate-300', medal: '🥈', transform: undefined },
    3: { order: 3, color: 'bg-orange-400', medal: '🥉', transform: undefined },
  };

  const style = rankStyles[rank as keyof typeof rankStyles];

  return (
    <div className="flex-1 flex flex-col items-center p-2 transition-transform duration-300" style={{ order: style.order, transform: style.transform || 'none' }}>
      <div className={`${style.color} rounded-lg p-3 text-center w-full max-w-[150px] shadow-lg`}>
        <p className="text-4xl">{style.medal}</p>
        <img src={participant.photo} alt={participant.name} className="w-16 h-16 rounded-full object-cover mx-auto border-4 border-white/50 mb-2" />
        <p className="font-bold text-slate-800 truncate">{participant.name}</p>
        <p className="text-xl font-black text-slate-900">{metricValue} <span className="text-sm font-semibold">{metric}</span></p>
      </div>
    </div>
  );
};

const Podium: React.FC<{ title: string; participants: ParticipantStats[]; metric: string; valueExtractor: (p: ParticipantStats) => number | string }> = ({ title, participants, metric, valueExtractor }) => {
  if (participants.length === 0) return null;

  return (
    <div className="bg-slate-800 p-4 rounded-lg mb-8">
      <h3 className="text-2xl font-bold text-orange-400 mb-6 text-center">{title}</h3>
      <div className="flex items-end justify-center min-h-[240px]">
        {participants.length > 1 && <PodiumItem participant={participants[1]} rank={2} metric={metric} metricValue={valueExtractor(participants[1])} />}
        {participants.length > 0 && <PodiumItem participant={participants[0]} rank={1} metric={metric} metricValue={valueExtractor(participants[0])} />}
        {participants.length > 2 && <PodiumItem participant={participants[2]} rank={3} metric={metric} metricValue={valueExtractor(participants[2])} />}
      </div>
    </div>
  );
};


const Legend: React.FC = () => (
    <div className="bg-slate-800 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-bold text-orange-400 mb-2">레벨 가이드</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {LEVELS.slice(0).reverse().map(level => (
                <div key={level.name} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${level.color}`}></div>
                    <span className="text-slate-300">{`${level.minDistance}km: ${level.name}`}</span>
                </div>
            ))}
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
  const { participants } = useParticipants();

  const processedParticipants = useMemo<ParticipantStats[]>(() => {
    return participants.map(p => {
      const totalDistance = p.runs.reduce((sum, run) => sum + run.distance, 0);
      const level = getLevelForDistance(totalDistance);
      const currentLevelIndex = LEVELS.findIndex(l => l.name === level.name);
      const nextLevel = currentLevelIndex > 0 ? LEVELS[currentLevelIndex - 1] : null;
      
      return {
        ...p,
        totalDistance,
        runCount: p.runs.length,
        level,
        nextLevel,
        progressToNextLevel: nextLevel ? nextLevel.minDistance - totalDistance : 0,
      };
    });
  }, [participants]);
  
  const rankedByDistance = useMemo(() => {
    return [...processedParticipants].sort((a, b) => b.totalDistance - a.totalDistance);
  }, [processedParticipants]);

  const rankedByTogetherRuns = useMemo(() => {
    return [...processedParticipants]
      .filter(p => p.runCount > 0)
      .sort((a, b) => b.runCount - a.runCount);
  }, [processedParticipants]);

  if (participants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div className="bg-slate-800 p-10 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">대시보드가 비어있습니다</h2>
          <p className="text-slate-300">참가자를 등록하고 기록을 제출하여 리더보드를 확인하세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-4xl font-extrabold text-center mb-2 text-orange-500">리더보드</h2>
      <p className="text-center text-slate-400 mb-6">다음 킵초게는 누구?</p>
      
      <Podium 
          title="누적 거리 TOP 3"
          participants={rankedByDistance.slice(0, 3)}
          metric="km"
          valueExtractor={(p) => p.totalDistance.toFixed(1)}
      />

      <Podium
          title="함께 달리기 TOP 3 (횟수)"
          participants={rankedByTogetherRuns.slice(0, 3)}
          metric="회"
          valueExtractor={(p) => p.runCount}
      />

      <div className="mt-10">
        <h3 className="text-3xl font-bold text-orange-400 mb-4 text-center">전체 순위 (거리순)</h3>
        <Legend />
        <div className="space-y-4">
            {rankedByDistance.map((p, index) => (
            <ParticipantCard key={p.id} participant={p} rank={index + 1} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;