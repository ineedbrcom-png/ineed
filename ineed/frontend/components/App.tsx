import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from '../context/AppContext'; // Ajuste o caminho
import HomePage from '../components/HomePage'; // Ajuste o caminho
import RequestDetailPage from '../components/RequestDetailPage'; // Ajuste o caminho
import PremiumModal from '../components/PremiumModal'; // Ajuste o caminho
import MessagesPage from '../components/MessagesPage';
import ProfilePage from '../components/ProfilePage';
import Header from '../components/Header';
import RegisterModal from '../components/RegisterModal';
import LoginModal from '../components/LoginModal'; // We'll assume this exists
import ResetPasswordPage from '../components/ResetPasswordPage'; // Import the new page

const AppContent = () => {
  const { state, dispatch } = useAppContext();

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        {/* Adicione outras rotas aqui, como /profile, /messages, etc. */}
      </Routes>
      {/* Footer pode vir aqui */}

      {state.isPremiumModalOpen && <PremiumModal />}
      {state.isRegisterModalOpen && (
        <RegisterModal 
          onClose={() => dispatch({ type: 'CLOSE_REGISTER_MODAL' })} 
          onSwitchToLogin={() => dispatch({ type: 'OPEN_LOGIN_MODAL' })}
        />
      )}
      {state.isLoginModalOpen && (
        <LoginModal 
          onClose={() => dispatch({ type: 'CLOSE_LOGIN_MODAL' })}
          onSwitchToRegister={() => dispatch({ type: 'OPEN_REGISTER_MODAL' })}
          onForgotPassword={() => dispatch({ type: 'OPEN_FORGOT_PASSWORD_MODAL' })}
        />
      )}
    </>
  );
};

export const App = () => (
  <BrowserRouter>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </BrowserRouter>
);