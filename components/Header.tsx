import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const activeLinkClass = 'bg-slate-700 text-orange-400';
  const inactiveLinkClass = 'text-slate-300 hover:bg-slate-700 hover:text-white';
  const linkBaseClass = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';

  return (
    <header className="bg-slate-800 shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-4 md:flex-row md:justify-between md:py-0 md:h-16">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-xl text-center font-bold text-orange-500 md:text-lg lg:text-xl">원당 손오공 크로스핏 런 챌린지</h1>
          </div>
          <div className="flex items-baseline space-x-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              기록 제출
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              대시보드
            </NavLink>
            <NavLink 
              to="/register" 
              className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              참가자 등록
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;