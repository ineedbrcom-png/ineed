

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const ContactModal: React.FC = () => {
  const { dispatch } = useAppContext();
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onClose = () => dispatch({ type: 'CLOSE_CONTACT_MODAL' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formState);
    setIsSubmitted(true);
    // In a real app, you might want to auto-close the modal after a few seconds
    setTimeout(() => {
        onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative animate-fade-in-down" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl z-10">
          &times;
        </button>
        
        <div className="p-8">
            {isSubmitted ? (
              <div className="text-center">
                <div className="text-green-500 text-5xl mb-4">
                    <i className="fas fa-check-circle"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Mensagem Enviada!</h2>
                <p className="text-gray-600">Obrigado pelo seu contato. Retornaremos em breve.</p>
              </div>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Fale Conosco</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" name="name" placeholder="Seu Nome" value={formState.name} onChange={handleChange} className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <input type="email" name="email" placeholder="Seu Email" value={formState.email} onChange={handleChange} className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <input type="text" name="subject" placeholder="Assunto" value={formState.subject} onChange={handleChange} className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <textarea name="message" placeholder="Sua Mensagem" value={formState.message} onChange={handleChange} rows={4} className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
                        <button type="submit" className="w-full gradient-bg text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition">Enviar Mensagem</button>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;