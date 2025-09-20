import React, { useMemo, useState } from 'react';
import { Participant, RunRecord, RunnerLevel, ParticipantStats } from '../types';
import { RUNNER_LEVELS, GOLD_LEVEL_MIN_DISTANCE, GOLD_LEVEL_COLOR } from '../constants';
import { EditIcon, TrashIcon, GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon } from '../components/icons';

interface DashboardPageProps {
  participants: Participant[];
  runRecords: RunRecord[];
  updateRunRecord: (record: RunRecord) => void;
  deleteRunRecord: (recordId: string) => void;
}

const getRunnerLevel = (distance: number): RunnerLevel => {
    return RUNNER_LEVELS.find(level => distance >= level.minDistance) || RUNNER_LEVELS[RUNNER_LEVELS.length - 1];
};

const Podium: React.FC<{ title: string; top3: ParticipantStats[]; statKey: 'totalDistance' | 'groupRunCount' }> = ({ title, top3, statKey }) => {
    const podiumData = [
        {
            runner: top3[1], // 2nd place
            height: 'h-32',
            color: 'bg-gray-400',
            text: 'text-gray-900',
            medal: <SilverMedalIcon />,
        },
        {
            runner: top3[0], // 1st place
            height: 'h-40',
            color: 'bg-yellow-400',
            text: 'text-gray-900',
            medal: <GoldMedalIcon />,
        },
        {
            runner: top3[2], // 3rd place
            height: 'h-24',
            color: 'bg-yellow-700',
            text: 'text-white',
            medal: <BronzeMedalIcon />,
        },
    ];

    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-bold text-center mb-4 text-yellow-400">{title}</h2>
            <div className="flex justify-center items-end h-56 space-x-2">
                {podiumData.map((data, index) => {
                    if (!data.runner) {
                        return <div key={index} className="w-1/3" />;
                    }
                    return (
                        <div key={data.runner.id} className="w-1/3 flex flex-col items-center justify-end">
                            {data.medal}
                            <img src={data.runner.photoUrl} alt={data.runner.name} className="w-12 h-12 rounded-full object-cover border-2 border-white mt-2 mb-2" />
                            <div className={`w-full ${data.height} ${data.color} rounded-t-lg flex flex-col items-center justify-center p-1 ${data.text}`}>
                                <p className="font-bold text-sm truncate">{data.runner.name}</p>
                                <p className="text-lg font-bold">
                                    {statKey === 'totalDistance' ? `${data.runner.totalDistance.toFixed(1)} km` : `${data.runner.groupRunCount} 회`}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const EditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    participant: ParticipantStats;
    records: RunRecord[];
    updateRunRecord: (record: RunRecord) => void;
    deleteRunRecord: (recordId: string) => void;
}> = ({ isOpen, onClose, participant, records, updateRunRecord, deleteRunRecord }) => {
    if (!isOpen) return null;
    const [editingRecord, setEditingRecord] = useState<RunRecord | null>(null);
    const [newDistance, setNewDistance] = useState(0);

    const handleEdit = (record: RunRecord) => {
        setEditingRecord(record);
        setNewDistance(record.distance);
    };

    const handleSave = () => {
        if (editingRecord) {
            updateRunRecord({ ...editingRecord, distance: newDistance });
            setEditingRecord(null);
        }
    };

    const handleDeletePhoto = (record: RunRecord, photoType: 'record' | 'group') => {
        const updatedRecord = {...record};
        if(photoType === 'record') {
            alert('기록 사진은 삭제할 수 없습니다. 기록 자체를 삭제해주세요.');
            return;
        } else {
           delete updatedRecord.groupRunPhotoUrl;
        }
        updateRunRecord(updatedRecord);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
                    <h3 className="text-lg font-bold text-yellow-400">{participant.name} 기록 수정</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-4 space-y-4">
                    {records.length > 0 ? records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                        <div key={record.id} className="bg-gray-700 p-3 rounded-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-400">{new Date(record.date).toLocaleDateString()}</p>
                                    {editingRecord?.id === record.id ? (
                                        <div className="flex items-center mt-2">
                                            <input type="number" value={newDistance} onChange={e => setNewDistance(parseFloat(e.target.value))} className="bg-gray-800 w-24 rounded-md p-1 text-white" />
                                            <button onClick={handleSave} className="ml-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm">저장</button>

                                            <button onClick={() => setEditingRecord(null)} className="ml-2 bg-gray-500 text-white px-2 py-1 rounded-md text-sm">취소</button>
                                        </div>
                                    ) : (
                                        <p className="font-bold text-lg">{record.distance} km</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                     <button onClick={() => handleEdit(record)} className="text-blue-400 hover:text-blue-300"><EditIcon /></button>
                                     <button onClick={() => deleteRunRecord(record.id)} className="text-red-500 hover:text-red-400"><TrashIcon /></button>
                                </div>
                            </div>
                             <div className="flex space-x-2 mt-2">
                                <div className="relative">
                                    <img src={record.recordPhotoUrl} className="w-16 h-16 rounded object-cover"/>
                                    <span className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded-tr-md">기록</span>
                                </div>
                                {record.groupRunPhotoUrl && (
                                    <div className="relative">
                                        <img src={record.groupRunPhotoUrl} className="w-16 h-16 rounded object-cover"/>
                                        <span className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded-tr-md">함께</span>
                                        <button onClick={()=> handleDeletePhoto(record, 'group')} className="absolute top-0 right-0 bg-red-600 rounded-full w-4 h-4 text-white flex items-center justify-center text-xs">&times;</button>
                                    </div>
                                )}
                             </div>
                        </div>
                    )) : <p className="text-gray-400 text-center">제출된 기록이 없습니다.</p>}
                </div>
            </div>
        </div>
    );
};

const ParticipantCard: React.FC<{ 
    participant: ParticipantStats;
    rank: number;
    onEdit: () => void;
}> = ({ participant, rank, onEdit }) => {
    const level = getRunnerLevel(participant.totalDistance);
    const nextLevel = RUNNER_LEVELS[RUNNER_LEVELS.indexOf(level) - 1];
    const progress = nextLevel ? (participant.totalDistance - level.minDistance) / (nextLevel.minDistance - level.minDistance) * 100 : 100;
    const remaining = nextLevel ? (nextLevel.minDistance - participant.totalDistance).toFixed(1) : 0;
    
    const bgColor = participant.totalDistance >= GOLD_LEVEL_MIN_DISTANCE ? GOLD_LEVEL_COLOR : level.color;

    return (
        <div className={`p-4 rounded-xl shadow-md flex space-x-4 items-center ${bgColor} text-gray-900`}>
            <div className="text-2xl font-bold w-8 text-center">{rank}</div>
            <img src={participant.photoUrl} alt={participant.name} className="w-16 h-16 rounded-full object-cover border-2 border-white" />
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{participant.name}</h3>
                    <button onClick={onEdit} className="text-gray-700 hover:text-black"><EditIcon /></button>
                </div>
                <p className="font-semibold text-xl">{participant.totalDistance.toFixed(1)} km</p>
                <div className="text-xs space-x-2">
                    <span>달리기: {participant.runCount}회</span>
                    <span>함께: {participant.groupRunCount}회</span>
                </div>
                <div className="mt-2">
                    <div className="flex justify-between text-xs font-medium mb-1">
                        <span>{level.name} ({level.level})</span>
                        {nextLevel && <span>다음 레벨까지 {remaining}km</span>}
                    </div>
                    <div className="w-full bg-gray-600 bg-opacity-50 rounded-full h-2">
                        <div className="bg-white rounded-full h-2" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardPage: React.FC<DashboardPageProps> = ({ participants, runRecords, updateRunRecord, deleteRunRecord }) => {
    const [editingParticipant, setEditingParticipant] = useState<ParticipantStats | null>(null);

    const participantStats = useMemo<ParticipantStats[]>(() => {
        return participants.map(p => {
            const records = runRecords.filter(r => r.participantId === p.id);
            return {
                id: p.id,
                name: p.name,
                photoUrl: p.photoUrl,
                totalDistance: records.reduce((sum, r) => sum + r.distance, 0),
                runCount: records.length,
                groupRunCount: records.filter(r => r.groupRunPhotoUrl).length,
            };
        });
    }, [participants, runRecords]);

    const top3ByDistance = useMemo(() => [...participantStats].sort((a, b) => b.totalDistance - a.totalDistance).slice(0, 3), [participantStats]);
    const top3ByGroupRun = useMemo(() => [...participantStats].sort((a, b) => b.groupRunCount - a.groupRunCount).slice(0, 3), [participantStats]);
    const leaderboard = useMemo(() => [...participantStats].sort((a, b) => b.totalDistance - a.totalDistance), [participantStats]);

    const handleEditClick = (participant: ParticipantStats) => {
        setEditingParticipant(participant);
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-4xl font-extrabold text-center mb-6 text-yellow-400">챌린지 대시보드</h1>
            <Podium title="누적 거리 TOP 3" top3={top3ByDistance} statKey="totalDistance" />
            <Podium title="함께 달리기 TOP 3" top3={top3ByGroupRun} statKey="groupRunCount" />
            
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-center mb-4 text-yellow-400">전체 순위</h2>
                 <div className="bg-gray-800 p-2 rounded-lg mb-4">
                    <p className="text-sm text-gray-300"><strong>레벨 가이드:</strong></p>
                    <div className="flex flex-wrap text-xs mt-1 gap-x-2 gap-y-1">
                        {RUNNER_LEVELS.map(l => <span key={l.name}><span className={`${l.textColor}`}>●</span> {l.minDistance}km: {l.name}</span>)}
                        <span><span className="text-yellow-400">●</span> {GOLD_LEVEL_MIN_DISTANCE}km+: ★황금 레벨★</span>
                    </div>
                </div>
                <div className="space-y-4">
                    {leaderboard.map((p, index) => (
                        <ParticipantCard key={p.id} participant={p} rank={index + 1} onEdit={() => handleEditClick(p)}/>
                    ))}
                </div>
            </div>

            {editingParticipant && (
                <EditModal
                    isOpen={!!editingParticipant}
                    onClose={() => setEditingParticipant(null)}
                    participant={editingParticipant}
                    records={runRecords.filter(r => r.participantId === editingParticipant.id)}
                    updateRunRecord={updateRunRecord}
                    deleteRunRecord={deleteRunRecord}
                />
            )}
        </div>
    );
};

export default DashboardPage;