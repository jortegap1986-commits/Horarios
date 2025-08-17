
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '' }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl border border-slate-200 ${className}`}>
      <div className={`p-4 border-b border-slate-200 ${titleClassName}`}>
        <h2 className="text-xl font-bold text-slate-700">{title}</h2>
      </div>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
