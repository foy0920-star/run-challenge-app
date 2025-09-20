import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addParticipant } = useParticipants();
  const navigate = useNavigate();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !photo) {
      setError('이름과 사진을 모두 입력해주세요.');
      return;
    }
    setError('');
    setIsProcessing(true);
    try {
      const photoBase64 = await resizeImage(photo);
      addParticipant(name.trim(), photoBase64);
      navigate('/');
    } catch (err) {
      setError('이미지 처리 중 오류가 발생했습니다. 다른 파일을 선택해주세요.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 space-y-6">
        <h2 className="text-center text-3xl font-extrabold text-orange-500">참가자 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-bold text-slate-300 block mb-2">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="예: 손오공"
              required
            />
          </div>
          <div>
            <label htmlFor="photo" className="text-sm font-bold text-slate-300 block mb-2">프로필 사진</label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
              required
            />
          </div>
          {photoPreview && (
            <div className="flex justify-center">
              <img src={photoPreview} alt="프로필 미리보기" className="w-32 h-32 rounded-full object-cover border-4 border-slate-600" />
            </div>
          )}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-bold text-lg transition duration-300 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isProcessing ? '처리 중...' : '챌린지 참여하기!'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
