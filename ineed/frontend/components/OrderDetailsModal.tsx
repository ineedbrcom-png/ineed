import React from 'react';
import type { UserOrder, OrderOffer } from '../types';
import { CATEGORIES } from '../constants';
import { StarRating } from './StarRating';
import { useAppContext } from '../context/AppContext';

interface OfferCardProps {
  offer: OrderOffer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => (
    <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
                <img src={offer.providerAvatar} alt={offer.providerName} className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <h4 className="font-bold text-gray-800">{offer.providerName}</h4>
                    <div className="flex items-center text-xs">
                        <StarRating rating={offer.providerRating} />
                        <span className="ml-2 text-gray-500">({offer.providerRating.toFixed(1)})</span>
                    </div>
                </div>
            </div>
            <span className="text-green-600 font-bold">R$ {offer.value.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-700 mb-4">{offer.message}</p>
        <div className="flex justify-end space-x-2">
            <button className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600">Mensagem</button>
            <button className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600">Aceitar</button>
        </div>
    </div>
);


interface OrderDetailsModalProps {
  order: UserOrder | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order }) => {
  const { dispatch, handleCancelOrder } = useAppContext();
  const onClose = () => dispatch({ type: 'CLOSE_ORDER_DETAILS' });

  if (!order) return null;

  const category = CATEGORIES.find(c => c.id === order.categoryId);

  const handleCancel = () => {
    if (window.confirm('Tem certeza de que deseja cancelar este pedido? Esta ação não pode ser desfeita e removerá o pedido da listagem pública.')) {
        handleCancelOrder(order).catch(err => {
            console.error(err);
            alert("Falha ao cancelar o pedido. Tente novamente.");
        });
    }
  };

  const handleEdit = () => {
      dispatch({ type: 'START_EDIT_ORDER', payload: order });
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-down" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{order.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl z-10">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto">
             {category && (
                <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${category.color} text-white`}>
                        <i className={`${category.icon} mr-2`}></i>
                        {category.name}
                    </span>
                </div>
            )}
            
            <h3 className="font-bold text-gray-800 mb-2">Descrição do Pedido</h3>
            <p className="text-gray-700 mb-6">{order.description}</p>
            
            <h3 className="font-bold text-gray-800 mb-4">Ofertas Recebidas ({order.offers.length})</h3>
            <div className="space-y-4">
                {order.offers.length > 0 ? (
                    order.offers.map(offer => <OfferCard key={offer.id} offer={offer} />)
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma oferta recebida ainda.</p>
                )}
            </div>
        </div>
        {order.status === 'Ativo' && (
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
                <button onClick={handleCancel} className="px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200">Cancelar Pedido</button>
                <button onClick={handleEdit} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300">Editar Pedido</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
