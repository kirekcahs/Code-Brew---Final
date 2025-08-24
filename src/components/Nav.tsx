/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Coffee,
  LogOut,
  Building2,
  Monitor
} from 'lucide-react';

interface NavigationProps {
  children: React.ReactNode;
  userRole: string;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
}

const Navigation: React.FC<NavigationProps> = ({ children, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'admin': return 'Administrator';
      case 'branch-officer': return 'Branch Officer';
      case 'cashier': return 'Cashier';
      default: return 'User';
    }
  };

  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { label: 'Dashboard', path: `/${userRole}/dashboard`, icon: LayoutDashboard },
    ];

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { label: 'Branch Management', path: '/admin/branch-management', icon: Building2 },
        { label: 'Inventory', path: '/admin/inventory', icon: Package },
        { label: 'Assets', path: '/admin/assets', icon: Monitor },
        { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
      ];
    } else if (userRole === 'branch-officer') {
      return [
        ...baseItems,
        { label: 'Inventory', path: '/branch-officer/inventory', icon: Package },
        { label: 'Assets', path: '/branch-officer/assets', icon: Monitor },
        { label: 'Reports', path: '/branch-officer/reports', icon: BarChart3 },
      ];
    } else if (userRole === 'cashier') {
      return [
        { label: 'Point of Sale', path: '/cashier/pos', icon: ShoppingCart },
      ];
    }

    return baseItems;
  };

  return (
    <div className="flex h-screen bg-[#F5F0E6] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Coffee className="h-8 w-8 text-[#8C5A3A]" />
            <div>
              <h1 className="text-xl font-bold text-[#3D2C1D]">CodeBrew</h1>
              <p className="text-sm text-[#6F4E37]">{getRoleDisplayName()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {getNavigationItems().map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#8C5A3A] text-white'
                        : 'text-[#6F4E37] hover:bg-[#F5F0E6] hover:text-[#3D2C1D]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4">
            <p className="text-sm font-medium text-[#3D2C1D]">{userData?.username || 'admin'}</p>
            <p className="text-xs text-[#6F4E37]">No email</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-[#6F4E37] hover:bg-[#F5F0E6] hover:text-[#3D2C1D] rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Navigation;