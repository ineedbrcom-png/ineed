import React from 'react';
import type { Request } from '../types';
import { CATEGORIES } from '../constants';
import { useAppContext } from '../context/AppContext';

interface RequestDetailsModalProps {
  request: Request | null;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({ request }) => {
  const { dispatch } = useAppContext();
  
  if (!request) return null;
  
  const onClose = () => dispatch({ type: 'CLOSE_REQUEST_DETAILS' });
  const category = CATEGORIES.find(c => c.id === request.categoryId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in-down max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl z-20">
          &times;
        </button>
        
        <div className="p-6 sm:p-8 overflow-y-auto">
            <div className="flex items-start space-x-4 mb-5">
                <img src={request.userAvatar} alt={request.userName} className="h-16 w-16 rounded-full border-4 border-gray-100" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{request.title}</h2>
                    <p className="text-gray-500">por {request.userName}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
                {category && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${category.color} text-white`}>
                        <i className={`${category.icon} mr-2`}></i>
                        {category.name}
                    </span>
                )}
                 {request.budget && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        <i className="fas fa-dollar-sign mr-2"></i>
                        Orçamento: {request.budget}
                    </span>
                )}
            </div>
            
            <div className="prose max-w-none text-gray-700 mb-6">
                <h3 className="font-bold text-gray-800">Descrição</h3>
                <p>{request.description}</p>
            </div>

            {request.photos && request.photos.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-3">Fotos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {request.photos.map((photo, index) => (
                            <a key={index} href={photo} target="_blank" rel="noopener noreferrer">
                                <img src={photo} alt={`Foto do pedido ${index + 1}`} className="w-full h-32 object-cover rounded-md hover:opacity-90 transition-opacity" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
          
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-auto">
                <button className="w-full gradient-bg text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition transform hover:scale-105 flex-1">
                    <i className="fas fa-paper-plane mr-2"></i>Enviar Mensagem
                </button>
                <button className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition flex-1">
                    <i className="fas fa-hand-holding-usd mr-2"></i>Fazer Oferta
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;