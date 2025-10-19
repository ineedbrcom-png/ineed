import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRequestById } from '../ineed-backend/src/routes/apiService'; // Ajuste o caminho
import { Request as INeedRequest } from '../../ineed-backend/src/types'; // Ajuste o caminho
import OfferModal from './OfferModal'; // Ajuste o caminho
import { useAppContext } from '../context/AppContext'; // Ajuste o caminho

const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state: appState } = useAppContext(); // Para verificar se o usuário está logado
  const [request, setRequest] = useState<INeedRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchRequestDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedRequest = await getRequestById(id);
        setRequest(fetchedRequest);
      } catch (err) {
        console.error('Failed to fetch request details:', err);
        setError('Não foi possível carregar os detalhes do pedido.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">Carregando detalhes...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-center text-red-500">{error}</div>;
  }

  if (!request) {
    return <div className="container mx-auto p-8 text-center">Pedido não encontrado.</div>;
  }

  const canMakeOffer = appState.isAuthenticated && appState.currentUser?.id !== request.userId;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{request.title}</h1>
          <span className="bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1 rounded-full">{request.categoryId}</span>
        </div>

        <div className="flex items-center mb-6 text-sm text-gray-500">
          <img src={request.userAvatar || 'https://i.pravatar.cc/150'} alt={request.userName} className="w-8 h-8 rounded-full mr-2" />
          <span>Postado por <strong>{request.userName}</strong> em {new Date(request.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>

        <p className="text-gray-700 whitespace-pre-wrap mb-6">{request.description}</p>

        <div className="border-t border-b border-gray-200 py-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Orçamento</p>
            <p className="font-bold text-lg">{request.budget ? `R$ ${request.budget}` : 'A combinar'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tipo</p>
            <p className="font-bold text-lg capitalize">{request.type === 'service' ? 'Serviço' : 'Produto'}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <Link to="/" className="w-full md:w-auto text-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
            Voltar para a busca
          </Link>
          {canMakeOffer && (
            <button 
              onClick={() => setIsOfferModalOpen(true)}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              <i className="fas fa-handshake mr-2"></i> Fazer Proposta
            </button>
          )}
        </div>
      </div>

      {isOfferModalOpen && id && (
        // The backend expects an orderId to make an offer.
        // Our backend logic ensures an order is created with every request.
        <OfferModal orderId={request.order.id} onClose={() => setIsOfferModalOpen(false)} />
      )}
    </div>
  );
};

export default RequestDetailPage;