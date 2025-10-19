import React, { useState, useRef, useEffect } from 'react';
import type { Conversation, User, Message } from '../types';
import { StarRating } from './StarRating';
import { INEED_LOGO_SVG_URI } from '../constants';

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: User;
  onSendMessage: (content: { text?: string; imageUrl?: string }) => void;
  onSendOffer: () => void;
  onGenerateContract: (conversation: Conversation) => void;
  isGeneratingContract: boolean;
  generationError: string | null;
  onBack: () => void; // For mobile view
}

const MessageBubble: React.FC<{ message: Message; isCurrentUser: boolean }> = ({ message, isCurrentUser }) => {
    const bubbleClasses = isCurrentUser 
        ? 'bg-blue-500 text-white self-end rounded-l-lg rounded-tr-lg'
        : 'bg-gray-200 text-gray-800 self-start rounded-r-lg rounded-tl-lg';

    return (
        <div className={`max-w-xs md:max-w-md p-3 my-1 ${bubbleClasses}`}>
            {message.imageUrl && <img src={message.imageUrl} alt="Uploaded content" className="rounded-lg mb-2" />}
            {message.text && <p className="text-sm">{message.text}</p>}
            <div className="text-xs opacity-75 mt-1 text-right">{message.timestamp}</div>
        </div>
    );
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUser,
  onSendMessage,
  onSendOffer,
  onGenerateContract,
  isGeneratingContract,
  generationError,
  onBack,
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({ text: message });
      setMessage('');
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
            onSendMessage({ text: message, imageUrl: reader.result as string });
            setMessage('');
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const { otherParticipant } = conversation;

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 gap-4">
        <button onClick={onBack} className="lg:hidden text-gray-600">
            <i className="fas fa-arrow-left"></i>
        </button>
        {otherParticipant.isSystem ? (
            <img src={INEED_LOGO_SVG_URI} alt="iNeed Logo" className="w-10 h-10 rounded-full" />
        ) : (
            <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-10 h-10 rounded-full" />
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-800">{otherParticipant.name}</h3>
            {otherParticipant.isVerified && <i className="fas fa-check-circle text-blue-500 text-sm" title="Usuário Verificado"></i>}
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
            {otherParticipant.rating ? (
              <>
                <StarRating rating={otherParticipant.rating} />
                <span className="font-semibold">({otherParticipant.rating.toFixed(1)})</span>
              </>
            ) : (
              !otherParticipant.isSystem && <span className="text-gray-400">Sem avaliações</span>
            )}
          </div>
        </div>
        {!otherParticipant.isSystem && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button 
                onClick={onSendOffer} 
                className="px-3 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 flex items-center gap-2 transition-transform transform hover:scale-105"
            >
                <i className="fas fa-hand-holding-usd"></i>
                <span className="hidden sm:inline">Fazer Oferta</span>
            </button>
            <button
                onClick={() => onGenerateContract(conversation)}
                disabled={isGeneratingContract}
                className="px-3 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 transition-transform transform hover:scale-105"
            >
                {isGeneratingContract ? (
                    <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span className="hidden sm:inline">Gerando...</span>
                    </>
                ) : (
                    <>
                        <i className="fas fa-file-signature"></i>
                        <span className="hidden sm:inline">Gerar Contrato (IA)</span>
                    </>
                )}
            </button>
          </div>
        )}
      </div>

      {generationError && (
        <div className="bg-red-100 text-red-700 p-2 text-sm text-center">
            {generationError}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="flex flex-col space-y-2">
          {conversation.messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.senderId === currentUser.id} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input */}
      {!otherParticipant.isSystem && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="relative flex items-center">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full pl-4 pr-24 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />
             <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            <div className="absolute right-2 flex items-center">
                <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-blue-600 p-2">
                    <i className="fas fa-paperclip"></i>
                </button>
                <button onClick={handleSend} className="bg-blue-600 text-white rounded-lg px-4 py-1.5 ml-2 hover:bg-blue-700 font-semibold">
                    Enviar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;