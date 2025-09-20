import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipants } from '../context/ParticipantsContext';
import type { Participant } from '../types';
import ManageRecordsModal from '../components/ManageRecordsModal';


const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { participants, deleteParticipant, deleteRun } = useParticipants();
  const navigate = useNavigate();
  const [managingParticipant, setManagingParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    // This effect should only run once on component mount.
    // If auth is already checked, don't prompt again.
    if (sessionStorage.getItem('admin-auth') === 'true') {
      setIsAuthenticated(true);
      return;
    }

    const password = prompt('관리자 비밀번호를 입력하세요:');
    if (password === 'gkgkgh12!@') {
      sessionStorage.setItem('admin-auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 틀렸습니다.');
      navigate('/');
    }
  }, [navigate]);

  const handleOpenModal = (participant: Participant) => {
    setManagingParticipant(participant);
  };
  
  const handleCloseModal = () => {
    setManagingParticipant(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-slate-400">인증 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h2 className="text-4xl font-extrabold text-center mb-6 text-orange-500">관리자 페이지</h2>
      
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6">
        <h3 className="text-2xl font-bold text-orange-400 mb-4">참가자 및 기록 관리</h3>
        {participants.length > 0 ? (
          <div className="space-y-6">
            {participants.map(p => (
              <div key={p.id} className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-600">
                    <div className="flex items-center space-x-4">
                        <img src={p.photo} alt={p.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-500" />
                        <span className="font-bold text-xl text-slate-100">{p.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleOpenModal(p)}
                          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-sm"
                        >
                          기록 관리
                        </button>
                        <button 
                          onClick={() => deleteParticipant(p.id)}
                          className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold text-sm"
                        >
                          참가자 삭제
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-orange-300 mb-2">{p.runs.length}개의 기록</h4>
                    {p.runs.length > 0 ? p.runs.map(run => (
                        <div key={run.id} className="bg-slate-600/70 p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                               <div className="flex-shrink-0 flex space-x-2">
                                 {run.photo && <img src={run.photo} alt="Proof" className="w-12 h-12 object-cover rounded-md" />}
                                 {run.togetherPhoto && <img src={run.togetherPhoto} alt="Together" className="w-12 h-12 object-cover rounded-md" />}
                               </div>
                               <div className="min-w-0">
                                   <p className="font-bold text-slate-100 truncate">{run.distance.toFixed(1)} km</p>
                                   <p className="text-xs text-slate-400 truncate">{new Date(run.date).toLocaleString('ko-KR')}</p>
                               </div>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0 ml-4">
                              <button onClick={() => deleteRun(p.id, run.id)} className="py-1 px-3 bg-red-700 hover:bg-red-800 rounded-lg text-white font-semibold text-xs">삭제</button>
                            </div>
                        </div>
                    )) : <p className="text-slate-400 text-center py-4">등록된 기록이 없습니다.</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 py-8">관리할 참가자가 없습니다.</p>
        )}
      </div>

      {managingParticipant && (
        <ManageRecordsModal
          participant={managingParticipant}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AdminPage;
