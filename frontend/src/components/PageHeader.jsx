import React from 'react';

const PageHeader = ({ title, subtitle, icon, badge, children }) => {
  return (
    <div className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border-b border-slate-200/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start space-x-4">
            {icon && (
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <div className="w-8 h-8 text-white">
                  {icon}
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  {title}
                </h1>
                {badge && (
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-slate-600 text-base lg:text-lg font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center space-x-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
