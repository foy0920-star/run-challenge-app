import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ParticipantsProvider } from './context/ParticipantsContext';
import Header from './components/Header';
import RegisterPage from './pages/RegisterPage';
import SubmitRecordPage from './pages/SubmitRecordPage';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  return (
    <ParticipantsProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<SubmitRecordPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </ParticipantsProvider>
  );
};

export default App;
