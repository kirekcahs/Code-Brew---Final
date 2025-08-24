import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  X 
} from 'lucide-react';
import BranchIndicator from '../components/BranchIndicator';

interface Asset {
  asset_id: number;
  name: string;
  asset_code: string;
  category: string;
  location: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  purchase_cost: number;
  current_value: number;
  assigned_to: string;
  description: string;
  created_at: string;
}

const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [newAsset, setNewAsset] = useState({
    name: '',
    asset_code: '',
    category: 'Equipment',
    location: '',
    condition: 'Excellent' as Asset['condition'],
    purchase_cost: 0,
    current_value: 0,
    assigned_to: 'Unassigned',
    description: ''
  });

  // Fetch assets from API
  const fetchAssets = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/v1/assets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data);
        setFilteredAssets(data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Filter assets
  useEffect(() => {
    const filtered = assets.filter(asset => {
      const matchesSearch = asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.asset_code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchesCondition = selectedCondition === 'all' || asset.condition === selectedCondition;
      
      return matchesSearch && matchesCategory && matchesCondition;
    });

    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedCategory, selectedCondition]);

  // Create asset
  const handleCreateAsset = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/v1/assets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAsset),
      });

      if (response.ok) {
        await fetchAssets();
        setShowAddModal(false);
        // Reset form
        setNewAsset({
          name: '',
          asset_code: '',
          category: 'Equipment',
          location: '',
          condition: 'Excellent',
          purchase_cost: 0,
          current_value: 0,
          assigned_to: 'Unassigned',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };

  // Update asset
  const handleUpdateAsset = async () => {
    if (!editingAsset) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/v1/assets/${editingAsset.asset_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingAsset),
      });

      if (response.ok) {
        await fetchAssets();
        setShowEditModal(false);
        setEditingAsset(null);
      }
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  // Delete asset
  const handleDeleteAsset = async (assetId: number) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/v1/assets/${assetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchAssets();
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <div className="h-screen bg-[#F5F0E6] overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/*  Branch Indicator */}
          <BranchIndicator />
          
          {/* Header */}
          <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#3D2C1D] mb-2 flex items-center">
                  <Package className="h-8 w-8 text-[#8C5A3A] mr-3" />
                  Asset Management
                </h1>
                <p className="text-[#6F4E37]">Track and manage all CodeBrew assets across locations</p>
              </div>
              
              <div className="flex items-center gap-3">
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#8C5A3A] to-[#6F4E37] hover:from-[#6F4E37] hover:to-[#5A3D29] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  <Plus size={20} />
                  Add Asset
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#D6C7B7]">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37]" size={20} />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-[#D6C7B7] rounded-lg focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent bg-transparent text-[#3D2C1D]"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-[#D6C7B7] rounded-lg focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent bg-transparent text-[#3D2C1D]"
                >
                  <option value="all">All Categories</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Technology">Technology</option>
                  <option value="Vehicle">Vehicle</option>
                </select>

                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="px-4 py-2 border border-[#D6C7B7] rounded-lg focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent bg-transparent text-[#3D2C1D]"
                >
                  <option value="all">All Conditions</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>
          </div>

          {/*  Assets Table without fixed height */}
          <div className="bg-[#FFFBF5] backdrop-blur-sm rounded-2xl shadow-lg border border-[#D6C7B7]">
            <div className="px-6 py-4 border-b border-[#D6C7B7]">
              <h3 className="text-lg font-semibold text-[#3D2C1D]">Assets ({filteredAssets.length})</h3>
            </div>
            
            {/* Fixed height, now flows naturally */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#EAE1D5]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Condition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#3D2C1D] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#FFFBF5] divide-y divide-[#D6C7B7]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8C5A3A]"></div>
                          <span className="text-[#6F4E37]">Loading assets...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-[#D6C7B7] mb-4" />
                        <h4 className="text-lg font-medium text-[#3D2C1D] mb-2">No assets found</h4>
                        <p className="text-[#6F4E37]">
                          {assets.length === 0 
                            ? "No assets have been added yet. Start by adding your first asset."
                            : "No assets match your current filters. Try adjusting your search criteria."
                          }
                        </p>
                        {assets.length === 0 && (
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 bg-[#8C5A3A] text-white px-4 py-2 rounded-lg hover:bg-[#6F4E37] transition-colors"
                          >
                            <Plus className="inline-block mr-2" size={16} />
                            Add First Asset
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset.asset_id} className="hover:bg-[#F5F0E6] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-[#3D2C1D]">{asset.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-[#6F4E37] font-mono">{asset.asset_code}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[#EAE1D5] text-[#3D2C1D]">
                            {asset.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6F4E37]">
                          {asset.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(asset.condition)}`}>
                            {asset.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D2C1D]">
                          {formatCurrency(asset.current_value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6F4E37]">
                          {asset.assigned_to}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditingAsset(asset);
                                setShowEditModal(true);
                              }}
                              className="text-[#8C5A3A] hover:text-[#6F4E37] transition-colors p-1"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.asset_id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            {filteredAssets.length > 0 && (
              <div className="px-6 py-3 border-t border-[#D6C7B7] bg-[#F5F0E6]">
                <div className="flex justify-between items-center text-sm text-[#6F4E37]">
                  <span>
                    Displaying {filteredAssets.length} assets
                  </span>
                  <span>
                    Total value: {formatCurrency(filteredAssets.reduce((sum, asset) => sum + asset.current_value, 0))}
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
          <div className="bg-[#FFFBF5] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[#D6C7B7]">
              <h3 className="text-xl font-bold text-[#3D2C1D]">Add New Asset</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6F4E37] hover:text-[#3D2C1D] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Asset Name</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                  placeholder="Enter asset name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Asset Code</label>
                <input
                  type="text"
                  value={newAsset.asset_code}
                  onChange={(e) => setNewAsset({...newAsset, asset_code: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                  placeholder="Enter asset code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Category</label>
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                >
                  <option value="Equipment">Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Technology">Technology</option>
                  <option value="Vehicle">Vehicle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Location</label>
                <input
                  type="text"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Condition</label>
                <select
                  value={newAsset.condition}
                  onChange={(e) => setNewAsset({...newAsset, condition: e.target.value as Asset['condition']})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Purchase Cost</label>
                <input
                  type="number"
                  value={newAsset.purchase_cost}
                  onChange={(e) => setNewAsset({...newAsset, purchase_cost: Number(e.target.value)})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Current Value</label>
                <input
                  type="number"
                  value={newAsset.current_value}
                  onChange={(e) => setNewAsset({...newAsset, current_value: Number(e.target.value)})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Assigned To</label>
                <input
                  type="text"
                  value={newAsset.assigned_to}
                  onChange={(e) => setNewAsset({...newAsset, assigned_to: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                  placeholder="Enter assigned person"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Description</label>
                <textarea
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                  rows={3}
                  placeholder="Enter description"
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
                onClick={handleCreateAsset}
                className="px-6 py-2 bg-[#8C5A3A] text-white rounded-lg hover:bg-[#6F4E37] transition-colors"
              >
                Add Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {showEditModal && editingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFBF5] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[#D6C7B7]">
              <h3 className="text-xl font-bold text-[#3D2C1D]">Edit Asset</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAsset(null);
                }}
                className="text-[#6F4E37] hover:text-[#3D2C1D] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Asset Name</label>
                <input
                  type="text"
                  value={editingAsset.name}
                  onChange={(e) => setEditingAsset({...editingAsset, name: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Asset Code</label>
                <input
                  type="text"
                  value={editingAsset.asset_code}
                  onChange={(e) => setEditingAsset({...editingAsset, asset_code: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Category</label>
                <select
                  value={editingAsset.category}
                  onChange={(e) => setEditingAsset({...editingAsset, category: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                >
                  <option value="Equipment">Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Technology">Technology</option>
                  <option value="Vehicle">Vehicle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Location</label>
                <input
                  type="text"
                  value={editingAsset.location}
                  onChange={(e) => setEditingAsset({...editingAsset, location: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Condition</label>
                <select
                  value={editingAsset.condition}
                  onChange={(e) => setEditingAsset({...editingAsset, condition: e.target.value as Asset['condition']})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Purchase Cost</label>
                <input
                  type="number"
                  value={editingAsset.purchase_cost}
                  onChange={(e) => setEditingAsset({...editingAsset, purchase_cost: Number(e.target.value)})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Current Value</label>
                <input
                  type="number"
                  value={editingAsset.current_value}
                  onChange={(e) => setEditingAsset({...editingAsset, current_value: Number(e.target.value)})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Assigned To</label>
                <input
                  type="text"
                  value={editingAsset.assigned_to}
                  onChange={(e) => setEditingAsset({...editingAsset, assigned_to: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3D2C1D] mb-1">Description</label>
                <textarea
                  value={editingAsset.description}
                  onChange={(e) => setEditingAsset({...editingAsset, description: e.target.value})}
                  className="w-full border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-[#D6C7B7]">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAsset(null);
                }}
                className="px-4 py-2 text-[#6F4E37] border border-[#D6C7B7] rounded-lg hover:bg-[#F5F0E6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAsset}
                className="px-6 py-2 bg-[#8C5A3A] text-white rounded-lg hover:bg-[#6F4E37] transition-colors"
              >
                Update Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;
