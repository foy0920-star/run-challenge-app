import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.js';
import { Page } from '../types.js';
import { DISTANCE_LEVELS } from '../constants.js';

const PodiumItem = ({ rank, data, metric, unit }) => {
    const rankStyles = {
        1: { transform: 'translateY(-15px)', bg: 'bg-amber-400', text: 'text-amber-900', size: 'w-24 h-24', ring: 'ring-amber-400' },
        2: { transform: 'translateY(0px)', bg: 'bg-slate-400', text: 'text-slate-900', size: 'w-20 h-20', ring: 'ring-slate-400' },
        3: { transform: 'translateY(5px)', bg: 'bg-orange-400', text: 'text-orange-900', size: 'w-16 h-16', ring: 'ring-orange-400' },
    };
    const style = rankStyles[rank];
    return (
        React.createElement('div', { className: "flex flex-col items-center mx-2", style: { transform: style.transform } },
            React.createElement('div', { className: "relative" },
                React.createElement('img', { src: data.user.photoUrl, alt: data.user.name, className: `${style.size} rounded-full object-cover border-4 border-slate-600 ring-4 ${style.ring}` }),
                React.createElement('div', { className: `absolute -bottom-2 left-1/2 -translate-x-1/2 ${style.bg} ${style.text} rounded-full w-7 h-7 flex items-center justify-center font-bold text-base` }, rank)
            ),
            React.createElement('p', { className: "mt-4 font-bold text-slate-100 text-sm sm:text-base" }, data.user.name),
            React.createElement('p', { className: "text-orange-400 text-base sm:text-lg font-semibold" }, `${metric} ${unit}`)
        )
    );
};

const LeaderboardItem = ({ data, rank }) => {
    const currentLevel = useMemo(() => {
        return [...DISTANCE_LEVELS].sort((a,b) => b.min - a.min).find(l => data.totalDistance >= l.min) ?? DISTANCE_LEVELS[DISTANCE_LEVELS.length - 1];
    }, [data.totalDistance]);

    const nextLevel = useMemo(() => {
         const sortedLevels = [...DISTANCE_LEVELS].sort((a,b) => a.min - b.min);
         return sortedLevels.find(l => data.totalDistance < l.min);
    }, [data.totalDistance]);
    
    const progressToNextLevel = useMemo(() => {
        if (!nextLevel) return 100;
        const currentLevelMin = [...DISTANCE_LEVELS].sort((a,b) => b.min - a.min).find(l => data.totalDistance >= l.min)?.min ?? 0;
        const levelRange = nextLevel.min - currentLevelMin;
        if (levelRange <= 0) return 100;
        const progressInLevel = data.totalDistance - currentLevelMin;
        return Math.floor((progressInLevel / levelRange) * 100);
    }, [data.totalDistance, nextLevel]);

    return (
        React.createElement('div', { className: `relative flex items-center space-x-4 p-4 rounded-lg shadow-md border-l-4 ${currentLevel.color} ${currentLevel.borderColor} transition-transform hover:scale-[1.02]` },
            React.createElement('span', { className: "absolute top-2 left-2 text-xs font-bold text-gray-500" }, `#${rank}`),
            React.createElement('img', { src: data.user.photoUrl, alt: data.user.name, className: "w-16 h-16 rounded-full object-cover border-2 border-slate-500" }),
            React.createElement('div', { className: "flex-1" },
                React.createElement('div', { className: "flex justify-between items-center" },
                    React.createElement('p', { className: `font-bold text-lg ${currentLevel.textColor}` }, data.user.name),
                    React.createElement('p', { className: `font-bold text-xl ${currentLevel.textColor}` }, `${data.totalDistance.toFixed(2)} km`)
                ),
                React.createElement('div', { className: "text-sm text-gray-500 mt-1" },
                    React.createElement('span', { className: "font-semibold" }, currentLevel.name), ` | ${data.runCount}회 달림 | 함께 달리기: ${data.togetherRuns}회`
                ),
                 nextLevel && (
                    React.createElement('div', { className: "mt-2" },
                        React.createElement('div', { className: "flex justify-between text-xs mb-1 text-gray-400" },
                            React.createElement('span', null, `다음 레벨: ${nextLevel.name}`),
                            React.createElement('span', null, nextLevel.min - data.totalDistance > 0 ? `${(nextLevel.min - data.totalDistance).toFixed(1)}km 남음` : '달성!')
                        ),
                        React.createElement('div', { className: "w-full bg-gray-600 rounded-full h-2.5" },
                            React.createElement('div', { className: "bg-orange-500 h-2.5 rounded-full", style: { width: `${progressToNextLevel}%` } })
                        )
                    )
                )
            )
        )
    );
};

