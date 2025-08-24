/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Building2, Coffee } from 'lucide-react';
import { toast } from "react-toastify";

interface Branch {
  branch_id: number;
  branch_name: string;
  location_address: string;
  contact_details?: string;
  manager_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Role {
  role_id: number; // ✅ Backend returns number, not string
  role_name: string;
}

interface User {
  user_id: number;
  username: string;
  email?: string;
  password_hash: string;
  role_id: number;
  branch_id: number;
  is_active: boolean;
  created_at: string;
  role_name?: string;
  branch_name?: string;
}

interface NewUser {
  username: string;
  password: string;
  email: string;
  role_id: string;
}

interface NewBranch {
  branch_name: string;
  location_address: string;
  contact_number: string;    // We'll map this to contact_details
  manager_name: string;
}



const BranchManagement: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBranchSelectModal, setShowBranchSelectModal] = useState(false); // NEW
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [taxRate, setTaxRate] = useState<number>(12);

  const [newBranch, setNewBranch] = useState<NewBranch>({
    branch_name: '',
    location_address: '',
    contact_number: '',
    manager_name: ''
  });

  const [newUser, setNewUser] = useState<NewUser>({
    username: '',
    password: '',
    email: '',

    role_id: ''
  });

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserData, setEditUserData] = useState({
    username: '',
    email: '',
    role_id: '',
    password: '' // Optional - for password changes
  });

  // ✅ FIXED: Handle different response structures from your backend
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/v1/branches', {
        headers:
         {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Backend response:', data); // Debug log
        
        // ✅ Handle your backend's actual response structure
        if (Array.isArray(data)) {
          // Direct array response
          setBranches(data);
        } else if (data.branches) {
          // Wrapped in branches property
          setBranches(data.branches);
        } else if (data.data) {
          // Wrapped in data property
          setBranches(data.data);
        } else {
          // Fallback - empty array
          console.warn('Unexpected response structure:', data);
          setBranches([]);
        }
      } else {
        console.error('Failed to fetch branches:', response.status);
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        toast.error(errorData.message || 'Failed to load branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Network error loading branches');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users for selected branch
  const fetchUsers = async (branchId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/v1/users?branch_id=${branchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Users response:', data); // Debug log
        
        // ✅ Handle different response structures
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.users) {
          setUsers(data.users);
        } else if (data.data) {
          setUsers(data.data);
        } else {
          setUsers([]);
        }
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/v1/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Roles response:', data); // Debug log
        
        // ✅ Handle different response structures
        if (Array.isArray(data)) {
          setRoles(data);
        } else if (data.roles) {
          setRoles(data.roles);
        } else if (data.data) {
          setRoles(data.data);
        } else {
          setRoles([]);
        }
      } else {
        console.error('Failed to fetch roles:', response.status);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Error fetching roles');
    }
  };

  // ✅ IMPROVED: Create branch with address field mapping
  const createBranch = async () => {
    if (!newBranch.branch_name || !newBranch.location_address) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // ✅ Map to backend field names
      const branchData = {
        branch_name: newBranch.branch_name,
        location_address: newBranch.location_address,
        contact_details: newBranch.contact_number,
        manager_name: newBranch.manager_name
      };

      console.log('Sending branch data:', branchData);

      const response = await fetch('http://localhost:3000/api/v1/branches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Create branch response:', data);
        
        toast.success('Branch created successfully');
        setShowAddModal(false);
        setNewBranch({
          branch_name: '',
          location_address: '',
          contact_number: '',
          manager_name: ''
        });
        fetchBranches();
      } else {
        const errorData = await response.json();
        console.error('Create branch error:', errorData);
        toast.error(errorData.message || 'Failed to create branch');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      toast.error('Error creating branch');
    }
  };

  // Create user
  const createUser = async () => {
    if (!selectedBranch) {
      toast.error('Please select a branch first');
      return;
    }

    if (!newUser.username || !newUser.password || !newUser.role_id) {
      toast.error('Please fill in all required fields (username, password, role)');
      return;
    }

    if (newUser.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // ✅ FIXED: Ensure proper data types and validation
      const userData = {
        username: newUser.username.trim(),
        password: newUser.password,
        email: newUser.email.trim() || null,
        role_id: parseInt(newUser.role_id), // Ensure it's a number
        branch_id: parseInt(selectedBranch)  // Ensure it's a number
      };

      console.log('🔵 Sending user data:', userData);
      console.log('🔵 Selected branch:', selectedBranch);
      console.log('🔵 Available roles:', roles);

      const response = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('🔵 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User created successfully:', data);
        toast.success('User created successfully');
        
        // Reset form
        setNewUser({
          username: '',
          password: '',
          email: '',
          role_id: ''
        });
        
        // ✅ FIXED: Force refresh users list
        await fetchUsers(selectedBranch);
      } else {
        // ✅ IMPROVED: Better error handling
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Create user error:', errorData);
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map((err: { msg: any; message: any; }) => err.msg || err.message).join(', ');
          toast.error(`Validation errors: ${errorMessages}`);
        } else {
          toast.error(errorData.message || 'Failed to create user');
        }
      }
    } catch (error) {
      console.error('❌ Network error creating user:', error);
      toast.error('Network error creating user');
    }
  };

  // Add this function after createBranch function
  const updateBranch = async () => {
    if (!editingBranch || !newBranch.branch_name || !newBranch.location_address) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // ✅ FIXED: Use correct field names that match your backend
      const branchData = {
        branch_name: newBranch.branch_name,
        location_address: newBranch.location_address, // ✅ Fixed
        contact_details: newBranch.contact_number,    // ✅ Fixed
        manager_name: newBranch.manager_name,
        is_active: true // Add this if required
      };

      console.log('Updating branch with data:', branchData);

      const response = await fetch(`http://localhost:3000/api/v1/branches/${editingBranch.branch_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchData),
      });

      if (response.ok) {
        toast.success('Branch updated successfully');
        setShowEditModal(false);
        setEditingBranch(null);
        setNewBranch({
          branch_name: '',
          location_address: '',
          contact_number: '',
          manager_name: ''
        });
        fetchBranches();
      } else {
        const errorData = await response.json();
        console.error('Update branch error:', errorData);
        toast.error(errorData.message || 'Failed to update branch');
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      toast.error('Error updating branch');
    }
  };

  // Add this function to update user:
  const updateUser = async () => {
    if (!editingUser) return;

    if (!editUserData.username || !editUserData.role_id) {
      toast.error('Username and role are required');
      return;
    }

    if (editUserData.password && editUserData.password.length < 3) {
      toast.error('Password must be at least 3 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // Prepare update data - only include password if it's provided
      const updateData: any = {
        username: editUserData.username.trim(),
        email: editUserData.email.trim() || null,
        role_id: parseInt(editUserData.role_id),
        branch_id: parseInt(selectedBranch),
        is_active: editingUser.is_active
      };

      // Only include password if user wants to change it
      if (editUserData.password.trim()) {
        updateData.password = editUserData.password;
      }

      console.log('🔵 Updating user with data:', updateData);

      const response = await fetch(`http://localhost:3000/api/v1/users/${editingUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ User updated successfully:', data);
        toast.success('User updated successfully');
        
        // Close modal and refresh users
        setShowEditUserModal(false);
        setEditingUser(null);
        setEditUserData({ username: '', email: '', role_id: '', password: '' });
        fetchUsers(selectedBranch);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Update user error:', errorData);
        toast.error(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('❌ Network error updating user:', error);
      toast.error('Network error updating user');
    }
  };

  // Handle input changes
  const handleBranchInputChange = (field: keyof NewBranch, value: string) => {
    setNewBranch(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserInputChange = (field: keyof NewUser, value: string) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add handler for edit user input changes:
  const handleEditUserInputChange = (field: string, value: string) => {
    setEditUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Modal handlers
  const openCreateModal = () => {
    setShowAddModal(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setNewBranch({
      branch_name: branch.branch_name,
      location_address: branch.location_address,
      contact_number: branch.contact_details || '',
      manager_name: branch.manager_name || ''
    });
    setShowEditModal(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setEditUserData({
      username: user.username,
      email: user.email || '',
      role_id: user.role_id.toString(),
      password: '' // Leave empty - only update if user wants to change
    });
    setShowEditUserModal(true);
  };

  // ✅ IMPROVED: Branch selection with navigation guidance
  const handleBranchSelection = (branchId: number) => {
    setSelectedBranch(branchId.toString());
    localStorage.setItem('selectedBranch', branchId.toString());
    
    // ✅ FIXED: Update user data with selected branch information
    const selectedBranchData = branches.find(b => b.branch_id === branchId);
    if (selectedBranchData) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUserData = {
        ...userData,
        selected_branch_id: branchId,
        selected_branch_name: selectedBranchData.branch_name,
        selected_branch_address: selectedBranchData.location_address
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      // ✅ Force update components that depend on user data
      window.dispatchEvent(new Event('storage'));
    }
    
    setShowBranchSelectModal(false);
    toast.success(`✅ Selected ${selectedBranchData?.branch_name} - Now you can access Dashboard, Inventory, Assets & Reports`);
  };

  // Toggle user active status
  const toggleUserActive = async (user: User) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/v1/users/${user.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          is_active: !user.is_active
        }),
      });

      if (response.ok) {
        toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
        fetchUsers(selectedBranch);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    }
  };

  // Deactivate branch
  const deactivateBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to deactivate this branch?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/v1/branches/${branchId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: false }),
      });

      if (response.ok) {
        toast.success('Branch deactivated');
        fetchBranches();
      }
    } catch (error) {
      console.error('Error deactivating branch:', error);
      toast.error('Error deactivating branch');
    }
  };

  // Save tax rate
  const saveTaxRate = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/v1/config/settings', { // <-- Correct endpoint!
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tax_rate: taxRate }),
      });

      if (response.ok) {
        toast.success('Tax rate saved');
      } else {
        toast.error('Failed to save tax rate');
      }
    } catch (error) {
      console.error('Error saving tax rate:', error);
      toast.error('Error saving tax rate');
    }
  };

  // Debug user creation data
  const debugUserCreation = () => {
    console.log('🔍 Debug Info:');
    console.log('Selected Branch:', selectedBranch);
    console.log('New User Data:', newUser);
    console.log('Available Roles:', roles);
    console.log('Token exists:', !!localStorage.getItem('accessToken'));
    
    // Check if role_id is valid
    const selectedRole = roles.find(r => r.role_id.toString() === newUser.role_id);
    console.log('Selected Role:', selectedRole);
};

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('No authentication token found. Please log in again.');
      // Redirect to login or handle as needed
      return;
    }
    
    // Log the token to debug (remove in production)
    console.log('Using token:', token);
    
    // Check if branch is already selected
    const storedBranch = localStorage.getItem('selectedBranch');
    if (storedBranch && storedBranch !== 'null' && storedBranch !== 'undefined') {
      setSelectedBranch(storedBranch);
    }
    
    fetchBranches();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchUsers(selectedBranch);
    }
  }, [selectedBranch]);

  // ✅ FIXED: Update branches state and preserve selection
  useEffect(() => {
    if (branches.length > 0 && selectedBranch) {
      // Ensure the selected branch data is updated in localStorage
      const selectedBranchData = branches.find(b => b.branch_id === parseInt(selectedBranch));
      if (selectedBranchData) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUserData = {
          ...userData,
          selected_branch_id: parseInt(selectedBranch),
          selected_branch_name: selectedBranchData.branch_name,
          selected_branch_address: selectedBranchData.location_address
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
      }
    }
  }, [branches, selectedBranch]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#F5F0E6] p-6 flex items-center justify-center">
        <div className="text-[#3D2C1D] text-xl">Loading branches...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F5F0E6] p-6 overflow-y-auto">
      {/* Welcome Message */}
      {!selectedBranch && (
        <div className="bg-gradient-to-r from-[#8C5A3A] to-[#6F4E37] text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Coffee className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome, Admin! ☕</h2>
              <p className="text-white/90 mt-1">
                Click "Select Branch" to start managing your coffee shop operations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2C1D] flex items-center gap-3">
            <Building2 className="h-8 w-8 text-[#8C5A3A]" />
            Branch Management
          </h1>
          <p className="text-[#6F4E37] mt-2">
            {!selectedBranch 
              ? "Click 'Select Branch' to get started" 
              : `Managing: ${branches.find(b => b.branch_id === parseInt(selectedBranch))?.branch_name}`
            }
          </p>
        </div>
        <div className="flex gap-3">
          {/* SELECT BRANCH BUTTON */}
          <button
            onClick={() => setShowBranchSelectModal(true)}
            className="flex items-center gap-2 bg-[#8C5A3A] text-white px-6 py-3 rounded-lg hover:bg-[#6F4E37] transition"
          >
            <Building2 size={20} />
            {selectedBranch ? 'Change Branch' : 'Select Branch'}
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <Plus size={20} />
            Add New Branch
          </button>
        </div>
      </div>

      {/* Content shown when branch is selected */}
      {selectedBranch ? (
        <>
          {/* Success Message */}
          <div className="bg-[#D4EDDA] border border-[#C3E6CB] p-4 rounded-lg mb-6">
            <p className="text-[#155724] flex items-center gap-2">
            You can now navigate to Dashboard, Inventory, Assets, or Reports.
            </p>
          </div>

          {/* User Management */}
          <div className="bg-[#FFFBF5] p-6 rounded-lg shadow-md mb-8 border border-[#D6C7B7]">
            <h2 className="text-xl font-bold mb-4 text-[#3D2C1D]">
              👥 Users for: {branches.find(b => b.branch_id === parseInt(selectedBranch))?.branch_name}
            </h2>
            
            {/* Create User Form */}
            <div className="bg-white p-4 rounded-lg border border-[#E5D5C8] mb-4">
              <h3 className="text-lg font-semibold text-[#3D2C1D] mb-3">Create New User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <input
                  placeholder="Username *"
                  value={newUser.username}
                  onChange={(e) => handleUserInputChange('username', e.target.value)}
                  className="border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A]"
                />
                <input
                  placeholder="Password *"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => handleUserInputChange('password', e.target.value)}
                  className="border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A]"
                />
                <select
                  value={newUser.role_id}
                  onChange={(e) => handleUserInputChange('role_id', e.target.value)}
                  className="border border-[#D6C7B7] rounded-md p-3 bg-white text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A]"
                >
                  <option value="">Select Role *</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleUserInputChange('email', e.target.value)}
                  className="border border-[#D6C7B7] rounded-md p-3 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A]"
                />
                
              </div>
              <button
                onClick={() => {
                    debugUserCreation();
                    createUser();
                }}
                className="bg-[#8C5A3A] text-white px-6 py-2 rounded-lg hover:bg-[#6F4E37] transition flex items-center gap-2"
              >
                <Plus size={16} />
                Add User
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-[#D6C7B7] text-[#3D2C1D]">
                <thead className="bg-[#8C5A3A] text-white">
                  <tr>
                    <th className="p-3 text-left">Username</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500"> {/* ✅ Changed colSpan to 5 */}
                        <div className="flex flex-col items-center">
                          <div className="text-4xl mb-2">👤</div>
                          <div>No users found for this branch</div>
                          <div className="text-sm mt-1">Create your first user above</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.user_id} className="border-t border-[#D6C7B7] hover:bg-[#FFFBF5]">
                        <td className="p-3 font-medium">{user.username}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-[#F5F0E6] text-[#8C5A3A] rounded-full text-sm font-medium">
                            {roles.find(r => r.role_id === user.role_id)?.role_name || "N/A"}
                          </span>
                        </td>
                        <td className="p-3">{user.email || "N/A"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditUserModal(user)}
                              className="text-[#8C5A3A] hover:text-[#6F4E37] transition-colors p-1"
                              title="Edit User"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => toggleUserActive(user)}
                              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                                user.is_active
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {user.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-[#FFFBF5] p-6 rounded-lg shadow-md border border-[#D6C7B7]">
            <h2 className="text-xl font-bold mb-4 text-[#3D2C1D]">⚙️ System Settings</h2>
            <div className="flex items-center gap-4">
              <label className="text-[#6F4E37] font-semibold">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="border border-[#D6C7B7] rounded-md p-2 w-24 bg-transparent text-[#3D2C1D] focus:ring-2 focus:ring-[#8C5A3A]"
              />
              <button
                onClick={saveTaxRate}
                className="bg-[#8C5A3A] text-white px-4 py-2 rounded-lg hover:bg-[#6F4E37] transition"
              >
                Save
              </button>
            </div>
          </div>

          {/* Branch List with Edit Options */}
          <div className="bg-[#FFFBF5] p-6 rounded-lg shadow-md mb-8 border border-[#D6C7B7]">
            <h2 className="text-xl font-bold mb-4 text-[#3D2C1D]">🏢 All Branches</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-[#D6C7B7] text-[#3D2C1D]">
                <thead className="bg-[#EAE1D5]">
                  <tr>
                    <th className="p-3 text-left">Branch Name</th>
                    <th className="p-3 text-left">Address</th>
                    <th className="p-3 text-left">Contact</th>
                    <th className="p-3 text-left">Manager</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr key={branch.branch_id} className="border-t border-[#D6C7B7] hover:bg-[#FFFBF5]">
                      <td className="p-3 font-medium">{branch.branch_name}</td>
                      <td className="p-3">{branch.location_address}</td> {/* ✅ Fixed */}
                      <td className="p-3">{branch.contact_details || 'N/A'}</td>
                      <td className="p-3">{branch.manager_name || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          branch.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {branch.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(branch)}
                            className="text-[#8C5A3A] hover:text-[#6F4E37] transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          {branch.is_active && (
                            <button
                              onClick={() => deactivateBranch(branch.branch_id.toString())}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-[#E5D5C8] text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-2xl font-bold text-[#3D2C1D] mb-2">No Branch Selected</h3>
          <p className="text-[#6F4E37] text-lg mb-6">Click "Select Branch" above to get started</p>
          <button
            onClick={() => setShowBranchSelectModal(true)}
            className="bg-[#8C5A3A] text-white px-8 py-3 rounded-lg hover:bg-[#6F4E37] transition text-lg"
          >
            Select Branch Now
          </button>
        </div>
      )}

      {/* BRANCH SELECT MODAL */}
      {showBranchSelectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#3D2C1D]">🏢 Select Branch to Manage</h3>
              <button
                onClick={() => setShowBranchSelectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Branch Selection Modal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">No branches available</p>
                  <p className="text-sm text-gray-400">Create a branch first</p>
                </div>
              ) : (
                branches.map((branch) => (
                  <button
                    key={branch.branch_id}
                    onClick={() => handleBranchSelection(branch.branch_id)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#8C5A3A] hover:bg-[#FFFBF5] transition-all text-left"
                  >
                    <h4 className="font-bold text-lg text-[#3D2C1D] mb-2">{branch.branch_name}</h4>
                    <p className="text-[#6F4E37] text-sm mb-1">📍 {branch.location_address}</p>
                    <p className="text-[#6F4E37] text-sm mb-1">📞 {branch.contact_details || 'No contact'}</p>
                    <p className="text-[#6F4E37] text-sm">👨‍💼 {branch.manager_name || 'No manager'}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#3D2C1D]">Add New Branch</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                placeholder="Branch Name"
                value={newBranch.branch_name}
                onChange={(e) => handleBranchInputChange('branch_name', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
              <input
                placeholder="Location Address"
                value={newBranch.location_address}
                onChange={(e) => handleBranchInputChange('location_address', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
              <input
                placeholder="Contact Number"
                value={newBranch.contact_number}
                onChange={(e) => handleBranchInputChange('contact_number', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
              <input
                placeholder="Manager Name"
                value={newBranch.manager_name}
                onChange={(e) => handleBranchInputChange('manager_name', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createBranch}
                className="px-4 py-2 bg-[#8C5A3A] text-white rounded-lg hover:bg-[#6F4E37]"
              >
                Create Branch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditModal && editingBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#3D2C1D]">Edit Branch</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBranch(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                placeholder="Branch Name"
                value={newBranch.branch_name}
                onChange={(e) => handleBranchInputChange('branch_name', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
              <input
                placeholder="Location Address"
                value={newBranch.location_address}
                onChange={(e) => handleBranchInputChange('location_address', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
              <input
                placeholder="Contact Number"
                value={newBranch.contact_number}
                onChange={(e) => handleBranchInputChange('contact_number', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
              <input
                placeholder="Manager Name"
                value={newBranch.manager_name}
                onChange={(e) => handleBranchInputChange('manager_name', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBranch(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={updateBranch}
                className="px-4 py-2 bg-[#8C5A3A] text-white rounded-lg hover:bg-[#6F4E37]"
              >
                Update Branch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#3D2C1D]">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                placeholder="Username *"
                value={editUserData.username}
                onChange={(e) => handleEditUserInputChange('username', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
              <input
                placeholder="Email"
                type="email"
                value={editUserData.email}
                onChange={(e) => handleEditUserInputChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
              <select
                value={editUserData.role_id}
                onChange={(e) => handleEditUserInputChange('role_id', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 bg-white"
              >
                <option value="">Select Role *</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
              <input
                placeholder="New Password (leave empty to keep current)"
                type="password"
                value={editUserData.password}
                onChange={(e) => handleEditUserInputChange('password', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3"
              />
              <div className="text-sm text-gray-600">
                💡 Leave password empty if you don't want to change it
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={updateUser}
                className="px-4 py-2 bg-[#8C5A3A] text-white rounded-lg hover:bg-[#6F4E37]"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  )
}
export default BranchManagement;