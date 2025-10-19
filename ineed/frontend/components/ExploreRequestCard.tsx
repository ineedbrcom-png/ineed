import React from 'react';
import type { Request } from '../types';
import { CATEGORIES } from '../constants';

interface ExploreRequestCardProps {
  request: Request;
  onClick: () => void;
}

const ExploreRequestCard: React.FC<ExploreRequestCardProps> = ({ request, onClick }) => {
  const category = CATEGORIES.find(c => c.id === request.categoryId);
  const distance = "Aprox. 250m"; // Placeholder

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full text-left flex flex-col"
    >
      {request.photos && request.photos.length > 0 ? (
        <img src={request.photos[0]} alt={request.title} className="w-full h-40 object-cover" />
      ) : (
        <div className={`w-full h-40 flex items-center justify-center ${category?.color || 'bg-gray-200'}`}>
          <i className={`${category?.icon || 'fas fa-image'} text-white text-5xl opacity-70`}></i>
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          {category && (
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">{category.name}</p>
          )}
          <h3 className="font-bold text-gray-800 text-lg leading-tight truncate">{request.title}</h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{request.description}</p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center">
            <img src={request.userAvatar} alt={request.userName} className="w-8 h-8 rounded-full mr-2 object-cover" />
            <span className="text-sm text-gray-600 font-medium">{request.userName}</span>
          </div>
          <span className="text-sm text-gray-600 flex items-center">
            <i className="fas fa-map-marker-alt mr-1.5"></i>
            {distance}
          </span>
        </div>
      </div>
    </button>
  );
};

export default ExploreRequestCard;