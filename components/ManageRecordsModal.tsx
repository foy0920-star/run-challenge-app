import React, { useState } from 'react';
import type { Participant, RunRecord } from '../types';
import { useParticipants } from '../context/ParticipantsContext';

const resizeImage = (file: File): Promise<string> => {
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1920;
    const QUALITY = 0.8;
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
  
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Canvas 2D context is not available.'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', QUALITY));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
};
  
const EditRunForm: React.FC<{
    run: RunRecord;
    participantId: string;
    onSave: () => void;
    onCancel: () => void;
}> = ({ run, participantId, onSave, onCancel }) => {
    const { updateRun } = useParticipants();
    const [distance, setDistance] = useState(run.distance.toString());
    const [proofPhoto, setProofPhoto] = useState<File | null>(null);
    const [proofPhotoPreview, setProofPhotoPreview] = useState<string | null>(run.photo);
    const [togetherPhoto, setTogetherPhoto] = useState<File | null>(null);
    const [togetherPhotoPreview, setTogetherPhotoPreview] = useState<string | null>(run.togetherPhoto);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'proof' | 'together') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (type === 'proof') {
                    setProofPhoto(file);
                    setProofPhotoPreview(result);
                } else {
                    setTogetherPhoto(file);
                    setTogetherPhotoPreview(result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const distNum = parseFloat(distance);
        if (isNaN(distNum) || distNum <= 0) {
            setError('유효한 거리를 입력해주세요.');
            return;
        }

        setIsProcessing(true);
        setError('');
        try {
            let finalProofPhoto = run.photo;
            if (proofPhoto) {
              finalProofPhoto = await resizeImage(proofPhoto);
            } else if (!proofPhotoPreview) {
              finalProofPhoto = '';
            }
            
            let finalTogetherPhoto = run.togetherPhoto;
            if (togetherPhoto) {
              finalTogetherPhoto = await resizeImage(togetherPhoto);
            } else if (!togetherPhotoPreview) {
              finalTogetherPhoto = '';
            }
            
            updateRun(participantId, run.id, {
                distance: distNum,
                photo: finalProofPhoto,
                togetherPhoto: finalTogetherPhoto,
            });
            onSave();
        } catch (err) {
            setError('이미지 처리 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-slate-700 p-4 rounded-lg">
            <h4 className="text-lg font-bold mb-4 text-orange-400">기록 수정</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="edit-distance" className="text-sm font-bold text-slate-300 block mb-1">거리 (km)</label>
                    <input
                        type="number"
                        id="edit-distance"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-full p-2 bg-slate-600 border border-slate-500 rounded-lg"
                        step="0.01"
                        min="0"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="edit-proof-photo" className="text-sm font-bold text-slate-300 block mb-1">기록 증명 사진</label>
                    <input type="file" id="edit-proof-photo" accept="image/*" onChange={(e) => handlePhotoChange(e, 'proof')} className="w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200" />
                </div>
                 <div>
                    <label htmlFor="edit-together-photo" className="text-sm font-bold text-slate-300 block mb-1">함께 달리기 사진</label>
                    <input type="file" id="edit-together-photo" accept="image/*" onChange={(e) => handlePhotoChange(e, 'together')} className="w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200" />
                </div>
                <div className="flex justify-around space-x-2 min-h-[5.5rem]">
                    {proofPhotoPreview ? (
                        <div className="relative">
                            <img src={proofPhotoPreview} alt="증명 사진" className="max-h-20 rounded" />
                            <button
                                type="button"
                                onClick={() => { setProofPhoto(null); setProofPhotoPreview(null); }}
                                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold leading-none hover:bg-red-700 transition-colors"
                                aria-label="증명 사진 삭제"
                            >&times;</button>
                        </div>
                    ) : <div />}
                    {togetherPhotoPreview ? (
                        <div className="relative">
                            <img src={togetherPhotoPreview} alt="함께 달리기 사진" className="max-h-20 rounded" />
                            <button
                                type="button"
                                onClick={() => { setTogetherPhoto(null); setTogetherPhotoPreview(null); }}
                                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold leading-none hover:bg-red-700 transition-colors"
                                aria-label="함께 달리기 사진 삭제"
                            >&times;</button>
                        </div>
                    ) : <div />}
                </div>
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onCancel} className="py-2 px-4 bg-slate-500 hover:bg-slate-600 rounded-lg text-white font-bold text-sm">취소</button>
                    <button type="submit" disabled={isProcessing} className="py-2 px-4 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-bold text-sm disabled:bg-slate-600">{isProcessing ? '저장 중...' : '저장'}</button>
                </div>
            </form>
        </div>
    );
};

const ManageRecordsModal: React.FC<{
  participant: Participant;
  onClose: () => void;
}> = ({ participant, onClose }) => {
  const { deleteRun } = useParticipants();
  const [editingRun, setEditingRun] = useState<RunRecord | null>(null);

  const handleEdit = (run: RunRecord) => {
    setEditingRun(run);
  };
  
  const handleSave = () => {
    setEditingRun(null);
  };
  
  const handleCancel = () => {
    setEditingRun(null);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-orange-500">{participant.name}님의 기록</h3>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">&times;</button>
        </div>
        
        <div className="overflow-y-auto flex-grow pr-2">
          {editingRun ? (
            <EditRunForm 
                run={editingRun}
                participantId={participant.id}
                onSave={handleSave}
                onCancel={handleCancel}
            />
          ) : (
            <ul className="space-y-3">
              {participant.runs.length > 0 ? participant.runs.map(run => (
                <li key={run.id} className="bg-slate-700 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {run.photo ? (
                        <img src={run.photo} alt="Run proof" className="w-12 h-12 object-cover rounded-md" />
                    ) : (
                        <div className="w-12 h-12 bg-slate-600 rounded-md flex items-center justify-center" title="사진 없음">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.01.01" />
                            </svg>
                        </div>
                    )}
                    <div>
                        <p className="font-bold text-slate-100">{run.distance.toFixed(1)} km</p>
                        <p className="text-xs text-slate-400">{new Date(run.date).toLocaleDateString('ko-KR')}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(run)} className="py-1 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-xs">수정</button>
                    <button onClick={() => deleteRun(participant.id, run.id)} className="py-1 px-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold text-xs">삭제</button>
                  </div>
                </li>
              )) : (
                <p className="text-center text-slate-400 py-8">아직 등록된 기록이 없습니다.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRecordsModal;