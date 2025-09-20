import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const SubmitRecordPage: React.FC = () => {
  const { participants, addRun } = useParticipants();
  const navigate = useNavigate();
  
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [distance, setDistance] = useState('');
  const [proofPhoto, setProofPhoto] = useState<File | null>(null);
  const [proofPhotoPreview, setProofPhotoPreview] = useState<string | null>(null);
  const [togetherPhoto, setTogetherPhoto] = useState<File | null>(null);
  const [togetherPhotoPreview, setTogetherPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (!selectedParticipantId || !distance || !proofPhoto) {
      setError('이름, 달린 거리, 기록 증명 사진을 모두 입력해주세요.');
      return;
    }
    const distNum = parseFloat(distance);
    if (isNaN(distNum) || distNum <= 0) {
      setError('유효한 거리를 입력해주세요.');
      return;
    }
    setError('');
    setIsProcessing(true);

    try {
      const proofPhotoBase64 = await resizeImage(proofPhoto);
      const togetherPhotoBase64 = togetherPhoto ? await resizeImage(togetherPhoto) : undefined;
      addRun(selectedParticipantId, distNum, proofPhotoBase64, togetherPhotoBase64);
      navigate('/dashboard');
    } catch (err) {
      setError('이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (participants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div className="bg-slate-800 p-10 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">아직 등록된 참가자가 없습니다!</h2>
          <p className="text-slate-300 mb-6">기록을 제출하려면 먼저 참가자 등록을 해야 합니다.</p>
          <Link
            to="/register"
            className="py-3 px-6 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-bold transition duration-300"
          >
            등록 페이지로 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 space-y-6">
        <h2 className="text-center text-3xl font-extrabold text-orange-500">달리기 기록 제출</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="participant" className="text-sm font-bold text-slate-300 block mb-2">이름을 선택하세요</label>
            <select
              id="participant"
              value={selectedParticipantId}
              onChange={(e) => setSelectedParticipantId(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="" disabled>-- 참가자 선택 --</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className={!selectedParticipantId ? 'opacity-50' : ''}>
            <label htmlFor="distance" className="text-sm font-bold text-slate-300 block mb-2">달린 거리 (km)</label>
            <input
              type="number"
              id="distance"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              step="0.01"
              min="0"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="예: 5.3"
              required
              disabled={!selectedParticipantId}
            />
          </div>
          <div className={!selectedParticipantId ? 'opacity-50' : ''}>
            <label htmlFor="proof-photo" className="text-sm font-bold text-slate-300 block mb-2">기록 증명 사진</label>
            <input
              type="file"
              id="proof-photo"
              accept="image/*"
              onChange={(e) => handlePhotoChange(e, 'proof')}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
              required
              disabled={!selectedParticipantId}
            />
          </div>
           <div className={!selectedParticipantId ? 'opacity-50' : ''}>
            <label htmlFor="together-photo" className="text-sm font-bold text-slate-300 block mb-2">함께 달리기 사진 (선택)</label>
            <input
              type="file"
              id="together-photo"
              accept="image/*"
              onChange={(e) => handlePhotoChange(e, 'together')}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
              disabled={!selectedParticipantId}
            />
          </div>
          <div className="flex justify-around space-x-4">
            {proofPhotoPreview && (
                <div className="flex flex-col items-center">
                    <p className="text-xs text-slate-400 mb-1">기록 증명</p>
                    <img src={proofPhotoPreview} alt="기록 증명 미리보기" className="max-h-28 rounded-lg border-2 border-slate-600" />
                </div>
            )}
            {togetherPhotoPreview && (
                <div className="flex flex-col items-center">
                    <p className="text-xs text-slate-400 mb-1">함께 달리기</p>
                    <img src={togetherPhotoPreview} alt="함께 달리기 미리보기" className="max-h-28 rounded-lg border-2 border-slate-600" />
                </div>
            )}
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={!selectedParticipantId || isProcessing}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-bold text-lg transition duration-300 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? '제출 중...' : '기록 제출'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitRecordPage;