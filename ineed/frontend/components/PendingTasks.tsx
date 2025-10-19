import React from 'react';
import type { UserOrder } from '../types';
import { useAppContext } from '../context/AppContext';

interface PendingTasksProps {
  orders: UserOrder[];
}

const PendingTaskCard: React.FC<{ order: UserOrder }> = ({ order }) => {
    const { dispatch } = useAppContext();
    const onViewDetails = () => dispatch({ type: 'OPEN_ORDER_DETAILS', payload: order });

    return (
        <div className="bg-gray-50 p-4 rounded-lg border flex items-center justify-between transition transform hover:-translate-y-1 hover:shadow-md">
            <div>
                <h4 className="font-semibold text-gray-800">{order.title}</h4>
                <p className="text-sm text-gray-500">Publicado {order.date} - {order.offersCount} oferta(s)</p>
            </div>
            <button onClick={onViewDetails} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-600 transition">
                Gerenciar
            </button>
        </div>
    );
};

const PendingTasks: React.FC<PendingTasksProps> = ({ orders }) => {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {orders.map(order => (
        <PendingTaskCard key={order.id} order={order} />
      ))}
    </div>
  );
};

export default PendingTasks;