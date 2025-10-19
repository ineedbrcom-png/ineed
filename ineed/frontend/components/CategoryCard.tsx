import React from 'react';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onClick: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <button
      onClick={() => onClick(category.id)}
      className="group flex flex-col items-center text-center p-3 bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 cursor-pointer w-full"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color} text-white text-xl mb-3 group-hover:scale-110 transition-transform`}>
        <i className={category.icon}></i>
      </div>
      <h3 className="font-bold text-gray-800 mb-1 text-base">{category.name}</h3>
      <p className="text-gray-500 text-xs leading-tight">{category.description}</p>
    </button>
  );
};

export default CategoryCard;