
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Participant, RunRecord } from '../types';
import { PhotoIcon, RunningIcon } from '../components/icons';

interface SubmitRecordPageProps {
  participants: Participant[];
  addRunRecord: (record: Omit<RunRecord, 'id' | 'date'>) => void;
}

const FileInput: React.FC<{id: string, label: string, isRequired: boolean, onChange: (file: string | null) => void}> = ({ id, label, isRequired, onChange }) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                onChange(result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
            onChange(null);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label} {isRequired && <span className="text-red-500">*</span>}</label>
            <label htmlFor={id} className="cursor-pointer bg-gray-800 border-2 border-dashed border-gray-600 rounded-md p-4 flex flex-col items-center justify-center text-gray-400 hover:border-yellow-500 hover:text-yellow-500 transition-colors">
                {preview ? (
                    <img src={preview} alt="Preview" className="w-20 h-20 rounded-md object-cover" />
                ) : (
                    <>
                        <PhotoIcon className="w-10 h-10" />
                        <span className="mt-2 text-xs">사진 업로드</span>
                    </>
                )}
            </label>
            <input id={id} type="file" accept="image/*" onChange={handleChange} className="hidden" />
        </div>
    );
};


const SubmitRecordPage: React.FC<SubmitRecordPageProps> = ({ participants, addRunRecord }) => {
  const [participantId, setParticipantId] = useState('');
  const [distance, setDistance] = useState('');
  const [recordPhoto, setRecordPhoto] = useState<string | null>(null);
  const [groupRunPhoto, setGroupRunPhoto] = useState<string | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId) {
      setError('이름을 선택해주세요.');
      return;
    }
    if (!distance || isNaN(parseFloat(distance)) || parseFloat(distance) <= 0) {
      setError('올바른 거리를 입력해주세요.');
      return;
    }
    if (!recordPhoto) {
      setError('기록 사진은 필수입니다.');
      return;
    }

    const newRecord: Omit<RunRecord, 'id' | 'date'> = {
      participantId,
      distance: parseFloat(distance),
      recordPhotoUrl: recordPhoto,
    };
    if (groupRunPhoto) {
      newRecord.groupRunPhotoUrl = groupRunPhoto;
    }

    addRunRecord(newRecord);
    navigate('/dashboard');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-yellow-400 tracking-tight">기록 제출</h1>
        <p className="text-gray-400 mt-2">오늘의 달리기를 기록하고 공유하세요!</p>
      </div>
      
      {participants.length === 0 ? (
        <div className="text-center bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-300">아직 등록된 참가자가 없습니다.</p>
            <button onClick={() => navigate('/register')} className="mt-4 inline-block bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors">
                참가자 등록하기
            </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-xl shadow-lg">
          <div>
            <label htmlFor="participant" className="block text-sm font-medium text-gray-300">이름</label>
            <select
              id="participant"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-white"
            >
              <option value="" disabled>참가자를 선택하세요</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-gray-300">달린 거리 (km)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RunningIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="number"
                    step="0.01"
                    id="distance"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white block w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                    placeholder="5.2"
                />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FileInput id="record-photo" label="기록 사진" isRequired={true} onChange={setRecordPhoto} />
            <FileInput id="group-run-photo" label="함께 달리기" isRequired={false} onChange={setGroupRunPhoto} />
          </div>

          {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-900 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={!participantId}
          >
            제출하기
          </button>
        </form>
      )}
    </div>
  );
};

export default SubmitRecordPage;
