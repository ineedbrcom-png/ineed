import React from 'react';
import type { Conversation } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const ConversationItem: React.FC<{ conversation: Conversation; isActive: boolean; onSelect: () => void; }> = ({ conversation, isActive, onSelect }) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const { otherParticipant } = conversation;

  return (
    <button onClick={onSelect} className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 flex items-start relative transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
      {otherParticipant.isSystem ? (
        <div className="w-10 h-10 rounded-full mr-3 flex-shrink-0 bg-blue-500 text-white flex items-center justify-center">
            <i className="fas fa-hand-holding-heart"></i>
        </div>
      ) : (
        <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-10 h-10 rounded-full mr-3 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-800 truncate">{otherParticipant.name}</p>
          <span className="text-xs text-gray-600 flex-shrink-0 ml-2">{lastMessage?.timestamp}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">Re: {conversation.orderTitle}</p>
        <p className={`text-sm line-clamp-2 h-10 ${conversation.unread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{lastMessage?.text || (lastMessage?.imageUrl ? '[Imagem]' : '')}</p>
      </div>
      {conversation.unread && <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
    </button>
  );
};


const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedConversationId, onSelectConversation }) => {
  return (
    <div className="w-full border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold flex items-center text-gray-800">
          <i className="fas fa-inbox mr-2"></i> Mensagens
        </h2>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input type="text" placeholder="Buscar conversas..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {conversations.map(conv => (
          <ConversationItem 
            key={conv.id} 
            conversation={conv} 
            isActive={conv.id === selectedConversationId}
            onSelect={() => onSelectConversation(conv.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationList;