import React from 'react';
import { Page } from '../types.js';
import { APP_TITLE } from '../constants.js';

const NavButton = ({ label, page, currentPage, setCurrentPage }) => {
  const isActive = currentPage === page;
  return (
    React.createElement('button', {
      onClick: () => setCurrentPage(page),
      className: `px-4 py-2 text-sm sm:text-base font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-400 ${
        isActive
          ? 'bg-orange-500 text-white shadow-lg'
          : 'text-slate-300 bg-slate-700/50 hover:bg-slate-700 hover:text-white'
      }`
    }, label)
  );
};

const Header = ({ currentPage, setCurrentPage }) => {
  const bannerImageUrl = 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?q=80&w=2073&auto=format&fit=crop';
  
  return (
    React.createElement('header', { 
      className: "bg-cover bg-center shadow-md relative",
      style: { backgroundImage: `url('${bannerImageUrl}')` }
    },
      React.createElement('div', { className: "absolute inset-0 bg-black/50" }),
      React.createElement('div', { className: "relative z-10 flex flex-col items-center justify-center text-center px-4 pt-12 pb-6 sm:px-6 sm:pt-16 sm:pb-8" },
        React.createElement('h1', { className: "text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6", style: {fontFamily: "'Noto Sans KR', sans-serif", textShadow: '2px 2px 8px rgba(0,0,0,0.8)'} },
            APP_TITLE
        ),
        React.createElement('nav', { className: "flex items-center justify-center space-x-4" },
            React.createElement(NavButton, { label: "기록 제출", page: Page.Submit, currentPage: currentPage, setCurrentPage: setCurrentPage }),
            React.createElement(NavButton, { label: "대시보드", page: Page.Dashboard, currentPage: currentPage, setCurrentPage: setCurrentPage })
        )
      )
    )
  );
};

export default Header;