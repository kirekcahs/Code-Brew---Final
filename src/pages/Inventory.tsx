/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  Download,
  Coffee,
  X,
  RefreshCw
} from 'lucide-react';
import BranchIndicator from '../components/BranchIndicator';

interface InventoryItem {
  inventory_id: number;
  product_name: string;
  sku: string;
  category: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  unit_cost?: number;
  selling_price?: number;
  branch_id: number;
  branch_name: string;
  supplier?: string;
  last_updated: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

interface StockStatus {
  text: string;
  color: string;
}

interface NewInventoryItem {
  product_id: number;
  quantity: number;
  min_stock: number;
  max_stock: number;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<NewInventoryItem>({
    product_id: 0,
    quantity: 0,
    min_stock: 0,
    max_stock: 0
  });

  // ✅ ADD: Check for branch selection
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const selectedBranchId = localStorage.getItem('selectedBranch');
    
    if (userData.role_name === 'Admin' && (!selectedBranchId || selectedBranchId === 'null')) {
      console.log('⚠️ Admin needs to select a branch first');
      return;
    }
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [selectedBranch, selectedCategory]);

  // ✅ Debug logging for inventory state changes
  useEffect(() => {
    console.log('🟡 Inventory state updated:', inventory.length, 'items');
    if (inventory.length > 0) {
      console.log('🟡 Sample inventory item:', inventory[0]);
    }
  }, [inventory]);

  const fetchInitialData = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const [branchesRes, productsRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/branches', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/v1/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (branchesRes.ok) {
        const branchData = await branchesRes.json();
        setBranches(branchData);
      }

      if (productsRes.ok) {
        const productData = await productsRes.json();
        setProducts(productData);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchInventory = async (): Promise<void> => {
    console.log('🔵 fetchInventory called');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      
      if (selectedBranch !== 'all') params.append('branch_id', selectedBranch);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const url = `http://localhost:3000/api/v1/inventory?${params}`;
      console.log('🔵 API URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔵 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🟢 Raw API response:', data);
        
        const inventoryData = data.inventory || data;
        console.log('🟢 Processed inventory data:', inventoryData);
        console.log('🟢 Number of items:', inventoryData.length);
        
        setInventory(inventoryData);
        
        // Calculate stats
        setStats({
          totalItems: inventoryData.length,
          totalValue: inventoryData.reduce((total: number, item: InventoryItem) => 
            total + (item.quantity * (item.unit_cost || 0)), 0),
          lowStockItems: inventoryData.filter((item: InventoryItem) => 
            item.status === 'Low Stock').length,
          outOfStockItems: inventoryData.filter((item: InventoryItem) => 
            item.status === 'Out of Stock').length
        });
        
        console.log('🟢 Stats calculated successfully');
      } else {
        console.error('❌ API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      console.log('🔵 fetchInventory completed');
      setIsLoading(false);
    }
  };

  const filteredInventory = inventory.filter((item: InventoryItem) =>
    (item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ✅ Debug filtered inventory
  useEffect(() => {
    console.log('🟡 Filtered inventory updated:', filteredInventory.length, 'items');
  }, [filteredInventory]);

  const getStockStatus = (status: string): StockStatus => {
    switch (status) {
      case 'Out of Stock':
        return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
      case 'Low Stock':
        return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
      default:
        return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddInventory = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const branchId = localStorage.getItem('selectedBranch') || userData.branch_id;
      
      const response = await fetch('http://localhost:3000/api/v1/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newItem,
          branch_id: parseInt(branchId)
        })
      });
      
      if (response.ok) {
        await fetchInventory();
        setShowAddModal(false);
        resetNewItem();
        alert('Inventory added successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add inventory'}`);
      }
    } catch (error) {
      console.error('Error adding inventory:', error);
      alert('Failed to add inventory');
    }
  };

  const handleUpdateInventory = async (): Promise<void> => {
    if (!editingItem) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:3000/api/v1/inventory/${editingItem.inventory_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: editingItem.quantity,
          min_stock: editingItem.min_stock,
          max_stock: editingItem.max_stock
        })
      });
      
      if (response.ok) {
        await fetchInventory();
        setShowEditModal(false);
        setEditingItem(null);
        alert('Inventory updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to update inventory'}`);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory');
    }
  };

