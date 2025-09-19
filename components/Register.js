import React, { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext.js';

const Register = ({ onRegisterSuccess }) => {
  const { addUser, error } = useAppContext();
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('이름을 입력해주세요.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    const success = await addUser(name, photo);
    setIsSubmitting(false);
    if(success) {
      onRegisterSuccess();
    }
  }, [name, photo, addUser, onRegisterSuccess]);

  return (
    React.createElement('div', { className: "bg-slate-800/80 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700" },
      React.createElement('h2', { className: "text-2xl sm:text-3xl font-bold text-center mb-6 text-orange-400", style: {fontFamily: "'Noto Sans KR', sans-serif"} }, "참가자 등록"),
      React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6" },
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "name", className: "block text-sm font-medium text-slate-300 mb-2" }, "이름"),
          React.createElement('input', {
            id: "name",
            type: "text",
            value: name,
            onChange: (e) => setName(e.target.value),
            className: "w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
            placeholder: "손오공",
            required: true
          })
        ),
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "photo", className: "block text-sm font-medium text-slate-300 mb-2" }, "프로필 사진 (선택 사항)"),
          React.createElement('div', { className: "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md" },
            React.createElement('div', { className: "space-y-1 text-center" },
              preview ? (
                React.createElement('img', { src: preview, alt: "Profile preview", className: "mx-auto h-24 w-24 rounded-full object-cover" })
              ) : (
                React.createElement('svg', { className: "mx-auto h-12 w-12 text-slate-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", "aria-hidden": "true" },
                  React.createElement('path', { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
                )
              ),
              React.createElement('div', { className: "flex text-sm text-slate-500 justify-center" },
                React.createElement('label', { htmlFor: "photo-upload", className: "relative cursor-pointer bg-slate-700 rounded-md font-medium text-orange-400 hover:text-orange-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-orange-500 px-2" },
                  React.createElement('span', null, "사진 업로드"),
                  React.createElement('input', { id: "photo-upload", name: "photo-upload", type: "file", className: "sr-only", onChange: handlePhotoChange, accept: "image/*" })
                )
              )
            )
          )
        ),
        (error || formError) && React.createElement('p', { className: "text-red-400 text-sm text-center" }, error || formError),
        React.createElement('button', {
          type: "submit",
          disabled: isSubmitting || !name,
          className: "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        },
          isSubmitting ? '등록 중...' : '등록하기'
        )
      )
    )
  );
};

export default Register;
