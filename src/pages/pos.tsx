/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiSearch, FiPlus, FiMinus, FiPrinter, FiLogOut, FiX, FiBarChart2 } from "react-icons/fi";
import { FaMoneyBillWave, FaCreditCard, FaQrcode, FaUtensils, FaCoffee, FaBreadSlice, FaTrash } from "react-icons/fa";

interface Product {
  product_id: number;
  name: string;
  sku: string;
  category: string;
  unit_cost: number;
  id: number;
  price: number;
  image?: string;
  description?: string;
}

interface CartItem {
  product_id: number;
  name: string;
  sku: string;
  category: string;
  unit_cost: number;
  id: number;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: "Cash" | "Card" | "Digital";
  date: string;
}

const Pos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate] = useState(0.12);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "Digital">("Cash");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<Sale | null>(null);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [showSalesReportModal, setShowSalesReportModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userData, setUserData] = useState<any>({});
  
  const receiptRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: "All Menu", icon: <FaUtensils size={24} /> },
    { name: "coffee", icon: <FaCoffee size={24} /> },
    { name: "bread", icon: <FaBreadSlice size={24} /> },
  ];

  useEffect(() => {
    console.log('🔍 POS Debug Info:');
    console.log('- User data:', localStorage.getItem('user'));
    console.log('- Selected branch:', localStorage.getItem('selectedBranch'));
    console.log('- Token exists:', !!localStorage.getItem('accessToken'));
    
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        setUserData(user);
        
        console.log('🔵 POS initialized for user:', user.username);
        console.log('🔵 User assigned branch:', user.branch_name, '(ID:', user.branch_id, ')');
        
        // ✅ FIXED: Set selectedBranch to user's assigned branch
        if (user.branch_id) {
          localStorage.setItem('selectedBranch', user.branch_id.toString());
          console.log('✅ Set selectedBranch to user assigned branch:', user.branch_id);
        }
        
        fetchProducts();
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.error('No user data found, redirecting to login');
      window.location.href = '/login';
    }
  }, []);

  const fetchProducts = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:3000/api/v1/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw products data:', data);
      
      const mappedProducts = data.map((item: any) => ({
        product_id: item.product_id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        unit_cost: parseFloat(item.unit_cost) || 0,
        id: item.product_id,
        price: parseFloat(item.unit_cost) || 0,
        image: item.image_url || `https://via.placeholder.com/200x150/8C5A3A/ffffff?text=${encodeURIComponent(item.name)}`,
        description: item.description || `Delicious ${item.name}`
      }));
      
      console.log('Mapped products:', mappedProducts);
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products from database. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const getProductCount = (categoryName: string) => {
    if (categoryName === "All Menu") {
      return products.length;
    }
    return products.filter(p => p.category.toLowerCase() === categoryName.toLowerCase()).length;
  };

  const filteredProducts = products
    .filter((product) =>
      selectedCategory === "All Menu" ? true : product.category.toLowerCase() === selectedCategory.toLowerCase()
    )
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.price || item.unit_cost || 0;
      return sum + (itemPrice * item.quantity);
    }, 0);
  }, [cart]);

  const tax = useMemo(() => subtotal * taxRate, [subtotal, taxRate]);
  const total = useMemo(() => subtotal + tax - discount, [subtotal, tax, discount]);

  // ✅ FIXED: Helper functions for proper calculations
  const getSubtotal = () => subtotal;
  const getTax = () => tax;
  const getTotalWithTax = () => total;

  const addToCart = (product: Product, quantity: number) => {
    if (!product) return;
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      
      return [...prevCart, { 
        ...product, 
        quantity,
        id: product.id || product.product_id,
        price: product.price || product.unit_cost || 0
      }];
    });
  };

  const updateQuantity = (productId: number, amount: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + amount } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };


  const handleAddToCartFromModal = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, modalQuantity);
      setShowProductModal(false);
    }
  };

  const handleProcessOrder = () => {
    if (cart.length > 0) {
      setShowPaymentModal(true);
    }
  };

  // ✅ FIXED: Single payment handler with proper error handling
  const handlePayment = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const branchId = localStorage.getItem('selectedBranch') || userData.branch_id;
      
      if (!branchId) {
        throw new Error('No branch selected');
      }
      
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          unit_price: item.price || item.unit_cost || 0
        })),
        total_amount: parseFloat(total.toFixed(2)),
        payment_method: paymentMethod,
        discount_amount: parseFloat(discount.toFixed(2)),
        tax_amount: parseFloat(tax.toFixed(2)),
        branch_id: parseInt(branchId.toString())
      };

      console.log('Submitting order:', orderData);

      const response = await fetch('http://localhost:3000/api/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // ✅ SUCCESS: Create proper receipt
        const newSale: Sale = {
          id: result.order?.order_id?.toString() || Date.now().toString(),
          date: new Date().toLocaleString(),
          items: cart,
          subtotal: getSubtotal(),
          discount: discount,
          tax: getTax(),
          total: getTotalWithTax(),
          paymentMethod
        };
        
        setLatestReceipt(newSale);
        setSalesHistory(prev => [...prev, newSale]);
        
        // ✅ Clear cart and close payment modal
        setCart([]);
        setDiscount(0);
        setShowPaymentModal(false);
        setShowReceiptModal(true);
        
        alert('✅ Sale completed! Inventory automatically updated.');
        
      } else {
        const error = await response.json();
        
        // ✅ HANDLE INVENTORY ERRORS
        if (error.message?.includes('Insufficient stock')) {
          alert(`❌ ${error.message}\n\nPlease check inventory levels or reduce quantities.`);
        } else if (error.message?.includes('No inventory record')) {
          alert(`❌ ${error.message}\n\nPlease add this product to inventory first.`);
        } else {
          alert(`❌ Error: ${error.message || 'Failed to complete order'}`);
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('❌ Network error processing sale');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    const printContent = receiptRef.current?.innerHTML;
    const printWindow = window.open("", "Print", "width=600,height=800");

    if (printWindow && printContent) {
      printWindow.document.write('<html><head><title>Print Receipt</title>');
      printWindow.document.write(`
        <style>
          body { font-family: 'Courier New', Courier, monospace; color: #3D2C1D; margin: 20px; }
          h2 { text-align: center; }
          p { text-align: center; }
          .details { border-top: 1px dashed #D6C7B7; border-bottom: 1px dashed #D6C7B7; padding: 10px 0; margin: 10px 0; }
          .item, .summary-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #D6C7B7; padding-top: 5px; }
          .footer { text-align: center; margin-top: 20px; font-weight: bold; }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedBranch');
    window.location.href = '/login';
  };


  const formatCurrency = (amount: number | string | undefined): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₱${(numAmount || 0).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#F5F0E6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8C5A3A]"></div>
          <p className="mt-4 text-[#6F4E37]">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#F5F0E6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-[#8C5A3A] text-white px-4 py-2 rounded-lg hover:bg-[#6F4E37]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="h-screen bg-[#F5F0E6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6F4E37] mb-4">No products available in database</p>
          <button 
            onClick={fetchProducts}
            className="bg-[#8C5A3A] text-white px-4 py-2 rounded-lg hover:bg-[#6F4E37]"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6]">
      {/* ✅ Header */}
      <div className="bg-[#3D2C1D] text-white px-6 py-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-[#8C5A3A]">CodeBrew POS</h1>
            <div className="text-sm">
              <span className="text-[#D6C7B7]">Branch:</span>
              <span className="ml-2 text-white font-medium">
                {userData.branch_name || 'Loading...'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-[#D6C7B7]">Cashier</p>
              <p className="text-white font-medium">{userData.username || 'Loading...'}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSalesReportModal(true)}
                className="flex items-center space-x-2 bg-[#8C5A3A] text-white px-4 py-2 rounded-lg hover:bg-[#6F4E37] transition-colors"
              >
                <FiBarChart2 size={16} />
                <span>Reports</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Main Content */}
      <div className="p-6">
        <div className="flex space-x-6 h-[calc(100vh-120px)]">
          {/* Left Side - Products */}
          <div className="w-2/3 h-full">
            <div className="bg-[#FFFBF5] p-6 rounded-lg shadow-md h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#3D2C1D]">Products</h2>
                <div className="text-right">
                  <p className="text-sm text-[#8C5A3A]">Live from Database</p>
                  <p className="text-lg font-semibold text-[#3D2C1D]">{products.length} Products Available</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8C5A3A]" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#D6C7B7] rounded-lg focus:ring-2 focus:ring-[#8C5A3A] focus:border-transparent bg-[#F5F0E6] text-[#3D2C1D]"
                />
              </div>

              {/* Categories */}
              <div className="flex space-x-4 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === category.name
                        ? "bg-[#8C5A3A] text-white"
                        : "bg-[#EAE1D5] text-[#6F4E37] hover:bg-[#D6C7B7]"
                    }`}
                  >
                    {category.icon}
                    <span className="font-medium">
                      {category.name} ({getProductCount(category.name)})
                    </span>
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                      <img
                        src={product.image || `/images/${product.category}.png`}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/images/default-product.png`;
                        }}
                      />
                      <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-[#8B4513]">
                          {formatCurrency(product.price)}
                        </span>
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="bg-[#8B4513] text-white px-3 py-1 rounded-lg hover:bg-[#654321] transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[#6F4E37] text-lg">No products found</p>
                    <p className="text-[#8C5A3A] text-sm">Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Cart */}
          <div className="w-1/3 flex flex-col">
            <div className="bg-[#FFFBF5] p-6 rounded-lg shadow-md flex flex-col h-full">
              <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto mb-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#8C5A3A] text-lg">Cart is empty</p>
                    <p className="text-[#6F4E37] text-sm">Add items to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>
                        <div className="w-20 text-right">
                          {formatCurrency((item.price || 0) * item.quantity)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              {cart.length > 0 && (
                <div className="border-t border-[#D6C7B7] pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[#6F4E37]">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#6F4E37]">
                      <span>Tax (12%):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-[#6F4E37]">
                      <span>Discount:</span>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-20 text-right border border-[#D6C7B7] rounded px-2 py-1"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex justify-between text-xl font-bold text-[#3D2C1D] border-t border-[#D6C7B7] pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* ✅ CHECKOUT BUTTON */}
                  <button
                    onClick={handleProcessOrder}
                    className="w-full bg-[#8C5A3A] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#6F4E37] transition"
                  >
                    Process Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Product Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-[#3D2C1D] bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#FFFBF5] p-6 rounded-lg shadow-xl w-full max-w-lg animate-fadeIn relative">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 text-[#8C5A3A] hover:text-[#3D2C1D]"
            >
              <FiX size={24} />
            </button>
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full md:w-1/2 h-64 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-product.png';
                }}
              />
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#3D2C1D] mb-2">{selectedProduct.name}</h3>
                  <p className="text-[#6F4E37] mb-4">{selectedProduct.description}</p>
                  <p className="text-3xl font-bold text-[#8C5A3A] mb-6">{formatCurrency(selectedProduct.price)}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-[#3D2C1D] font-medium">Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                        className="w-10 h-10 bg-[#EAE1D5] text-[#6F4E37] rounded-full flex items-center justify-center hover:bg-[#D6C7B7]"
                      >
                        <FiMinus />
                      </button>
                      <span className="w-12 text-center font-bold text-[#3D2C1D]">{modalQuantity}</span>
                      <button
                        onClick={() => setModalQuantity(modalQuantity + 1)}
                        className="w-10 h-10 bg-[#8C5A3A] text-white rounded-full flex items-center justify-center hover:bg-[#6F4E37]"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAddToCartFromModal}
                    className="w-full bg-[#8C5A3A] text-white py-3 rounded-lg font-semibold hover:bg-[#6F4E37] transition"
                  >
                    Add to Cart - {formatCurrency((selectedProduct.price || 0) * modalQuantity)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-[#3D2C1D] bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#FFFBF5] p-8 rounded-lg shadow-xl w-full max-w-md animate-fadeIn">
            <h2 className="text-3xl font-bold mb-6 text-center text-[#3D2C1D]">Payment</h2>
            <div className="flex justify-between items-center font-bold text-4xl mb-8 p-4 bg-[#F5F0E6] rounded-lg">
              <span className="text-[#6F4E37]">Total:</span>
              <span className="text-[#8C5A3A]">{formatCurrency(total)}</span>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-[#3D2C1D]">Select Payment Method:</h3>
              <div className="grid grid-cols-3 gap-4 text-[#6F4E37]">
                {["Cash", "Card", "Digital"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method as "Cash" | "Card" | "Digital")}
                    className={`p-4 rounded-lg border-2 transition ${
                      paymentMethod === method
                        ? "border-[#8C5A3A] bg-[#F5F0E6] text-[#8C5A3A]"
                        : "border-[#D6C7B7] hover:border-[#8C5A3A]"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {method === "Cash" && <FaMoneyBillWave size={24} />}
                      {method === "Card" && <FaCreditCard size={24} />}
                      {method === "Digital" && <FaQrcode size={24} />}
                      <span className="font-medium">{method}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-10">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 py-3 bg-[#EAE1D5] text-[#3D2C1D] rounded-lg font-semibold hover:bg-[#D6C7B7] transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="px-6 py-3 bg-[#8C5A3A] text-white rounded-lg font-semibold hover:bg-[#6F4E37] transition disabled:bg-[#D6C7B7]"
              >
                {isProcessing ? 'Processing...' : 'Complete Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Receipt Modal */}
      {showReceiptModal && latestReceipt && (
        <div className="fixed inset-0 bg-[#3D2C1D] bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#FFFBF5] p-8 rounded-lg shadow-xl w-full max-w-sm animate-fadeIn">
            <div ref={receiptRef} className="text-sm text-[#3D2C1D]">
              <h2 className="text-2xl font-bold mb-4 text-center">Receipt</h2>
              <p className="text-center mb-2">Thank you for your purchase!</p>
              <p className="text-center text-xs mb-4 text-[#8C5A3A]">{latestReceipt.date}</p>
              <div className="border-t border-b border-dashed border-[#D6C7B7] py-3 my-3">
                {latestReceipt.items.map((item, index) => (
                  <div key={index} className="flex justify-between mb-1">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatCurrency((item.price || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-[#6F4E37]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(latestReceipt.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(latestReceipt.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(latestReceipt.discount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-[#D6C7B7] pt-2 text-[#3D2C1D]">
                  <span>Total:</span>
                  <span>{formatCurrency(latestReceipt.total)}</span>
                </div>
              </div>
              <p className="mt-6 text-center font-semibold">
                Paid with: {latestReceipt.paymentMethod}
              </p>
            </div>
            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={handlePrintReceipt}
                className="px-6 py-2 bg-[#8C5A3A] text-white rounded-lg hover:bg-[#6F4E37] transition flex items-center space-x-2"
              >
                <FiPrinter size={18} />
                <span>Print</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-6 py-2 bg-[#EAE1D5] text-[#3D2C1D] rounded-lg hover:bg-[#D6C7B7] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Sales Report Modal */}
      {showSalesReportModal && (
        <div className="fixed inset-0 bg-[#3D2C1D] bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#FFFBF5] p-8 rounded-lg shadow-xl w-full max-w-2xl animate-fadeIn flex flex-col h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-[#3D2C1D]">Sales Report</h2>
              <button
                onClick={() => setShowSalesReportModal(false)}
                className="text-[#8C5A3A] hover:text-[#3D2C1D]"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-4 border-t border-b border-[#D6C7B7] py-4">
              {salesHistory.length === 0 ? (
                <p className="text-center text-[#6F4E37] py-8">No sales data available.</p>
              ) : (
                <div className="space-y-4">
                  {salesHistory.map((sale, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-[#D6C7B7]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-[#3D2C1D]">Sale #{sale.id.slice(-8)}</span>
                        <span className="text-[#8C5A3A] font-bold">{formatCurrency(sale.total)}</span>
                      </div>
                      <div className="text-sm text-[#6F4E37]">
                        <p>Date: {sale.date}</p>
                        <p>Items: {sale.items.length}</p>
                        <p>Payment: {sale.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSalesReportModal(false)}
                className="px-6 py-2 bg-[#8C5A3A] text-white rounded-lg hover:bg-[#6F4E37] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pos;