

import React, { useState, useMemo } from 'react';
import type { UserOrder } from '../types';
import OrderCard from './OrderCard';
import { useAppContext } from '../context/AppContext';

type OrderStatus = 'Ativo' | 'Concluído' | 'Cancelado';
const TABS: OrderStatus[] = ['Ativo', 'Concluído', 'Cancelado'];

const MyOrdersPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentUser } = state;
  const [activeTab, setActiveTab] = useState<OrderStatus>('Ativo');

  const orders = currentUser?.ordersAsClient || [];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => order.status === activeTab);
  }, [orders, activeTab]);

  const onReviewOrder = (order: UserOrder) => dispatch({ type: 'SET_ORDER_TO_REVIEW', payload: order });
  const onViewDetails = (order: UserOrder) => dispatch({ type: 'OPEN_ORDER_DETAILS', payload: order });

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Meus Pedidos</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => 
            <OrderCard 
              key={order.id} 
              order={order} 
              onReview={() => onReviewOrder(order)}
              onViewDetails={() => onViewDetails(order)}
            />
          )
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <i className="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">Você não tem nenhum pedido {activeTab.toLowerCase()}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;