const LevelsGuide = () => (
    React.createElement('div', { className: "bg-slate-800/80 p-4 rounded-lg border border-slate-700 mb-8 backdrop-blur-sm" },
        React.createElement('h3', { className: "text-lg font-bold text-orange-400 mb-3 text-center" }, "레벨 가이드"),
        React.createElement('div', { className: "flex flex-wrap justify-center gap-2 sm:gap-4" },
            [...DISTANCE_LEVELS].sort((a, b) => a.min - b.min).map(level => (
                level.min > 0 && React.createElement('div', { key: level.level, className: "flex items-center space-x-2 text-xs sm:text-sm" },
                    React.createElement('div', { className: `w-4 h-4 rounded-full ${level.color} border ${level.borderColor}` }),
                    React.createElement('span', { className: "text-slate-300" }, `${level.min}km+: `, React.createElement('span', { className: "font-semibold" }, level.name))
                )
            ))
        )
    )
);

const Dashboard = ({ setCurrentPage }) => {
    const { users, records } = useAppContext();

    const aggregatedData = useMemo(() => {
        return users.map(user => {
            const userRecords = records.filter(r => r.userId === user.id);
            const totalDistance = userRecords.reduce((sum, r) => sum + r.distance, 0);
            const runCount = userRecords.length;
            const togetherRuns = userRecords.filter(r => r.ranWithOthers).length;
            return { user, totalDistance, runCount, togetherRuns };
        });
    }, [users, records]);

    const topByDistance = useMemo(() => [...aggregatedData].sort((a, b) => b.totalDistance - a.totalDistance).slice(0, 3), [aggregatedData]);
    const topByTogether = useMemo(() => [...aggregatedData].sort((a, b) => b.togetherRuns - a.togetherRuns).slice(0, 3), [aggregatedData]);
    const leaderboard = useMemo(() => [...aggregatedData].sort((a, b) => b.totalDistance - a.totalDistance), [aggregatedData]);

    if(users.length === 0){
        return React.createElement('div', { className: "text-center p-10 bg-slate-800/80 rounded-lg backdrop-blur-sm" },
            React.createElement('h2', { className: "text-xl text-slate-300" }, "아직 등록된 참가자가 없습니다."),
            React.createElement('p', { className: "text-slate-400 mt-2" }, "기록 제출 페이지에서 먼저 참가자를 등록해주세요.")
        );
    }

    return (
        React.createElement('div', { className: "space-y-12" },
            React.createElement('div', null,
                React.createElement('h2', { className: "text-3xl font-bold text-center mb-4 text-orange-400", style: {fontFamily: "'Noto Sans KR', sans-serif"} }, "최장 거리 TOP 3"),
                React.createElement('div', { className: "bg-slate-800/80 p-6 rounded-xl shadow-2xl border border-slate-700 flex justify-center items-end h-56 backdrop-blur-sm" },
                    topByDistance[1] && React.createElement(PodiumItem, { rank: 2, data: topByDistance[1], metric: topByDistance[1].totalDistance.toFixed(1), unit: "km" }),
                    topByDistance[0] && React.createElement(PodiumItem, { rank: 1, data: topByDistance[0], metric: topByDistance[0].totalDistance.toFixed(1), unit: "km" }),
                    topByDistance[2] && React.createElement(PodiumItem, { rank: 3, data: topByDistance[2], metric: topByDistance[2].totalDistance.toFixed(1), unit: "km" })
                )
            ),

            React.createElement('div', null,
                React.createElement('h2', { className: "text-3xl font-bold text-center mb-4 text-orange-400", style: {fontFamily: "'Noto Sans KR', sans-serif"} }, "함께 달리기 TOP 3"),
                React.createElement('div', { className: "bg-slate-800/80 p-6 rounded-xl shadow-2xl border border-slate-700 flex justify-center items-end h-56 backdrop-blur-sm" },
                    topByTogether[1] && React.createElement(PodiumItem, { rank: 2, data: topByTogether[1], metric: String(topByTogether[1].togetherRuns), unit: "회" }),
                    topByTogether[0] && React.createElement(PodiumItem, { rank: 1, data: topByTogether[0], metric: String(topByTogether[0].togetherRuns), unit: "회" }),
                    topByTogether[2] && React.createElement(PodiumItem, { rank: 3, data: topByTogether[2], metric: String(topByTogether[2].togetherRuns), unit: "회" })
                )
            ),
            
            React.createElement('div', null,
                React.createElement('h2', { className: "text-3xl font-bold text-center mb-4 text-orange-400", style: {fontFamily: "'Noto Sans KR', sans-serif"} }, "전체 순위"),
                React.createElement(LevelsGuide),
                React.createElement('div', { className: "space-y-4" },
                    leaderboard.map((data, index) => (
                        React.createElement(LeaderboardItem, { key: data.user.id, data: data, rank: index + 1 })
                    ))
                )
            ),

            React.createElement('div', { className: "mt-12 pt-8 border-t border-slate-700 flex justify-center space-x-4" },
                 React.createElement('button', {
                    onClick: () => setCurrentPage(Page.Submit),
                    className: "px-6 py-3 text-base font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-slate-300 hover:bg-slate-700 hover:text-white"
                },
                    "기록 제출"
                ),
                React.createElement('button', {
                    onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
                    className: "px-6 py-3 text-base font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-500 text-white shadow-lg"
                },
                    "맨 위로"
                )
            )
        )
    );
};

export default Dashboard;
