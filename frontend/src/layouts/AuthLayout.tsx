import React from 'react';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">MFG Manager</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manufacturing Management System
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;