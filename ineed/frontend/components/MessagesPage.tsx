import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getConversations } from '../ineed-backend/src/routes/apiService'; // Adjust path
import { Conversation } from '../../ineed-backend/src/types'; // Adjust path

const MessagesPage: React.FC = () => {
  const { state } = useAppContext();
  const { currentUser } = state;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedConversations = await getConversations();
        setConversations(fetchedConversations);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setError("Não foi possível carregar suas conversas.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const getOtherParticipant = (convo: Conversation) => {
    return convo.participants.find(p => p.user.id !== currentUser?.id)?.user;
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-gray-500">Carregando conversas...</p>;
    }

    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }

    if (conversations.length === 0) {
      return <p className="text-center text-gray-500">Você ainda não tem nenhuma conversa.</p>;
    }

    return conversations.map(convo => {
      const otherUser = getOtherParticipant(convo);
      return (
        <Link to={`/messages/${convo.id}`} key={convo.id} className="block p-4 border-b hover:bg-gray-50 transition">
          <div className="flex items-center space-x-4">
            <img
              src={otherUser?.avatarUrl || 'https://i.pravatar.cc/150'}
              alt={otherUser?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-grow">
              <div className="flex justify-between">
                <p className="font-bold text-gray-800">{otherUser?.name}</p>
                {/* <span className="text-xs text-gray-400">10:30</span> */}
              </div>
              <p className="text-sm text-gray-500 truncate">{convo.order.request.title}</p>
            </div>
          </div>
        </Link>
      );
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Minhas Mensagens</h1>
        </div>
        <div className="divide-y">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
