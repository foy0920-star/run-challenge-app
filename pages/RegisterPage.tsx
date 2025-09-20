
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Participant } from '../types';
import { UserPlusIcon, PhotoIcon } from '../components/icons';

interface RegisterPageProps {
  addParticipant: (participant: Omit<Participant, 'id'>) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ addParticipant }) => {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !photo) {
      setError('이름과 사진을 모두 입력해주세요.');
      return;
    }
    addParticipant({ name, photoUrl: photo });
    navigate('/');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-yellow-400">참가자 등록</h1>
        <p className="text-gray-400 mt-2">챌린지에 참여할 새로운 러너를 등록하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">이름</label>
          <div className="mt-1 relative rounded-md shadow-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserPlusIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white block w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              placeholder="손오공"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">사진</label>
          <div className="mt-1">
            <label htmlFor="photo-upload" className="cursor-pointer bg-gray-800 border-2 border-dashed border-gray-600 rounded-md p-6 flex flex-col items-center justify-center text-gray-400 hover:border-yellow-500 hover:text-yellow-500 transition-colors">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <>
                  <PhotoIcon className="w-12 h-12" />
                  <span className="mt-2 text-sm">프로필 사진 업로드</span>
                </>
              )}
            </label>
            <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-900 transition-transform transform hover:scale-105"
          >
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
