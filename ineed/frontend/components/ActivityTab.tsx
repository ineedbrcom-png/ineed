import React, { useState } from 'react';
import type { User, UserOrder } from '../types';
import { CATEGORIES } from '../constants';
import { useAppContext } from '../context/AppContext';

type ActivityType = 'client' | 'provider';

// A more detailed card for displaying orders in the activity feed.
const ActivityOrderCard: React.FC<{ order: UserOrder }> = ({ order }) => {
    const { dispatch } = useAppContext();
    const category = CATEGORIES.find(c => c.id === order.categoryId);

    const statusStyles: { [key: string]: string } = {
        'Ativo': 'bg-green-100 text-green-800',
        'Concluído': 'bg-blue-100 text-blue-800',
        'Cancelado': 'bg-red-100 text-red-800',
    };
    
    const onViewDetails = () => {
        dispatch({ type: 'OPEN_ORDER_DETAILS', payload: order });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full ${statusStyles[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                {order.status}
                            </span>
                            {category && (
                                <span className="text-sm text-gray-600 flex items-center">
                                    <i className={`${category.icon} mr-1.5 text-gray-400`}></i>
                                    {category.name}
                                </span>
                            )}
                        </div>
                        <h3 className="text-md font-bold text-gray-800">{order.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            <i className="fas fa-calendar-alt mr-1.5 text-gray-400"></i>
                            Pedido em {order.date}
                        </p>
                    </div>
                    <div className="flex-shrink-0 self-end sm:self-center">
                        <button onClick={onViewDetails} className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition">
                            Ver Detalhes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ActivityTabProps {
  user: User;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<ActivityType>('client');

  const ordersToShow = activeTab === 'client' ? user.ordersAsClient : user.ordersAsProvider;

  const TabButton: React.FC<{ type: ActivityType; label: string; count: number }> = ({ type, label, count }) => (
     <button
        onClick={() => setActiveTab(type)}
        className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
            activeTab === type
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100'
        }`}
    >
        {label}
        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === type ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {count}
        </span>
    </button>
  );

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Minha Atividade</h2>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-6">
            <div className="bg-gray-50 p-1.5 rounded-lg inline-flex items-center space-x-2">
                <TabButton type="client" label="Meus Pedidos (Cliente)" count={user.ordersAsClient.length} />
                <TabButton type="provider" label="Meus Trabalhos (Fornecedor)" count={user.ordersAsProvider.length} />
            </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
            {ordersToShow.length > 0 ? (
                // Sort by status and then by recency (assuming date strings are comparable)
                [...ordersToShow]
                    .sort((a, b) => (a.status > b.status) ? 1 : (b.date > a.date) ? 1 : -1)
                    .map(order => <ActivityOrderCard key={order.id} order={order} />)
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                    <i className="fas fa-file-alt text-5xl text-gray-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-700">Nenhuma atividade encontrada</h3>
                    <p className="text-gray-500 mt-2">
                        {activeTab === 'client'
                            ? 'Quando você criar um pedido, ele aparecerá aqui.'
                            : 'Quando você realizar um trabalho, ele aparecerá aqui.'
                        }
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default ActivityTab;