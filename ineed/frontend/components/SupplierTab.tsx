import React from 'react';
import type { User, Review } from '../types';
import { CATEGORIES } from '../constants';
import { StarRating } from './StarRating';

interface SupplierTabProps {
  user: User;
  isEditing: boolean;
  editableUser: User;
  onUserChange: (field: keyof User, value: any) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="bg-white p-4 rounded-lg border">
    <div className="flex items-start">
      <img src={review.authorAvatar} alt={review.authorName} className="w-10 h-10 rounded-full mr-3" />
      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-800">{review.authorName}</h4>
          <span className="text-xs text-gray-500">{review.date}</span>
        </div>
        <StarRating rating={review.rating} />
        <p className="text-gray-700 mt-2">{review.text}</p>
      </div>
    </div>
  </div>
);

const SupplierTab: React.FC<SupplierTabProps> = ({ user, isEditing, editableUser, onUserChange, onInputChange }) => {
  const serviceCategories = user.serviceCategories?.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean) as (typeof CATEGORIES[0])[];

  // Placeholder reviews for demonstration as they are not on the User model for providers
  const mockReviews: Review[] = [
    { id: 'r1', orderId: 'o1', authorName: 'Carlos Pereira', authorAvatar: 'https://i.pravatar.cc/150?img=5', rating: 5, text: 'Excelente profissional, muito rápido e honesto. Recomendo!', date: '12/06/2024', criteria: { communication: 5, quality: 5, punctuality: 5 } },
    { id: 'r2', orderId: 'o2', authorName: 'Beatriz Lima', authorAvatar: 'https://i.pravatar.cc/150?img=6', rating: 4, text: 'Bom serviço, resolveu meu problema. Apenas demorou um pouco para responder no chat.', date: '28/05/2024', criteria: { communication: 3, quality: 5, punctuality: 4 } },
  ];
  
  const displayUser = isEditing ? editableUser : user;
  
  const priceLabels: { [key: number]: string } = {
    1: 'Muito Baixo', 5: 'Médio', 10: 'Muito Alto'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Details */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Detalhes do Fornecedor</h3>
            <div className="space-y-4">
                {/* Pricing Level */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nível de Preço</label>
                     {isEditing ? (
                        <div className="mt-1">
                            <input 
                                type="range" 
                                min="1" max="10" 
                                value={editableUser.pricing || 5} 
                                onChange={(e) => onUserChange('pricing', parseInt(e.target.value, 10))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>$</span>
                                <span className="font-semibold text-blue-600">{priceLabels[editableUser.pricing || 5] || editableUser.pricing}</span>
                                <span>$$$</span>
                            </div>
                        </div>
                     ) : (
                        <div className="flex items-center mt-1">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className={`h-2 w-4 mx-0.5 rounded-full ${i < (displayUser.pricing || 0) ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                            ))}
                            <span className="ml-3 text-sm font-medium text-gray-600">{priceLabels[displayUser.pricing || 5] || `Nível ${displayUser.pricing}`}</span>
                        </div>
                     )}
                </div>
                {/* Working Hours */}
                <div>
                     <label className="block text-sm font-medium text-gray-700">Horário de Atendimento</label>
                      {isEditing ? (
                         <input
                            type="text"
                            name="workingHours"
                            value={editableUser.workingHours || ''}
                            onChange={onInputChange}
                            className="w-full mt-1 p-2 border rounded-md"
                            placeholder="Ex: Seg-Sex, 9h-18h"
                          />
                      ) : (
                        <p className="text-gray-800">{displayUser.workingHours || 'Não informado'}</p>
                      )}
                </div>
            </div>
        </div>

        {/* Service Categories */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Categorias de Atuação</h3>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              <p className="text-sm text-gray-500 w-full">A edição de categorias estará disponível em breve.</p>
              {serviceCategories.map(cat => (
                <span key={cat.id} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${cat.color} text-white`}>
                  <i className={`${cat.icon} mr-2`}></i>
                  {cat.name}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {serviceCategories.length > 0 ? serviceCategories.map(cat => (
                <span key={cat.id} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${cat.color} text-white`}>
                  <i className={`${cat.icon} mr-2`}></i>
                  {cat.name}
                </span>
              )) : <p className="text-gray-500">Nenhuma categoria de serviço informada.</p>}
            </div>
          )}
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Portfólio</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.portfolio?.map((img, index) => (
              <div key={index} className="relative group">
                <img src={img} alt={`Portfolio item ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                {isEditing && (
                  <button className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                )}
              </div>
            ))}
            {isEditing && (
              <button className="border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition h-32">
                <i className="fas fa-plus"></i>
              </button>
            )}
          </div>
          {!user.portfolio?.length && !isEditing && <p className="text-gray-500">Nenhum item no portfólio.</p>}
        </div>
      </div>
      
      {/* Right Column: Reviews */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Avaliações Recebidas</h3>
          <div className="space-y-4">
            {mockReviews.map(review => <ReviewCard key={review.id} review={review} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierTab;