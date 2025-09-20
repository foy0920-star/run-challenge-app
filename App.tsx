
import React, { useState, useEffect, useCallback } from 'react';
// FIX: Import NavLink from react-router-dom
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
// FIX: Removed modular Firestore imports to switch to v8-compatible API.
import { db } from './firebase'; // Import the db instance
import { Participant, RunRecord } from './types';
import RegisterPage from './pages/RegisterPage';
import SubmitRecordPage from './pages/SubmitRecordPage';
import DashboardPage from './pages/DashboardPage';
import { AdminPanel } from './components/AdminPanel';
import { HomeIcon, TrophyIcon, UserPlusIcon } from './components/icons';
// FIX: Removed incorrect import for AppHeader as it is defined below.


const App: React.FC = () => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [runRecords, setRunRecords] = useState<RunRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastDeleted, setLastDeleted] = useState<{ type: 'participant' | 'record', data: any } | null>(null);
    const [isAdminVisible, setIsAdminVisible] = useState(false);
    const [isPasswordPromptVisible, setIsPasswordPromptVisible] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Fetch data from Firestore in real-time
    useEffect(() => {
        setLoading(true);
        // FIX: Use v8-compatible onSnapshot syntax.
        const unsubscribeParticipants = db.collection('participants').onSnapshot((snapshot) => {
            const participantsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
            setParticipants(participantsData);
        });

        // FIX: Use v8-compatible onSnapshot syntax.
        const unsubscribeRunRecords = db.collection('runRecords').onSnapshot((snapshot) => {
            const runRecordsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RunRecord));
            setRunRecords(runRecordsData);
            setLoading(false);
        });

        // Cleanup function
        return () => {
            unsubscribeParticipants();
            unsubscribeRunRecords();
        };
    }, []);

    const addParticipant = useCallback(async (participant: Omit<Participant, 'id'>) => {
        // FIX: Use v8-compatible add syntax.
        await db.collection('participants').add(participant);
    }, []);

    const addRunRecord = useCallback(async (record: Omit<RunRecord, 'id' | 'date'>) => {
        // FIX: Use v8-compatible add syntax.
        await db.collection('runRecords').add({ ...record, date: new Date().toISOString() });
    }, []);

    const updateRunRecord = useCallback(async (updatedRecord: RunRecord) => {
        // FIX: Use v8-compatible update syntax.
        const recordRef = db.collection('runRecords').doc(updatedRecord.id);
        const { id, ...dataToUpdate } = updatedRecord;
        await recordRef.update(dataToUpdate);
    }, []);

    const deleteRunRecord = useCallback(async (recordId: string) => {
        // For undo, we'd need a more complex system, maybe a "deleted" flag
        // FIX: Use v8-compatible delete syntax.
        await db.collection('runRecords').doc(recordId).delete();
    }, []);

    const deleteParticipant = useCallback(async (participantId: string) => {
        // FIX: Use v8-compatible batch write syntax.
        const batch = db.batch();
        
        // Delete participant
        const participantRef = db.collection('participants').doc(participantId);
        batch.delete(participantRef);

        // Find and delete associated run records
        const q = db.collection('runRecords').where('participantId', '==', participantId);
        const querySnapshot = await q.get();
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        // Undo is complex with Firestore batch deletes, so it's removed for now.
        setLastDeleted(null);
    }, []);

    const undoLastDelete = useCallback(() => {
        // Firestore undo is complex and would require writing back the deleted data.
        // For simplicity, this is disabled in the Firestore version.
        alert("되돌리기 기능은 현재 지원되지 않습니다.");
        setLastDeleted(null);
    }, []);
    
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === 'gkgkgh12!@') {
            setIsAdminVisible(true);
            setIsPasswordPromptVisible(false);
            setPasswordInput('');
            setPasswordError('');
        } else {
            setPasswordError('비밀번호가 올바르지 않습니다.');
            setPasswordInput('');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-lg">데이터를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <HashRouter>
            <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
                <AppHeader />
                <main className="pt-4 pb-20">
                    <Routes>
                        <Route path="/" element={<SubmitRecordPage participants={participants} addRunRecord={addRunRecord} />} />
                        <Route path="/register" element={<RegisterPage addParticipant={addParticipant} />} />
                        <Route path="/dashboard" element={<DashboardPage participants={participants} runRecords={runRecords} updateRunRecord={updateRunRecord} deleteRunRecord={deleteRunRecord} />} />
                    </Routes>
                </main>
                <div 
                    onClick={() => setIsPasswordPromptVisible(true)}
                    className="fixed bottom-4 right-4 bg-indigo-600 w-8 h-8 rounded-full cursor-pointer hover:bg-indigo-500 transition-colors opacity-10"
                    title="Admin Panel">
                </div>
                
                {isPasswordPromptVisible && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
                            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-yellow-400">관리자 접근</h2>
                                <button
                                    onClick={() => {
                                        setIsPasswordPromptVisible(false);
                                        setPasswordError('');
                                        setPasswordInput('');
                                    }}
                                    className="text-gray-400 hover:text-white text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                                <label htmlFor="password-input" className="block text-sm font-medium text-gray-300">비밀번호를 입력하세요</label>
                                <input
                                    id="password-input"
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 text-white block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                                    autoFocus
                                />
                                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-900"
                                >
                                    확인
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                
                <AdminPanel 
                    isVisible={isAdminVisible}
                    onClose={() => setIsAdminVisible(false)}
                    participants={participants}
                    runRecords={runRecords}
                    deleteParticipant={deleteParticipant}
                    lastDeleted={lastDeleted}
                    undoLastDelete={undoLastDelete}
                />
            </div>
        </HashRouter>
    );
};

// New Component for better structure
const AppHeader: React.FC = () => {
    return (
        <header className="sticky top-0 bg-gray-800 border-b border-gray-700 z-10">
            <nav className="max-w-4xl mx-auto flex justify-around">
                <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center p-3 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}`}><HomeIcon /><span className="text-xs mt-1">기록 제출</span></NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => `flex flex-col items-center justify-center p-3 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}`}><TrophyIcon /><span className="text-xs mt-1">대시보드</span></NavLink>
                <NavLink to="/register" className={({ isActive }) => `flex flex-col items-center justify-center p-3 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}`}><UserPlusIcon /><span className="text-xs mt-1">참가자 등록</span></NavLink>
            </nav>
        </header>
    );
}

export default App;