  const handleDeleteInventory = async (inventoryId: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:3000/api/v1/inventory/${inventoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchInventory();
        alert('Inventory deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to delete inventory'}`);
      }
    } catch (error) {
      console.error('Error deleting inventory:', error);
      alert('Failed to delete inventory');
    }
  };

  const resetNewItem = (): void => {
    setNewItem({
      product_id: 0,
      quantity: 0,
      min_stock: 0,
      max_stock: 0
    });
  };

  const exportInventory = (): void => {
    const csvContent = [
      ['Product Name', 'SKU', 'Branch', 'Category', 'Quantity', 'Min Stock', 'Max Stock', 'Status'],
      ...filteredInventory.map((item: InventoryItem) => [
        item.product_name,
        item.sku,
        item.branch_name,
        item.category,
        item.quantity.toString(),
        item.min_stock.toString(),
        item.max_stock.toString(),
        item.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ✅ ADD: Early return if no branch selected
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const selectedBranchId = localStorage.getItem('selectedBranch');

  if (userData.role_name === 'Admin' && (!selectedBranchId || selectedBranchId === 'null')) {
    return (
      <div className="h-screen bg-[#F5F0E6] overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* ✅ ADD: Branch Indicator */}
          <BranchIndicator />
          
          {/* Header */}
          <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#3D2C1D] mb-2 flex items-center">
                  <Package className="h-8 w-8 text-[#8C5A3A] mr-3" />
                  Inventory Management
                </h1>
                <p className="text-[#6F4E37]">Track and manage stock levels across all CodeBrew locations</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchInventory}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw size={20} />
                  Refresh
                </button>
                <button
                  onClick={exportInventory}
                  className="flex items-center gap-2 bg-[#6F4E37] hover:bg-[#5A3D29] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Download size={20} />
                  Export
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#8C5A3A] to-[#6F4E37] hover:from-[#6F4E37] hover:to-[#5A3D29] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  <Plus size={20} />
                  Add to Inventory
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
              <div className="flex items-center gap-3">
                <Package className="text-[#8C5A3A]" size={24} />
                <div>
                  <p className="text-sm text-[#6F4E37]">Total Items</p>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{stats.totalItems}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-yellow-600" size={24} />
                <div>
                  <p className="text-sm text-[#6F4E37]">Low Stock Items</p>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{stats.lowStockItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-600" size={24} />
                <div>
                  <p className="text-sm text-[#6F4E37]">Out of Stock</p>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{stats.outOfStockItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
              <div className="flex items-center gap-3">
                <Coffee className="text-green-600" size={24} />
                <div>
                  <p className="text-sm text-[#6F4E37]">Total Value</p>
                  <p className="text-2xl font-bold text-[#3D2C1D]">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37]" size={20} />
                <input
                  type="text"
                  placeholder="Search products or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-[#D6C7B7] rounded-lg focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent bg-transparent text-[#3D2C1D]"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-4 py-2 border border-[#D6C7B7] rounded-lg focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent bg-transparent text-[#3D2C1D]"
                >
                  <option value="all">All Branches</option>
                  {branches.map((branch: any) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-[#D6C7B7] rounded-lg focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent bg-transparent text-[#3D2C1D]"
                >
                  <option value="all">All Categories</option>
                  <option value="coffee">Coffee</option>
                  <option value="bread">Bread</option>
                  <option value="cookies">Cookies</option>
                </select>
              </div>
            </div>
          </div>

          {/* ✅ UPDATED: Regular table without fixed height */}
          <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl shadow-lg border border-[#D6C7B7]">
            <div className="px-6 py-4 border-b border-[#D6C7B7] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-[#3D2C1D]">Inventory Items</h3>
                <p className="text-sm text-[#6F4E37]">
                  Showing {filteredInventory.length} of {inventory.length} items
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#EAE1D5]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">
                      Min/Max
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#FFFBF5] divide-y divide-[#D6C7B7]">
                  {filteredInventory.map((item: InventoryItem) => {
                    const status = getStockStatus(item.status);
                    return (
                      <tr 
                        key={item.inventory_id} 
                        className="hover:bg-[#F5F0E6] transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-[#3D2C1D] text-sm">
                            {item.product_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-[#6F4E37] font-mono">
                            {item.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-[#6F4E37]">
                            {item.branch_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[#EAE1D5] text-[#3D2C1D]">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-[#3D2C1D] font-semibold">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs text-[#6F4E37]">
                            {item.min_stock} / {item.max_stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs text-[#6F4E37]">
                            {formatDate(item.last_updated)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => {
                                setEditingItem(item);
                                setShowEditModal(true);
                              }}
                              className="text-[#8C5A3A] hover:text-[#6F4E37] transition-colors p-1"
                              title="Edit inventory"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteInventory(item.inventory_id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1"
                              title="Delete inventory"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            {filteredInventory.length > 0 && (
              <div className="px-6 py-3 border-t border-[#D6C7B7] bg-[#F5F0E6]">
                <div className="flex justify-between items-center text-sm text-[#6F4E37]">
                  <span>
                    Displaying {filteredInventory.length} items
                  </span>
                  <span>
                    Total inventory value: {formatCurrency(stats.totalValue)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Add bottom padding for better scrolling */}
          <div className="h-8"></div>
        </div>
      </div>

      {/* Modals remain outside the scrollable area */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFBF5] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[#D6C7B7]">
              <h3 className="text-xl font-bold text-[#3D2C1D]">Add to Inventory</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6F4E37] hover:text-[#3D2C1D] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Product</label>
                <select
                  value={newItem.product_id}
                  onChange={(e) => setNewItem(prev => ({...prev, product_id: parseInt(e.target.value)}))}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                >
                  <option value={0}>Select Product</option>
                  {products.map((product: any) => (
                    <option key={product.product_id} value={product.product_id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({...prev, quantity: parseInt(e.target.value) || 0}))}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Min Stock Level</label>
                <input
                  type="number"
                  value={newItem.min_stock}
                  onChange={(e) => setNewItem(prev => ({...prev, min_stock: parseInt(e.target.value) || 0}))}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Max Stock Level</label>
                <input
                  type="number"
                  value={newItem.max_stock}
                  onChange={(e) => setNewItem(prev => ({...prev, max_stock: parseInt(e.target.value) || 0}))}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-[#D6C7B7]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-[#6F4E37] border border-[#D6C7B7] rounded-lg hover:bg-[#F5F0E6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInventory}
                className="px-6 py-2 bg-[#8C5A3A] text-white rounded-lg hover:bg-[#6F4E37] transition-colors"
              >
                Add to Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFBF5] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[#D6C7B7]">
              <h3 className="text-xl font-bold text-[#3D2C1D]">Edit Inventory</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#6F4E37] hover:text-[#3D2C1D] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingItem.product_name}
                  disabled
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-gray-100 text-[#3D2C1D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Quantity</label>
                <input
                  type="number"
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem(prev => prev ? {...prev, quantity: parseInt(e.target.value) || 0} : null)}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Min Stock Level</label>
                <input
                  type="number"
                  value={editingItem.min_stock}
                  onChange={(e) => setEditingItem(prev => prev ? {...prev, min_stock: parseInt(e.target.value) || 0} : null)}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Max Stock Level</label>
                <input
                  type="number"
                  value={editingItem.max_stock}
                  onChange={(e) => setEditingItem(prev => prev ? {...prev, max_stock: parseInt(e.target.value) || 0} : null)}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-[#D6C7B7]">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-[#6F4E37] border border-[#D6C7B7] rounded-lg hover:bg-[#F5F0E6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateInventory}
                className="px-6 py-2 bg-[#8C5A3A] text-white rounded-lg hover:bg-[#6F4E37] transition-colors"
              >
                Update Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;