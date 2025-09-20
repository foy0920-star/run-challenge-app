import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { ParticipantsProvider } from './context/ParticipantsContext';
import Header from './components/Header';
import RegisterPage from './pages/RegisterPage';
import SubmitRecordPage from './pages/SubmitRecordPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

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
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
           {/* Admin page secret link */}
          <Link to="/admin" aria-label="Open Admin Page" className="fixed bottom-0 right-0 h-12 w-12 z-50"></Link>
        </div>
      </HashRouter>
    </ParticipantsProvider>
  );
};

export default App;