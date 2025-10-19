import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { register } from '../ineed-backend/src/routes/apiService';

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSwitchToLogin }) => {
  const { dispatch } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const { access_token, user } = await register(formData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token: access_token, user } });
      onClose();
    } catch (err) {
      setError(err.message || 'Falha no cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-down">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Criar Conta</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome Completo" required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Nome de usuário" required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="E-mail" required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Senha" required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Já tem uma conta?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-600 hover:underline font-semibold">
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;