import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext.js';
import { Page } from './types.js';
import Header from './components/Header.js';
import SubmitRecord from './components/SubmitRecord.js';
import Register from './components/Register.js';
import Dashboard from './components/Dashboard.js';

const AppNotConfigured = () => {
  return React.createElement('div', { className: "max-w-5xl mx-auto p-4 sm:p-6 lg:p-8" },
    React.createElement('div', { className: "text-center p-10 bg-slate-800/80 rounded-lg backdrop-blur-sm border border-red-500/50" },
        React.createElement('h2', { className: "text-xl text-red-400 font-bold" }, "앱 설정 오류"),
        React.createElement('p', { className: "text-slate-300 mt-4" }, "애플리케이션이 올바르게 설정되지 않았습니다."),
        React.createElement('p', { className: "text-slate-400 mt-2" }, "관리자에게 문의하여 서버 환경 변수가 올바르게 설정되었는지 확인해주세요.")
    )
  );
};

const AppContent = () => {
  const { isLoading, isConfigured } = useAppContext();
  const [currentPage, setCurrentPage] = useState(Page.Submit);
  
  const renderPage = () => {
    switch (currentPage) {
      case Page.Register:
        return React.createElement(Register, { onRegisterSuccess: () => setCurrentPage(Page.Submit) });
      case Page.Dashboard:
        return React.createElement(Dashboard, { setCurrentPage: setCurrentPage });
      case Page.Submit:
      default:
        return React.createElement(SubmitRecord, { 
                    onSubmitSuccess: () => setCurrentPage(Page.Dashboard), 
                    onRegisterClick: () => setCurrentPage(Page.Register)
                });
    }
  };
  
  if (isLoading) {
    return React.createElement('div', { className: "flex justify-center items-center h-screen" },
      React.createElement('div', { className: "text-center text-slate-400" }, "데이터를 불러오는 중입니다...")
    );
  }

  if (!isConfigured) {
    return React.createElement(AppNotConfigured);
  }

  return React.createElement(React.Fragment, null,
    React.createElement(Header, { currentPage: currentPage, setCurrentPage: setCurrentPage }),
    React.createElement('main', { className: "p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto" },
      renderPage()
    )
  );
};

const App = () => {
  return (
    React.createElement(AppProvider, null,
      React.createElement('div', { 
        className: "bg-slate-900 min-h-screen text-slate-100", 
        style: {fontFamily: "'Inter', sans-serif"}
      },
        React.createElement(AppContent, null)
      )
    )
  );
};

export default App;