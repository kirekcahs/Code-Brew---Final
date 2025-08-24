/* eslint-disable @typescript-eslint/no-explicit-any */
// Replace your entire Reports.tsx with this enhanced version:

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  DollarSign,
  Package,
  Users,
  Coffee,
  FileText,
  Filter,
  RefreshCw,
  PieChart,
  LineChart
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesReport {
  date: string;
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  branch_name: string;
}

interface InventoryReport {
  product_name: string;
  category: string;
  current_stock: number;
  sold_quantity: number;
  reorder_level: number;
  branch_name: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface FinancialReport {
  period: string;
  revenue: number;
  cost_of_goods: number;
  gross_profit: number;
  operating_expenses: number;
  net_profit: number;
  profit_margin: number;
}

interface ReportStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingProduct: string;
  bestPerformingBranch: string;
}

interface ReportFilters {
  reportType: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  branchId: string;
  category: string;
}

const ReportsManagement: React.FC = () => {
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);
  const [inventoryReports, setInventoryReports] = useState<InventoryReport[]>([]);
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingProduct: '',
    bestPerformingBranch: ''
  });
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'sales',
    dateRange: 'this_month',
    startDate: '',
    endDate: '',
    branchId: 'all',
    category: 'all'
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'doughnut'>('line');

  useEffect(() => {
    fetchReports();
  }, [filters]);

  useEffect(() => {
    if (filters.reportType === 'inventory' && filters.branchId === 'all') {
      setFilters(prev => ({ ...prev, branchId: '1' }));
    }
  }, [filters.reportType]);

  const fetchReports = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      
      if (filters.dateRange && filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      if (filters.reportType === 'inventory') {
        if (filters.branchId === 'all') {
          params.append('branchId', '1');
        } else {
          params.append('branchId', filters.branchId);
        }
      } else {
        if (filters.branchId && filters.branchId !== 'all') {
          params.append('branchId', filters.branchId);
        }
      }
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      
      let endpoint = '';
      switch (filters.reportType) {
        case 'sales':
          endpoint = 'sales';
          break;
        case 'inventory':
          endpoint = 'inventory';
          break;
        case 'financial':
          endpoint = 'sales';
          break;
        default:
          endpoint = 'sales';
      }

      const url = `http://localhost:3000/api/v1/reports/${endpoint}${params.toString() ? '?' + params.toString() : ''}`;
      console.log('🔵 Fetching report from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🟢 Report data received:', data);
        
        if (filters.reportType === 'sales' || filters.reportType === 'financial') {
          setSalesReports(Array.isArray(data) ? data : data.salesReports || []);
          setStats(data.stats || {
            totalRevenue: parseFloat(data.total_sales) || 0,
            totalOrders: parseInt(data.total_orders) || 0,
            averageOrderValue: parseFloat(data.average_order_value) || 0,
            topSellingProduct: stats.topSellingProduct,
            bestPerformingBranch: stats.bestPerformingBranch
          });
        } else if (filters.reportType === 'inventory') {
          setInventoryReports(Array.isArray(data) ? data : []);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Report API Error:', response.status, errorText);
        generateMockData();
      }
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (): void => {
    const mockSalesReports: SalesReport[] = [
      { date: '2024-01-01', total_sales: 15000, total_orders: 45, average_order_value: 333, branch_name: 'Main Branch' },
      { date: '2024-01-02', total_sales: 18000, total_orders: 52, average_order_value: 346, branch_name: 'Main Branch' },
      { date: '2024-01-03', total_sales: 12000, total_orders: 38, average_order_value: 316, branch_name: 'Mall Branch' },
      { date: '2024-01-04', total_sales: 22000, total_orders: 65, average_order_value: 338, branch_name: 'Main Branch' },
      { date: '2024-01-05', total_sales: 16000, total_orders: 48, average_order_value: 333, branch_name: 'Mall Branch' },
      { date: '2024-01-06', total_sales: 20000, total_orders: 58, average_order_value: 345, branch_name: 'Downtown Branch' },
      { date: '2024-01-07', total_sales: 8500, total_orders: 28, average_order_value: 304, branch_name: 'Downtown Branch' }
    ];

    const mockInventoryReports: InventoryReport[] = [
      { product_name: 'Espresso Blend', category: 'Coffee', current_stock: 50, sold_quantity: 120, reorder_level: 20, branch_name: 'Main Branch', status: 'in_stock' },
      { product_name: 'Croissant', category: 'Pastry', current_stock: 5, sold_quantity: 85, reorder_level: 15, branch_name: 'Mall Branch', status: 'low_stock' },
      { product_name: 'Latte Mix', category: 'Coffee', current_stock: 30, sold_quantity: 95, reorder_level: 25, branch_name: 'Main Branch', status: 'in_stock' },
      { product_name: 'Muffin', category: 'Pastry', current_stock: 0, sold_quantity: 45, reorder_level: 10, branch_name: 'Downtown Branch', status: 'out_of_stock' }
    ];

    const mockFinancialReports: FinancialReport[] = [
      { period: 'January 2024', revenue: 450000, cost_of_goods: 180000, gross_profit: 270000, operating_expenses: 150000, net_profit: 120000, profit_margin: 26.67 },
      { period: 'February 2024', revenue: 520000, cost_of_goods: 200000, gross_profit: 320000, operating_expenses: 160000, net_profit: 160000, profit_margin: 30.77 },
      { period: 'March 2024', revenue: 480000, cost_of_goods: 190000, gross_profit: 290000, operating_expenses: 155000, net_profit: 135000, profit_margin: 28.13 }
    ];

    setSalesReports(mockSalesReports);
    setInventoryReports(mockInventoryReports);
    setFinancialReports(mockFinancialReports);
    setStats({
      totalRevenue: 1450000,
      totalOrders: 334,
      averageOrderValue: 325,
      topSellingProduct: 'Espresso Blend',
      bestPerformingBranch: 'Main Branch'
    });
  };

  // ✅ NEW: Chart data preparation functions
  const getSalesChartData = () => {
    if (chartType === 'pie' || chartType === 'doughnut') {
      // Branch-wise sales for pie/doughnut chart
      const branchSales = salesReports.reduce((acc, report) => {
        acc[report.branch_name] = (acc[report.branch_name] || 0) + report.total_sales;
        return acc;
      }, {} as Record<string, number>);

      return {
        labels: Object.keys(branchSales),
        datasets: [{
          label: 'Sales by Branch',
          data: Object.values(branchSales),
          backgroundColor: [
            '#8C5A3A',
            '#6F4E37',
            '#D2691E',
            '#CD853F',
            '#DEB887'
          ],
          borderColor: '#FFFFFF',
          borderWidth: 2
        }]
      };
    } else {
      // Time-series data for line/bar chart
      return {
        labels: salesReports.map(report => new Date(report.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Daily Sales',
          data: salesReports.map(report => report.total_sales),
          borderColor: '#8C5A3A',
          backgroundColor: chartType === 'line' ? 'rgba(140, 90, 58, 0.1)' : '#8C5A3A',
          fill: chartType === 'line',
          tension: 0.4
        }]
      };
    }
  };

  const getInventoryChartData = () => {
    if (chartType === 'pie' || chartType === 'doughnut') {
      // Stock status distribution
      const statusCounts = inventoryReports.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        labels: Object.keys(statusCounts).map(status => status.replace('_', ' ').toUpperCase()),
        datasets: [{
          label: 'Inventory Status',
          data: Object.values(statusCounts),
          backgroundColor: [
            '#10B981', // Green for in_stock
            '#F59E0B', // Yellow for low_stock
            '#EF4444'  // Red for out_of_stock
          ],
          borderColor: '#FFFFFF',
          borderWidth: 2
        }]
      };
    } else {
      return {
        labels: inventoryReports.map(report => report.product_name),
        datasets: [
          {
            label: 'Current Stock',
            data: inventoryReports.map(report => report.current_stock),
            backgroundColor: '#8C5A3A',
          },
          {
            label: 'Sold Quantity',
            data: inventoryReports.map(report => report.sold_quantity),
            backgroundColor: '#6F4E37',
          }
        ]
      };
    }
  };

  const getFinancialChartData = () => {
    if (chartType === 'pie' || chartType === 'doughnut') {
      // Expense breakdown for latest period
      const latestReport = financialReports[financialReports.length - 1];
      if (!latestReport) return { labels: [], datasets: [] };

      return {
        labels: ['Cost of Goods', 'Operating Expenses', 'Net Profit'],
        datasets: [{
          label: 'Financial Breakdown',
          data: [latestReport.cost_of_goods, latestReport.operating_expenses, latestReport.net_profit],
          backgroundColor: [
            '#EF4444', // Red for costs
            '#F59E0B', // Yellow for expenses
            '#10B981'  // Green for profit
          ],
          borderColor: '#FFFFFF',
          borderWidth: 2
        }]
      };
    } else {
      return {
        labels: financialReports.map(report => report.period),
        datasets: [
          {
            label: 'Revenue',
            data: financialReports.map(report => report.revenue),
            borderColor: '#10B981',
            backgroundColor: chartType === 'line' ? 'rgba(16, 185, 129, 0.1)' : '#10B981',
            fill: chartType === 'line',
          },
          {
            label: 'Net Profit',
            data: financialReports.map(report => report.net_profit),
            borderColor: '#8C5A3A',
            backgroundColor: chartType === 'line' ? 'rgba(140, 90, 58, 0.1)' : '#8C5A3A',
            fill: chartType === 'line',
          }
        ]
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: '#3D2C1D',
        titleColor: '#F5F0E6',
        bodyColor: '#F5F0E6',
        borderColor: '#8C5A3A',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            if (filters.reportType === 'sales' || filters.reportType === 'financial') {
              return `${context.dataset.label}: ₱${context.parsed.y?.toLocaleString() || context.parsed?.toLocaleString()}`;
            }
            return `${context.dataset.label}: ${context.parsed.y || context.parsed}`;
          }
        }
      }
    },
    scales: (chartType === 'line' || chartType === 'bar') ? {
      x: {
        grid: {
          color: '#D6C7B7'
        },
        ticks: {
          color: '#6F4E37'
        }
      },
      y: {
        grid: {
          color: '#D6C7B7'
        },
        ticks: {
          color: '#6F4E37',
          callback: function(value: any) {
            if (filters.reportType === 'sales' || filters.reportType === 'financial') {
              return '₱' + value.toLocaleString();
            }
            return value;
          }
        }
      }
    } : {}
  };

  const renderChart = () => {
    let chartData;
    
    switch (filters.reportType) {
      case 'sales':
        chartData = getSalesChartData();
        break;
      case 'inventory':
        chartData = getInventoryChartData();
        break;
      case 'financial':
        chartData = getFinancialChartData();
        break;
      default:
        chartData = getSalesChartData();
    }

    if (isLoading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="animate-spin h-8 w-8 text-[#8C5A3A] mb-4" />
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-PH');
  };

  const handleFilterChange = (field: keyof ReportFilters, value: string): void => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const generateReport = async (): Promise<void> => {
    setIsGenerating(true);
    try {
      await fetchReports();
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = (): void => {
    let csvContent = '';
    let filename = '';

    if (filters.reportType === 'sales') {
      csvContent = [
        ['Date', 'Branch', 'Total Sales', 'Total Orders', 'Average Order Value'],
        ...salesReports.map((report: SalesReport) => [
          report.date,
          report.branch_name,
          report.total_sales.toString(),
          report.total_orders.toString(),
          report.average_order_value.toString()
        ])
      ].map(row => row.join(',')).join('\n');
      filename = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (filters.reportType === 'inventory') {
      csvContent = [
        ['Product', 'Category', 'Branch', 'Current Stock', 'Sold Quantity', 'Reorder Level', 'Status'],
        ...inventoryReports.map((report: InventoryReport) => [
          report.product_name,
          report.category,
          report.branch_name,
          report.current_stock.toString(),
          report.sold_quantity.toString(),
          report.reorder_level.toString(),
          report.status
        ])
      ].map(row => row.join(',')).join('\n');
      filename = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (filters.reportType === 'financial') {
      csvContent = [
        ['Period', 'Revenue', 'Cost of Goods', 'Gross Profit', 'Operating Expenses', 'Net Profit', 'Profit Margin %'],
        ...financialReports.map((report: FinancialReport) => [
          report.period,
          report.revenue.toString(),
          report.cost_of_goods.toString(),
          report.gross_profit.toString(),
          report.operating_expenses.toString(),
          report.net_profit.toString(),
          report.profit_margin.toString()
        ])
      ].map(row => row.join(',')).join('\n');
      filename = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStockStatusColor = (status: string): string => {
    switch (status) {
      case 'in_stock':
        return 'text-green-700 bg-green-100';
      case 'low_stock':
        return 'text-yellow-700 bg-yellow-100';
      case 'out_of_stock':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };


  return (
    <div className="h-screen bg-[#F5F0E6] overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#3D2C1D] mb-2 flex items-center">
                  <BarChart3 className="h-8 w-8 text-[#8C5A3A] mr-3" />
                  Reports & Analytics
                </h1>
                <p className="text-[#6F4E37]">Generate comprehensive reports for all CodeBrew operations</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-[#6F4E37] hover:bg-[#5A3D29] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className={`${isGenerating ? 'animate-spin' : ''}`} size={20} />
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </button>
                <button
                  onClick={exportReport}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#8C5A3A] to-[#6F4E37] hover:from-[#6F4E37] hover:to-[#5A3D29] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  <Download size={20} />
                  Export Report
                </button>
                
              </div>
            </div>
          </div>

          {/* Report Filters */}
          <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="h-5 w-5 text-[#8C5A3A]" />
              <h3 className="text-lg font-semibold text-[#3D2C1D]">Report Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Report Type</label>
                <select
                  value={filters.reportType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    handleFilterChange('reportType', e.target.value)
                  }
                  className="w-full border border-[#D6C7B7] rounded-lg p-2 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                >
                  <option value="sales">Sales Report</option>
                  <option value="inventory">Inventory Report</option>
                  <option value="financial">Financial Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    handleFilterChange('dateRange', e.target.value)
                  }
                  className="w-full border border-[#D6C7B7] rounded-lg p-2 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="this_quarter">This Quarter</option>
                  <option value="this_year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {filters.dateRange === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Start Date</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleFilterChange('startDate', e.target.value)
                      }
                      className="w-full border border-[#D6C7B7] rounded-lg p-2 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3D2C1D] mb-1">End Date</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleFilterChange('endDate', e.target.value)
                      }
                      className="w-full border border-[#D6C7B7] rounded-lg p-2 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Branch</label>
                <select
                  value={filters.branchId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    handleFilterChange('branchId', e.target.value)
                  }
                  className="w-full border border-[#D6C7B7] rounded-lg p-2 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                >
                  <option value="all">All Branches</option>
                  <option value="1">Main Branch</option>
                  <option value="2">Mall Branch</option>
                  <option value="3">Downtown Branch</option>
                </select>
              </div>

              {filters.reportType === 'inventory' && (
                <div>
                  <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                      handleFilterChange('category', e.target.value)
                    }
                    className="w-full border border-[#D6C7B7] rounded-lg p-2 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="coffee">Coffee</option>
                    <option value="pastry">Pastry</option>
                    <option value="equipment">Equipment</option>
                    <option value="supplies">Supplies</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Report Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
              <div className="flex items-center gap-3">
                <DollarSign className="text-green-600" size={24} />
                <div>
                  <p className="text-sm text-[#6F4E37]">Total Revenue</p>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
              <div className="flex items-center gap-3">
                <Coffee className="text-[#8C5A3A]" size={24} />
                <div>
                  <p className="text-sm text-[#6F4E37]">Total Orders</p>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm text-[#6F4E37]">Avg Order Value</p>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{formatCurrency(stats.averageOrderValue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
              <div className="flex items-center gap-3">
                <Package className="text-purple-600" size={24} />
                <div>
                  <p className="text-sm text-[#6F4E37]">Top Product</p>
                  <p className="text-lg font-bold text-[#3D2C1D]">{stats.topSellingProduct}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
              <div className="flex items-center gap-3">
                <Users className="text-orange-600" size={24} />
                <div>
                  <p className="text-sm text-[#6F4E37]">Best Branch</p>
                  <p className="text-lg font-bold text-[#3D2C1D]">{stats.bestPerformingBranch}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ NEW: Interactive Chart Section */}
          <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#3D2C1D] flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-[#8C5A3A]" />
                {filters.reportType === 'sales' ? 'Sales Analytics' : 
                 filters.reportType === 'inventory' ? 'Inventory Analytics' : 'Financial Analytics'}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded-lg transition-colors ${chartType === 'line' ? 'bg-[#8C5A3A] text-white' : 'text-[#8C5A3A] hover:bg-[#EAE1D5]'}`}
                >
                  <LineChart size={20} />
                </button>
                <button 
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg transition-colors ${chartType === 'bar' ? 'bg-[#8C5A3A] text-white' : 'text-[#8C5A3A] hover:bg-[#EAE1D5]'}`}
                >
                  <BarChart3 size={20} />
                </button>
                <button 
                  onClick={() => setChartType('pie')}
                  className={`p-2 rounded-lg transition-colors ${chartType === 'pie' ? 'bg-[#8C5A3A] text-white' : 'text-[#8C5A3A] hover:bg-[#EAE1D5]'}`}
                >
                  <PieChart size={20} />
                </button>
                <button 
                  onClick={() => setChartType('doughnut')}
                  className={`p-2 rounded-lg transition-colors ${chartType === 'doughnut' ? 'bg-[#8C5A3A] text-white' : 'text-[#8C5A3A] hover:bg-[#EAE1D5]'}`}
                >
                  <div className="w-5 h-5 border-2 border-current rounded-full relative">
                    <div className="absolute inset-2 border border-current rounded-full"></div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="h-80 bg-white rounded-xl p-4 border border-[#D6C7B7]">
              {renderChart()}
            </div>
          </div>

          {/* Report Data Table */}
          <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl shadow-lg border border-[#D6C7B7] overflow-hidden">
            <div className="p-6 border-b border-[#D6C7B7]">
              <h3 className="text-lg font-semibold text-[#3D2C1D] flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#8C5A3A]" />
                {filters.reportType === 'sales' ? 'Sales Report Data' : 
                 filters.reportType === 'inventory' ? 'Inventory Report Data' : 'Financial Report Data'}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              {filters.reportType === 'sales' && (
                <table className="w-full">
                  <thead className="bg-[#EAE1D5]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Total Sales</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Avg Order Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#FFFBF5] divide-y divide-[#D6C7B7]">
                    {salesReports.map((report: SalesReport, index: number) => (
                      <tr key={index} className="hover:bg-[#F5F0E6] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D2C1D]">
                          {formatDate(report.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6F4E37]">
                          {report.branch_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#3D2C1D]">
                          {formatCurrency(report.total_sales)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6F4E37]">
                          {report.total_orders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D2C1D]">
                          {formatCurrency(report.average_order_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {filters.reportType === 'inventory' && (
                <table className="w-full">
                  <thead className="bg-[#EAE1D5]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Current Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Sold</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#FFFBF5] divide-y divide-[#D6C7B7]">
                    {inventoryReports.map((report: InventoryReport, index: number) => (
                      <tr key={index} className="hover:bg-[#F5F0E6] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#3D2C1D]">
                          {report.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[#EAE1D5] text-[#3D2C1D]">
                            {report.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6F4E37]">
                          {report.branch_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D2C1D]">
                          {report.current_stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6F4E37]">
                          {report.sold_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(report.status)}`}>
                            {report.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {filters.reportType === 'financial' && (
                <table className="w-full">
                  <thead className="bg-[#EAE1D5]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Period</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">COGS</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Gross Profit</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Operating Exp.</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Net Profit</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Profit Margin</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#FFFBF5] divide-y divide-[#D6C7B7]">
                    {financialReports.map((report: FinancialReport, index: number) => (
                      <tr key={index} className="hover:bg-[#F5F0E6] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#3D2C1D]">
                          {report.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D2C1D]">
                          {formatCurrency(report.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6F4E37]">
                          {formatCurrency(report.cost_of_goods)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(report.gross_profit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6F4E37]">
                          {formatCurrency(report.operating_expenses)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                          {formatCurrency(report.net_profit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D2C1D] font-medium">
                          {report.profit_margin.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              {isLoading && (
                <div className="p-12 text-center text-[#6F4E37]">
                  <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-[#8C5A3A]" />
                  Loading report data...
                </div>
              )}
            </div>
            
            {/* Table Footer */}
            <div className="px-6 py-3 border-t border-[#D6C7B7] bg-[#F5F0E6]">
              <div className="flex justify-between items-center text-sm text-[#6F4E37]">
                <span>Total Records: {
                  filters.reportType === 'sales' ? salesReports.length :
                  filters.reportType === 'inventory' ? inventoryReports.length :
                  financialReports.length
                }</span>
                <span>Generated: {new Date().toLocaleString()}</span>
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

export default ReportsManagement;