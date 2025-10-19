import React, { useState, useMemo } from 'react';
import type { UserOrder, Review } from '../types';
import StarInput from './StarInput';
import { useAppContext } from '../context/AppContext';

interface ReviewPageProps {
  order: UserOrder;
}

const ReviewPage: React.FC<ReviewPageProps> = ({ order }) => {
  const { state, dispatch, handleUpdateUser } = useAppContext();
  const { currentUser: user } = state;
  
  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [publicComment, setPublicComment] = useState('');
  const [privateFeedback, setPrivateFeedback] = useState('');

  const isFormValid = useMemo(() => {
    return overallRating > 0 && publicComment.trim() !== '';
  }, [overallRating, publicComment]);

  const onBack = () => dispatch({ type: 'SET_VIEW', payload: 'my-orders' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      alert('Por favor, selecione uma avaliação geral e escreva um comentário público.');
      return;
    }
    if (user) {
        const updatedOrders = user.ordersAsClient.map(o =>
            o.id === order.id ? { ...o, isReviewed: true } : o
        );
        const newReview: Review = {
            id: `rev-${Date.now()}`,
            authorName: user.name,
            authorAvatar: user.avatarUrl,
            rating: overallRating,
            text: publicComment,
            orderId: order.id,
            date: new Date().toLocaleDateString('pt-BR'),
            criteria: {
                communication: communicationRating,
                quality: qualityRating,
                punctuality: punctualityRating,
            },
        };
        const updatedUser = { ...user, ordersAsClient: updatedOrders, reviewsAsClient: [...user.reviewsAsClient, newReview] };
        
        try {
            await handleUpdateUser(updatedUser);
            onBack(); // Navigate back after successful submission
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("Não foi possível enviar sua avaliação. Tente novamente.");
        }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-blue-600 hover:underline mb-4">
          &larr; Voltar para Meus Pedidos
        </button>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Como foi sua experiência com {order.providerName || 'o fornecedor'} no pedido '{order.title}'?
            </h2>
            
            <form onSubmit={handleSubmit}>
              <style>{`
                .star-rating { direction: rtl; unicode-bidi: bidi-override; display: inline-block; }
                .star-rating input[type="radio"] { display: none; }
                .star-rating label { color: #e4e5e9; cursor: pointer; font-size: 2.5rem; transition: color 0.2s; }
                .star-rating input[type="radio"]:checked ~ label,
                .star-rating label:hover, .star-rating label:hover ~ label { color: #ffc107; }
              `}</style>

              {/* Overall Rating */}
              <div className="mb-8 text-center">
                <h3 className="text-lg font-medium mb-4 text-gray-800">Sua avaliação geral:</h3>
                <StarInput name="overallRating" value={overallRating} onChange={setOverallRating} />
              </div>
              
              {/* Detailed Ratings */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4 text-gray-800">Avalie por critérios específicos (opcional):</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-gray-700">Comunicação:</label>
                    <StarInput name="communication" value={communicationRating} onChange={setCommunicationRating} />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-gray-700">Qualidade do Serviço/Produto:</label>
                    <StarInput name="quality" value={qualityRating} onChange={setQualityRating} />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-gray-700">Pontualidade:</label>
                    <StarInput name="punctuality" value={punctualityRating} onChange={setPunctualityRating} />
                  </div>
                </div>
              </div>
              
              {/* Public Comment */}
              <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="publicComment">
                  Descreva sua experiência <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="publicComment" 
                  rows={4} 
                  value={publicComment}
                  onChange={(e) => setPublicComment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  placeholder={`Ex: 'Profissional excelente, resolveu meu problema rapidamente!'`}
                ></textarea>
                <p className="text-sm text-gray-600 mt-1">Este comentário será visível no perfil do fornecedor.</p>
              </div>
              
              {/* Private Feedback */}
              <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="privateFeedback">
                  Feedback privado (opcional)
                </label>
                <textarea 
                  id="privateFeedback" 
                  rows={3} 
                  value={privateFeedback}
                  onChange={(e) => setPrivateFeedback(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Sua opinião honesta e construtiva (não será público)"
                ></textarea>
                <p className="text-sm text-gray-600 mt-1">Este feedback será visto apenas pelo fornecedor.</p>
              </div>
              
              <div className="text-center">
                <button 
                  type="submit" 
                  disabled={!isFormValid}
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Enviar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
