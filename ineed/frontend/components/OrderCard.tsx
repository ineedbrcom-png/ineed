import React from 'react';
import type { UserOrder } from '../types';
import { CATEGORIES } from '../constants';

interface OrderCardProps {
  order: UserOrder;
  onReview: () => void;
  onViewDetails: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onReview, onViewDetails }) => {
  const category = CATEGORIES.find(c => c.id === order.categoryId);

  const statusStyles: { [key: string]: string } = {
    'Ativo': 'bg-green-100 text-green-800',
    'Concluído': 'bg-blue-100 text-blue-800',
    'Cancelado': 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
          <span className={`text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full ${statusStyles[order.status] || 'bg-gray-100 text-gray-800'}`}>
            {order.status}
          </span>
          {category && (
            <span className="text-sm text-gray-600 flex items-center">
              <i className={`${category.icon} mr-2 text-gray-400`}></i>
              {category.name}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-800">{order.title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Pedido em {order.date}
          {order.providerName && ` • Concluído por ${order.providerName}`}
        </p>
      </div>
      <div className="flex-shrink-0 flex items-center space-x-2 w-full sm:w-auto">
        <button onClick={onViewDetails} className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
          Ver Detalhes
        </button>
        {order.status === 'Concluído' && !order.isReviewed && (
          <button onClick={onReview} className="w-full sm:w-auto px-4 py-2 bg-yellow-400 text-white text-sm font-semibold rounded-lg hover:bg-yellow-500 transition">
            Avaliar
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;