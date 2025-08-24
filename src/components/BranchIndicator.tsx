

import React, { useState, useEffect } from 'react';
import { Building2, MapPin, User } from 'lucide-react';

const BranchIndicator: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const updateUserData = () => {
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        setUserData(user);
      }
    };

    // Initial load
    updateUserData();

    const handleStorageChange = () => {
      updateUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    window.addEventListener('userDataUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdate', handleStorageChange);
    };
  }, []);

  if (!userData) return null;

  const displayBranchName = userData.role_name === 'Admin' 
    ? (userData.selected_branch_name || 'No Branch Selected')
    : (userData.branch_name || 'Unknown Branch');
    
  const displayBranchId = userData.role_name === 'Admin'
    ? (userData.selected_branch_id || 'N/A')
    : (userData.branch_id || 'N/A');

  const displayAddress = userData.role_name === 'Admin'
    ? (userData.selected_branch_address || 'Please select a branch')
    : (userData.location_address || 'No address available');

  return (
    <div className="bg-gradient-to-r from-[#8C5A3A] to-[#6F4E37] text-white px-6 py-4 rounded-lg shadow-lg border-2 border-[#D6C7B7] mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white text-[#8C5A3A] p-2 rounded-full">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              📍 {displayBranchName}
              {userData.role_name === 'Admin' && !userData.selected_branch_name && (
                <span className="text-yellow-300 text-sm font-normal">(Select a branch first)</span>
              )}
            </h2>
            <div className="flex items-center gap-4 text-[#F5F0E6] text-sm">
              <span className="flex items-center gap-1">
                <User size={16} />
                {userData.role_name} • {userData.username}
              </span>
              {displayAddress && displayAddress !== 'Please select a branch' && (
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {displayAddress}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-white bg-opacity-20 py-1 rounded-full">
            <span className="text-sm text-[#8C5A3A] font-medium">Branch ID: {displayBranchId}</span>
          </div>
          {userData.role_name === 'Admin' && (
            <div className="text-xs text-[#F5F0E6] mt-1">
              Admin View • Managing Selected Branch
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchIndicator;
