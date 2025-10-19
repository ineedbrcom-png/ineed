import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { User } from '../types';
import { requestNotificationPermissionAndNotify } from '../utils/notifications';

interface CompleteProfileModalProps {
  user: User;
}

const TAKEN_USERNAMES = ['admin', 'suporte', 'root', 'ineed', 'contato'];

const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ user }) => {
  const { dispatch } = useAppContext();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Prevent user from closing modal by clicking outside or pressing Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const validateUsername = (name: string): string => {
    if (!name) return "O nome de usuário é obrigatório.";
    if (name.length < 3) return "Deve ter pelo menos 3 caracteres.";
    if (/\s/.test(name)) return "Não pode conter espaços.";
    if (!/^[a-zA-Z0-9_.]+$/.test(name)) return "Apenas letras, números, '_' e '.' são permitidos.";
    if (TAKEN_USERNAMES.includes(name.toLowerCase())) return "Este nome de usuário já está em uso.";
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    if (error) {
      setError(validateUsername(newUsername));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setIsLoading(true);

    // Simulate API call for uniqueness check
    setTimeout(() => {
      const updatedUser: User = { 
        ...user, 
        username: username.toLowerCase(), 
        name: user.name === 'Novo Usuário' ? 'Usuário iNeed' : user.name 
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser });
      requestNotificationPermissionAndNotify(updatedUser.unreadMessagesCount);
      // No need to setIsLoading(false) as the component will unmount
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-down p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quase lá!</h2>
        <p className="text-gray-600 mb-6">Escolha um nome de usuário único para o seu perfil. Ele não poderá ser alterado depois.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 text-lg">@</span>
            <input
              type="text"
              value={username}
              onChange={handleChange}
              placeholder="seu.usuario"
              className={`w-full pl-9 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-lg ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              aria-invalid={!!error}
              aria-describedby="username-error"
              autoFocus
            />
          </div>
          {error && <p id="username-error" className="text-red-600 text-sm text-left mb-4">{error}</p>}
          
          <button type="submit" disabled={isLoading} className="w-full gradient-bg text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-wait flex items-center justify-center">
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Salvando...' : 'Completar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;