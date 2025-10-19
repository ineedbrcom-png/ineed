
import React from 'react';
import type { Testimonial } from '../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white/20 p-6 rounded-lg backdrop-blur-sm text-center flex flex-col items-center">
      <img src={testimonial.avatar} alt={testimonial.authorName} className="w-20 h-20 rounded-full mb-4 border-4 border-white/50" />
      <p className="text-gray-100 mb-4 flex-grow">"{testimonial.text}"</p>
      <div>
        <h4 className="font-bold text-white">{testimonial.authorName}</h4>
        <p className="text-sm text-gray-300">{testimonial.authorRole}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
