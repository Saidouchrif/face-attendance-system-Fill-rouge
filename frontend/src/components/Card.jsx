import React from 'react';

const Card = ({ children, className = '', hover = false, gradient = false }) => {
  const baseClasses = "bg-white rounded-2xl shadow-lg border transition-all duration-300";
  const hoverClasses = hover ? "hover:shadow-2xl hover:scale-[1.01] cursor-pointer" : "";
  const gradientClasses = gradient 
    ? "border-blue-200/50 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30" 
    : "border-slate-200/50";
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-5 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 via-blue-50/30 to-purple-50/30 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, icon, className = '' }) => {
  return (
    <h2 className={`text-lg font-bold text-slate-900 flex items-center space-x-2 ${className}`}>
      {icon && <span className="text-blue-600">{icon}</span>}
      <span>{children}</span>
    </h2>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;

export default Card;
