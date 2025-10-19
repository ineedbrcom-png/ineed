import React from 'react';

interface StarInputProps {
  name: string;
  value: number;
  onChange: (value: number) => void;
}

const StarInput: React.FC<StarInputProps> = ({ name, value, onChange }) => {
  return (
    <div className="star-rating">
      {[5, 4, 3, 2, 1].map(starValue => (
        <React.Fragment key={starValue}>
          <input
            type="radio"
            id={`${name}-star${starValue}`}
            name={name}
            value={starValue}
            checked={value === starValue}
            onChange={() => onChange(starValue)}
          />
          <label htmlFor={`${name}-star${starValue}`} title={`${starValue} estrelas`}>&#9733;</label>
        </React.Fragment>
      ))}
    </div>
  );
};

export default StarInput;