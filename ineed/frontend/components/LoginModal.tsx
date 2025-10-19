import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { loginWithEmail } from '../ineed-backend/src/routes/apiService';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSwitchToRegister, onForgotPassword }) => {
  const { dispatch } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { access_token, user } = await loginWithEmail(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token: access_token, user } });
      onClose();
    } catch (err) {
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-down">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Entrar</h3>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          
          <div className="text-right">
            <button type="button" onClick={onForgotPassword} className="text-sm text-blue-600 hover:underline">
              Esqueceu a senha?
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Não tem uma conta?{' '}
          <button onClick={onSwitchToRegister} className="text-blue-600 hover:underline font-semibold">
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;