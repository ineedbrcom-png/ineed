import React, { useState } from 'react';
import { forgotPassword } from '../ineed-backend/src/routes/apiService'; // Adjust path

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-down">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Redefinir Senha</h3>
        <p className="text-gray-600 mb-4">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail" required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Link'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Lembrou a senha?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-600 hover:underline font-semibold">
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;