import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getMessagesForConversation } from '../ineed-backend/src/routes/apiService';
import { Message } from '../../ineed-backend/src/types';

const ConversationDetailPage: React.FC = () => {
  const { id: conversationId } = useParams<{ id: string }>();
  const { state } = useAppContext();
  const { currentUser, socket } = state;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect for fetching initial messages
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const initialMessages = await getMessagesForConversation(conversationId);
        setMessages(initialMessages);
      } catch (err) {
        setError('Não foi possível carregar as mensagens.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Effect for WebSocket logic
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join the conversation room
    socket.emit('join-conversation', conversationId);

    // Listener for new messages
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    socket.on('new-message', handleNewMessage);

    // Cleanup on component unmount
    return () => {
      socket.off('new-message', handleNewMessage);
      // Optionally leave the room, though not strictly necessary
      // socket.emit('leave-conversation', conversationId);
    };
  }, [socket, conversationId]);

  // Effect to scroll down when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !currentUser || !conversationId) return;

    socket.emit('send-message', {
      conversationId,
      text: newMessage,
      senderId: currentUser.id,
    });

    setNewMessage('');
  };

  if (isLoading) return <div className="p-8 text-center">Carregando conversa...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-grow bg-white rounded-lg shadow-lg flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center">
          <Link to="/messages" className="text-blue-500 mr-4"><i className="fas fa-arrow-left"></i></Link>
          <h1 className="font-bold text-lg">Conversa</h1>
        </div>

        {/* Messages Area */}
        <div className="flex-grow p-4 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex mb-4 ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.senderId === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p>{msg.text}</p>
                <p className="text-xs opacity-75 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-gray-50 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Digite sua mensagem..." className="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="bg-blue-600 text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center hover:bg-blue-700"><i className="fas fa-paper-plane"></i></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetailPage;