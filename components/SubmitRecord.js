import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.js';

const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const PhotoUploadUI = ({ type, previews, onPhotoChange, disabled }) => (
    React.createElement('div', { className: "flex flex-col p-4 border-2 border-slate-600 border-dashed rounded-md h-full text-center" },
        React.createElement('div', { className: "flex-grow flex flex-wrap justify-center items-center gap-2 mb-2 min-h-[100px]" },
        previews.length > 0 ? (
            previews.map((src, index) => React.createElement('img', { key: index, src: src, alt: "Preview", className: "h-24 w-24 object-cover rounded-md" }))
        ) : (
            React.createElement('svg', { className: "mx-auto h-12 w-12 text-slate-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", "aria-hidden": "true" },
                React.createElement('path', { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
            )
        )),
        React.createElement('div', null,
            React.createElement('label', { htmlFor: `${type}-photo-upload`, className: `relative cursor-pointer bg-slate-700 rounded-md font-medium text-orange-400 hover:text-orange-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-orange-500 px-2 ${disabled ? 'pointer-events-none opacity-50' : ''}` },
                React.createElement('span', null, "사진 업로드"),
                React.createElement('input', { id: `${type}-photo-upload`, name: `${type}-photo-upload`, type: "file", multiple: true, className: "sr-only", onChange: (e) => onPhotoChange(e, type), accept: "image/*", disabled: disabled })
            ),
            React.createElement('p', { className: "text-xs text-slate-500 mt-1" }, "5MB 이하, 최대 2장")
        )
    )
);

const SubmitRecord = ({ onSubmitSuccess, onRegisterClick }) => {
  const { users, addRecord, isLoading } = useAppContext();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [distance, setDistance] = useState('');
  
  const [recordPhotos, setRecordPhotos] = useState([]);
  const [togetherPhotos, setTogetherPhotos] = useState([]);
  const [recordPreviews, setRecordPreviews] = useState([]);
  const [togetherPreviews, setTogetherPreviews] = useState([]);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortedUsers = useMemo(() => [...users].sort((a, b) => a.name.localeCompare(b.name)), [users]);
  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePhotoChange = useCallback(async (e, type) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 2) {
        setError("사진은 최대 2장까지 올릴 수 있습니다.");
        e.target.value = '';
        return;
      }
      
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError("5MB 이하의 사진 파일만 업로드할 수 있습니다.");
        e.target.value = '';
        return;
      }
      
      setError('');
      
      try {
        const dataUrls = await Promise.all(files.map(fileToDataUrl));
        
        if (type === 'record') {
          setRecordPhotos(files);
          setRecordPreviews(dataUrls);
        } else {
          setTogetherPhotos(files);
          setTogetherPreviews(dataUrls);
        }
      } catch (err) {
          console.error("Error reading files:", err);
          setError("사진을 읽어오는 중 오류가 발생했습니다.");
      }
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const distanceNum = parseFloat(distance);
    if (!selectedUserId || !distanceNum || distanceNum <= 0) {
      setError("이름과 거리를 정확하게 입력해주세요.");
      return;
    }
    if (recordPhotos.length === 0) {
      setError("기록 사진을 최소 1장 이상 제출해야 합니다.");
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    await addRecord(selectedUserId, distanceNum, recordPhotos, togetherPhotos);
    setIsSubmitting(false);
    onSubmitSuccess();
  }, [selectedUserId, distance, recordPhotos, togetherPhotos, addRecord, onSubmitSuccess]);

  if (isLoading) {
    return React.createElement('div', { className: "text-center p-10" }, "로딩 중...");
  }

  return (
    React.createElement('div', { className: "bg-slate-800/80 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 backdrop-blur-sm" },
      React.createElement('h2', { className: "text-2xl sm:text-3xl font-bold text-center mb-6 text-orange-400", style: {fontFamily: "'Noto Sans KR', sans-serif"} }, "기록 제출"),
      React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6" },
        React.createElement('div', null,
          React.createElement('label', { htmlFor: "user", className: "block text-sm font-medium text-slate-300 mb-2" }, "이름"),
          React.createElement('div', { className: "flex items-center space-x-2" },
            React.createElement('div', { className: "relative w-full", ref: dropdownRef },
              React.createElement('button', { type: "button", onClick: () => setIsDropdownOpen(!isDropdownOpen), className: "w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex items-center text-left justify-between" },
                selectedUser ? (
                    React.createElement('div', { className: "flex items-center" },
                      React.createElement('img', { src: selectedUser.photoUrl, alt: selectedUser.name, className: "w-6 h-6 rounded-full mr-2 object-cover" }),
                      React.createElement('span', { className: "truncate" }, selectedUser.name)
                    )
                ) : (
                    React.createElement('span', { className: "text-slate-400" }, "이름을 선택하세요")
                ),
                 React.createElement('svg', { className: `w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor" },
                    React.createElement('path', { fillRule: "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", clipRule: "evenodd" })
                )
              ),
              isDropdownOpen && (
                React.createElement('ul', { className: "absolute z-20 mt-1 w-full bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto" },
                  sortedUsers.map(user => (
                    React.createElement('li', { key: user.id, onClick: () => {
                        setSelectedUserId(user.id);
                        setIsDropdownOpen(false);
                      }, className: "flex items-center px-3 py-2 text-sm text-white hover:bg-slate-700 cursor-pointer" },
                      React.createElement('img', { src: user.photoUrl, alt: user.name, className: "w-6 h-6 rounded-full mr-2 object-cover" }),
                      React.createElement('span', { className: "truncate" }, user.name)
                    )
                  ))
                )
              )
            ),
            React.createElement('button', { type: "button", onClick: onRegisterClick, className: "flex-shrink-0 bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors h-10" }, "등록")
          )
        ),

        React.createElement('div', { className: !selectedUserId ? 'opacity-50 pointer-events-none' : '' },
          React.createElement('div', null,
            React.createElement('label', { htmlFor: "distance", className: "block text-sm font-medium text-slate-300 mb-2" }, "달린 거리 (km)"),
            React.createElement('input', {
              id: "distance",
              type: "number",
              step: "0.01",
              value: distance,
              onChange: (e) => setDistance(e.target.value),
              className: "w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
              placeholder: "10.5",
              disabled: !selectedUserId
            })
          ),

          React.createElement('div', { className: "mt-6 grid grid-cols-2 gap-4" },
            React.createElement('div', null,
                React.createElement('p', { className: "text-sm font-medium text-center text-slate-300 mb-2" }, "기록 사진 ", React.createElement('span', { className: "font-semibold text-orange-400" }, "(필수)")),
                React.createElement(PhotoUploadUI, {
                    key: "record",
                    type: "record",
                    previews: recordPreviews,
                    onPhotoChange: handlePhotoChange,
                    disabled: !selectedUserId
                })
            ),
            React.createElement('div', null,
                React.createElement('p', { className: "text-sm font-medium text-center text-slate-300 mb-2" }, "함께 달리기 (선택)"),
                React.createElement(PhotoUploadUI, {
                    key: "together",
                    type: "together",
                    previews: togetherPreviews,
                    onPhotoChange: handlePhotoChange,
                    disabled: !selectedUserId
                })
            )
          )
        ),
        
        error && React.createElement('p', { className: "text-red-400 text-sm text-center" }, error),
        
        React.createElement('button', {
          type: "submit",
          disabled: isSubmitting || !selectedUserId,
          className: "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        },
          isSubmitting ? '제출 중...' : '제출하기'
        )
      )
    )
  );
};

export default SubmitRecord;
