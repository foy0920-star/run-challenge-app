
import React from 'react';
import { Participant, RunRecord } from '../types';
import { TrashIcon } from './icons';

interface AdminPanelProps {
    isVisible: boolean;
    onClose: () => void;
    participants: Participant[];
    runRecords: RunRecord[];
    deleteParticipant: (participantId: string) => void;
    lastDeleted: { type: 'participant' | 'record', data: any } | null;
    undoLastDelete: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isVisible, onClose, participants, runRecords, deleteParticipant, lastDeleted, undoLastDelete }) => {
    if (!isVisible) return null;

    const participantStats = participants.map(p => {
        const records = runRecords.filter(r => r.participantId === p.id);
        return {
            id: p.id,
            name: p.name,
            totalDistance: records.reduce((sum, r) => sum + r.distance, 0),
            groupRunCount: records.filter(r => r.groupRunPhotoUrl).length,
        };
    }).sort((a,b) => b.totalDistance - a.totalDistance);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-yellow-400">관리자 패널</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="p-4 flex justify-end">
                    {lastDeleted && (
                         <button onClick={undoLastDelete} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm">
                            되돌리기
                        </button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto px-4 pb-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">이름</th>
                                    <th scope="col" className="px-6 py-3">총 거리 (km)</th>
                                    <th scope="col" className="px-6 py-3">함께 달린 횟수</th>
                                    <th scope="col" className="px-6 py-3">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participantStats.map(p => (
                                    <tr key={p.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{p.name}</td>
                                        <td className="px-6 py-4">{p.totalDistance.toFixed(2)}</td>
                                        <td className="px-6 py-4">{p.groupRunCount}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => deleteParticipant(p.id)} className="text-red-500 hover:text-red-400">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
