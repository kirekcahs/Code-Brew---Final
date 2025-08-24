import React from 'react';
import { Navigate } from 'react-router-dom';
import { Coffee } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">
        <div className="bg-[#FFFBF5] p-8 rounded-2xl shadow-lg border border-[#D6C7B7] text-center max-w-md">
          <Coffee className="h-16 w-16 text-[#8C5A3A] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#3D2C1D] mb-2">Access Denied</h2>
          <p className="text-[#6F4E37] mb-4">
            You don't have permission to access this area.
          </p>
          <p className="text-sm text-[#6F4E37]/70">
            Current role: {userRole || 'Unknown'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-6 py-2 bg-[#8C5A3A] text-white rounded-lg hover:bg-[#6F4E37] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;