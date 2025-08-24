import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Coffee,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';
import BranchIndicator from '../components/BranchIndicator';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  lowStockCount: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  monthlyRevenue: number;
}

interface RecentOrder {
  order_id: string;
  customer_name: string;
  total_amount: number;
  order_date: string;
  status: string;
  payment_method: string;
  items_count: number;
}

interface LowStockItem {
  product_id: string;
  product_name: string;
  current_stock: number;
  reorder_level: number;
  category: string;
  branch_name: string;
}

interface TopProduct {
  product_name: string;
  total_sold: number;
  revenue: number;
  category: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockCount: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    monthlyRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  //  Better branch ID handling for Admin users
  useEffect(() => {
    const fetchBranchData = () => {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      let branchId = localStorage.getItem('selectedBranch');
      
      //  Handle Admin vs other roles differently
      if (userData.role_name === 'Admin') {
        // Admin: Use selected branch
        if (!branchId || branchId === 'null' || branchId === 'undefined') {
          console.log('❌ Admin has no branch selected - redirecting to branch management');
          // Don't redirect here, just show a message and use a default
          branchId = '1'; // Default fallback
        }
      } else {
        // Branch Officer/Cashier: Use assigned branch
        branchId = userData.branch_id?.toString() || '1';
      }
      
      setSelectedBranch(branchId?.toString() || '');
      localStorage.setItem('selectedBranch', branchId?.toString() || '');
      
      return branchId;
    };

    const branchId = fetchBranchData();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      let branchId = localStorage.getItem('selectedBranch');
      
      //  Better validation for branch ID
      if (!branchId || branchId === 'null' || branchId === 'undefined') {
        if (userData.role_name === 'Admin') {
          console.log('⚠️ Admin needs to select a branch first');
          setIsLoading(false);
          return; // Don't fetch data if no branch selected
        } else {
          branchId = userData.branch_id?.toString() || '1';
          localStorage.setItem('selectedBranch', branchI);
        }
      }
      
      console.log('🔵 Fetching dashboard data for branch:', branchId);
      
      const [statsRes, ordersRes, inventoryRes, productsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/v1/dashboard/stats?branch_id=${branchId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:3000/api/v1/orders/recent?branch_id=${branchId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:3000/api/v1/inventory/low-stock?branch_id=${branchId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:3000/api/v1/products/top-selling?branch_id=${branchId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        //  Use mock data if endpoints not ready
        setStats({
          totalSales: 125000,
          totalOrders: 45,
          totalProducts: 24,
          totalUsers: 8,
          lowStockCount: 3,
          todayRevenue: 12500,
          yesterdayRevenue: 11200,
          monthlyRevenue: 385000
        });
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData);
      } else {
        //  Mock recent orders
        setRecentOrders([
          {
            order_id: 'ORD-001',
            customer_name: 'Juan Dela Cruz',
            total_amount: 340,
            order_date: new Date().toISOString(),
            status: 'completed',
            payment_method: 'cash',
            items_count: 3
          },
          {
            order_id: 'ORD-002',
            customer_name: 'Maria Santos',
            total_amount: 520,
            order_date: new Date(Date.now() - 3600000).toISOString(),
            status: 'completed',
            payment_method: 'card',
            items_count: 5
          }
        ]);
      }

      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setLowStockItems(inventoryData);
      } else {
        // Mock low stock items
        setLowStockItems([
          {
            product_id: '1',
            product_name: 'Espresso Beans',
            current_stock: 5,
            reorder_level: 20,
            category: 'coffee',
            branch_name: 'Main Branch'
          },
          {
            product_id: '2',
            product_name: 'Croissant',
            current_stock: 3,
            reorder_level: 15,
            category: 'bread',
            branch_name: 'BGC Branch'
          }
        ]);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setTopProducts(productsData);
      } else {
        // Mock top products
        setTopProducts([
          {
            product_name: 'Hot Latte',
            total_sold: 89,
            revenue: 12560,
            category: 'coffee'
          },
          {
            product_name: 'Croissant',
            total_sold: 67,
            revenue: 8040,
            category: 'bread'
          }
        ]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRevenueGrowth = (): number => {
    if (stats.yesterdayRevenue === 0) return 0;
    return ((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue) * 100;
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string): string => {
    switch (method.toLowerCase()) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'digital':
        return '📱';
      default:
        return '💰';
    }
  };

  // : Show branch selection prompt for Admin without selected branch
  if (isLoading) {
    return (
      <div className="h-screen bg-[#F5F0E6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8C5A3A]"></div>
          <p className="mt-4 text-[#6F4E37]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if Admin needs to select branch
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const selectedBranchId = localStorage.getItem('selectedBranch');

  if (userData.role_name === 'Admin' && (!selectedBranchId || selectedBranchId === 'null')) {
    return (
      <div className="h-screen bg-[#F5F0E6] overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            <BranchIndicator />
            
            <div className="bg-[#FFFBF5] p-12 rounded-lg border border-[#E5D5C8] text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-[#3D2C1D] mb-2">No Branch Selected</h3>
              <p className="text-[#6F4E37] text-lg mb-6">
                Please go to Branch Management to select a branch first
              </p>
              <button
                onClick={() => window.location.href = '/admin/branch-management'}
                className="bg-[#8C5A3A] text-white px-8 py-3 rounded-lg hover:bg-[#6F4E37] transition text-lg"
              >
                Go to Branch Management
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F5F0E6] overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          {/*  Branch Indicator */}
          <BranchIndicator />
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8C5A3A] to-[#6F4E37] text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Coffee className="h-8 w-8" />
                  CodeBrew Dashboard
                </h1>
                <p className="text-white/90">
                  Welcome back! Here's what's happening at your coffee shop today.
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-white/90 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Live Time</span>
                </div>
                <div className="text-2xl font-bold">
                  {currentTime.toLocaleTimeString('en-PH', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
                <div className="text-sm text-white/80">
                  {currentTime.toLocaleDateString('en-PH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue Card */}
            <div className="bg-[#FFFBF5] p-6 rounded-2xl shadow-lg border border-[#D6C7B7] hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[#6F4E37] mb-1">Today's Revenue</h3>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{formatCurrency(stats.todayRevenue)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`h-4 w-4 mr-1 ${getRevenueGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-sm font-medium ${getRevenueGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getRevenueGrowth() >= 0 ? '+' : ''}{getRevenueGrowth().toFixed(1)}%
                    </span>
                    <span className="text-xs text-[#6F4E37] ml-1">vs yesterday</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-[#FFFBF5] p-6 rounded-2xl shadow-lg border border-[#D6C7B7] hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[#6F4E37] mb-1">Total Orders</h3>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{stats.totalOrders}</p>
                  <p className="text-xs text-[#6F4E37] mt-2">Active orders today</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Products Card */}
            <div className="bg-[#FFFBF5] p-6 rounded-2xl shadow-lg border border-[#D6C7B7] hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[#6F4E37] mb-1">Total Products</h3>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{stats.totalProducts}</p>
                  <p className="text-xs text-[#6F4E37] mt-2">Menu items available</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#8C5A3A] to-[#6F4E37] rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-[#FFFBF5] p-6 rounded-2xl shadow-lg border border-[#D6C7B7] hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[#6F4E37] mb-1">Low Stock Items</h3>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{stats.lowStockCount}</p>
                  <p className="text-xs text-red-600 mt-2">Requires attention</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/*  Recent Orders and Low Stock - Remove fixed heights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-[#FFFBF5] rounded-2xl shadow-lg border border-[#D6C7B7] overflow-hidden">
              <div className="p-6 border-b border-[#D6C7B7]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#3D2C1D] flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-[#8C5A3A]" />
                    Recent Orders
                  </h3>
                  <button
                    onClick={fetchDashboardData}
                    className="p-2 text-[#8C5A3A] hover:bg-[#F5F0E6] rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* : Fixed height, flows naturally */}
              <div>
                {recentOrders.length === 0 ? (
                  <div className="p-6 text-center text-[#6F4E37]">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-[#D6C7B7]" />
                    <p>No recent orders</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#D6C7B7]">
                    {recentOrders.map((order) => (
                      <div key={order.order_id} className="p-4 hover:bg-[#F5F0E6] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getPaymentMethodIcon(order.payment_method)}</span>
                            <div>
                              <h4 className="font-medium text-[#3D2C1D]">{order.customer_name}</h4>
                              <p className="text-xs text-[#6F4E37]">Order #{order.order_id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#8C5A3A]">{formatCurrency(order.total_amount)}</p>
                            <p className="text-xs text-[#6F4E37]">{order.items_count} items</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-[#6F4E37]">{formatDate(order.order_date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-[#FFFBF5] rounded-2xl shadow-lg border border-[#D6C7B7] overflow-hidden">
              <div className="p-6 border-b border-[#D6C7B7]">
                <h3 className="text-lg font-semibold text-[#3D2C1D] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Low Stock Alerts
                </h3>
              </div>
              {/*  Fixed height, flows naturally */}
              <div>
                {lowStockItems.length === 0 ? (
                  <div className="p-6 text-center text-[#6F4E37]">
                    <Package className="h-12 w-12 mx-auto mb-2 text-[#D6C7B7]" />
                    <p>All items are well stocked!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#D6C7B7]">
                    {lowStockItems.map((item) => (
                      <div key={`lowstock-${item.product_id}-${item.branch_name}`} className="p-4 hover:bg-[#F5F0E6] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-[#3D2C1D]">{item.product_name}</h4>
                            <p className="text-xs text-[#6F4E37]">{item.branch_name}</p>
                          </div>
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-lg font-bold text-red-600">{item.current_stock}</p>
                              <p className="text-xs text-[#6F4E37]">Current</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-[#8C5A3A]">{item.reorder_level}</p>
                              <p className="text-xs text-[#6F4E37]">Reorder at</p>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-[#8C5A3A] text-white rounded-lg text-xs hover:bg-[#6F4E37] transition-colors">
                            Restock
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-[#FFFBF5] rounded-2xl shadow-lg border border-[#D6C7B7] overflow-hidden">
            <div className="p-6 border-b border-[#D6C7B7]">
              <h3 className="text-lg font-semibold text-[#3D2C1D] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#8C5A3A]" />
                Top Selling Products
              </h3>
            </div>
            {/* Fixed height, flows naturally */}
            <div className="p-6">
              {topProducts.length === 0 ? (
                <div className="text-center text-[#6F4E37] py-8">
                  <Package className="h-12 w-12 mx-auto mb-2 text-[#D6C7B7]" />
                  <p>No sales data available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topProducts.map((product, index) => (
                    <div key={`topproduct-${product.product_name}-${index}`} className="flex items-center justify-between p-4 bg-[#F5F0E6] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#8C5A3A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-[#3D2C1D]">{product.product_name}</h4>
                          <p className="text-xs text-[#6F4E37]">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#8C5A3A]">{formatCurrency(product.revenue)}</p>
                        <p className="text-xs text-[#6F4E37]">{product.total_sold} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-gradient-to-r from-[#8C5A3A] to-[#6F4E37] text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Performance
                </h3>
                <p className="text-3xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-white/80">Total revenue this month</p>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm mb-1">Average Daily Revenue</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.monthlyRevenue / new Date().getDate())}
                </div>
              </div>
            </div>
          </div>
          
          {/* Add bottom padding for better scrolling */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
