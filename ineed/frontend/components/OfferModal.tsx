import React, { useState } from 'react';
import { makeOffer } from '../ineed-backend/src/routes/apiService'; // Ajuste o caminho conforme sua estrutura

interface OfferModalProps {
  onClose: () => void;
  orderId: string; // Precisamos saber em qual pedido a oferta está sendo feita
}

const OfferModal: React.FC<OfferModalProps> = ({ onClose, orderId }) => {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!value || Number(value) <= 0) {
      setError('Por favor, insira um valor válido.');
      setIsSubmitting(false);
      return;
    }

    try {
      await makeOffer(orderId, Number(value), message);
      alert('Proposta enviada com sucesso!');
      onClose(); // Fecha o modal após o sucesso
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao enviar a proposta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-down">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">
            &times;
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Enviar Proposta Formal</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="offer-value">Valor (R$)</label>
              <input 
                type="number" 
                id="offer-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Ex: 2500.00" 
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="offer-message">Mensagem (Opcional)</label>
              <textarea 
                id="offer-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Apresente-se, detalhe sua proposta, etc." 
                rows={3}
              ></textarea>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Proposta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;