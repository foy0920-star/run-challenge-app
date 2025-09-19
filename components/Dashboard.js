import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.js';
import { DISTANCE_LEVELS } from '../constants.js';

const LeaderboardItem = ({ data, rank }) => {
    const currentLevel = useMemo(() => {
        return DISTANCE_LEVELS.find(l => data.totalDistance >= l.min) ?? DISTANCE_LEVELS[DISTANCE_LEVELS.length - 1];
    }, [data.totalDistance]);

    const nextLevel = useMemo(() => {
        return [...DISTANCE_LEVELS].reverse().find(l => data.totalDistance < l.min);
    }, [data.totalDistance]);
    
    const progressToNextLevel = useMemo(() => {
        if (!nextLevel) return 100;
        const currentLevelMin = currentLevel.min;
        const levelRange = nextLevel.min - currentLevelMin;
        if (levelRange <= 0) return 100;
        const progressInLevel = data.totalDistance - currentLevelMin;
        return Math.floor((progressInLevel / levelRange) * 100);
    }, [data.totalDistance, currentLevel, nextLevel]);

    return (
        React.createElement('div', { className: `relative flex items-center space-x-4 p-4 rounded-lg shadow-md border-l-4 ${currentLevel.color} ${currentLevel.borderColor} transition-transform hover:scale-[1.02]` },
            React.createElement('span', { className: "absolute top-2 left-2 text-xs font-bold text-gray-500" }, `#${rank}`),
            React.createElement('img', { src: data.user.photoUrl, alt: data.user.name, className: "w-16 h-16 rounded-full object-cover border-2 border-slate-500" }),
            React.createElement('div', { className: "flex-1" },
                React.createElement('div', { className: "flex justify-between items-center" },
                    React.createElement('p', { className: `font-bold text-lg ${currentLevel.textColor}` }, data.user.name),
                    React.createElement('p', { className: `font-bold text-xl ${currentLevel.textColor}` }, `${data.totalDistance.toFixed(2)} km`)
                ),
                React.createElement('div', { className: "text-sm text-gray-400 mt-1" },
                    React.createElement('span', { className: "font-semibold" }, `${currentLevel.name}`), ` | ${data.runCount}회 달림`
                ),
                 nextLevel && (
                    React.createElement('div', { className: "mt-2" },
                        React.createElement('div', { className: "flex justify-between text-xs mb-1 text-gray-400" },
                            React.createElement('span', null, `다음 레벨: ${nextLevel.name}`),
                            React.createElement('span', null, `${(nextLevel.min - data.totalDistance).toFixed(1)}km 남음`)
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
        React.createElement('div', { className: "flex flex-wrap justify-center gap-x-4 gap-y-2" },
            [...DISTANCE_LEVELS].filter(l => l.min > 0).reverse().map(level => (
                React.createElement('div', { key: level.level, className: "flex items-center space-x-2 text-xs sm:text-sm" },
                    React.createElement('div', { className: `w-4 h-4 rounded-full ${level.color} border ${level.borderColor}` }),
                    React.createElement('span', { className: "text-slate-300" }, `${level.min}km+: `, React.createElement('span', { className: "font-semibold" }, level.name))
                )
            ))
        )
    )
);

const Dashboard = () => {
    const { users, records } = useAppContext();

    const leaderboardData = useMemo(() => {
        const data = users.map(user => {
            const userRecords = records.filter(r => r.userId === user.id);
            const totalDistance = userRecords.reduce((sum, r) => sum + r.distance, 0);
            const runCount = userRecords.length;
            return { user, totalDistance, runCount };
        });
        return data.sort((a, b) => b.totalDistance - a.totalDistance);
    }, [users, records]);

    if(users.length === 0){
        return React.createElement('div', { className: "text-center p-10 bg-slate-800/80 rounded-lg backdrop-blur-sm" },
            React.createElement('h2', { className: "text-xl text-slate-300" }, "아직 등록된 참가자가 없습니다."),
            React.createElement('p', { className: "text-slate-400 mt-2" }, "기록 제출 페이지에서 먼저 참가자를 등록해주세요.")
        );
    }

    return (
        React.createElement('div', { className: "space-y-8" },
            React.createElement('div', null,
                React.createElement('h2', { className: "text-3xl font-bold text-center mb-4 text-orange-400", style: {fontFamily: "'Noto Sans KR', sans-serif"} }, "전체 순위"),
                React.createElement(LevelsGuide),
                React.createElement('div', { className: "space-y-4" },
                    leaderboardData.map((data, index) => (
                        React.createElement(LeaderboardItem, { key: data.user.id, data: data, rank: index + 1 })
                    ))
                )
            )
        )
    );
};

export default Dashboard;