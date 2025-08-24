import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Add this helper function at the top

  // ✅ UPDATED LOGIN FUNCTION - Admin goes to branch management first
  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name,
          password: password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        // ✅ FIXED: Handle the new response structure
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.role_name);
        
        // ✅ FIXED: Set selectedBranch to user's assigned branch
        if (data.user.branch_id) {
          localStorage.setItem('selectedBranch', data.user.branch_id.toString());
          console.log('✅ Set selectedBranch to user assigned branch:', data.user.branch_name, '(ID:', data.user.branch_id, ')');
        }
        
        console.log('User role:', data.user.role_name);
        console.log('User branch:', data.user.branch_name);

        // ✅ UPDATED: Navigate based on user role - Admin goes to branch management FIRST
        switch (data.user.role_name) {
          case 'Admin':
            console.log('Admin login - redirecting to branch management');
            navigate('/admin/branch-management');
            break;
          case 'Branch Officer':
            navigate('/branch-officer/dashboard');
            break;
          case 'Cashier':
            navigate('/cashier/pos');
            break;
          default:
            console.log('Unknown role, defaulting to admin branch management');
            navigate('/admin/branch-management');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center lg:justify-start relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out transform scale-105"
        style={{ backgroundImage: "url('/coffeebg.jpg')" }}
      ></div>
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Navbar for About Us and Contact */}
      <nav className="hidden lg:flex absolute top-8 right-12 z-20 space-x-8">
        <a href="#about" className="text-white/90 hover:text-white font-semibold transition-colors">About Us</a>
        <a href="#contact" className="text-white/90 hover:text-white font-semibold transition-colors">Contact</a>
      </nav>

      {/* Main Content Aligned to the Left for Desktop */}
      <div className="relative z-10 w-full max-w-6xl flex items-center justify-between px-6 sm:px-12 lg:px-24">
        {/* Left Side: Login Form */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <header className="flex items-center space-x-3 mb-10">
            <img src="/logo.png" alt="Logo" className="h-9 w-auto" />
            <span className="text-3xl font-bold text-white">Code Brew</span>
          </header>

          {/* Title */}
          <div className="space-y-2 mb-8">
            <h1 className="text-5xl font-serif text-white leading-tight">
              Start Your Day <span className="text-[#d3a675]">Right.</span>
            </h1>
            <p className="text-base text-white/80">
              Kickstart your energy and awaken your senses.
            </p>
          </div>

          {/* Glassmorphism Form Container */}
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Input */}
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="peer w-full px-4 py-3 text-white bg-white/10 rounded-lg border border-transparent focus:border-[#d3a675] focus:ring-0 outline-none placeholder-transparent transition-colors"
                  placeholder="Username"
                  disabled={isLoading}
                />
                <label
                  htmlFor="username"
                  className="absolute left-4 -top-2.5 text-sm text-[#d3a675] transition-all pointer-events-none
                             peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300
                             peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#d3a675]"
                >
                  Username
                </label>
              </div>
              
              {/* Password Input */}
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full px-4 py-3 text-white bg-white/10 rounded-lg border border-transparent focus:border-[#d3a675] focus:ring-0 outline-none placeholder-transparent transition-colors"
                  placeholder="Password"
                  disabled={isLoading}
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 -top-2.5 text-sm text-[#d3a675] transition-all pointer-events-none
                             peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300
                             peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#d3a675]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Error Message */}
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#d3a675] hover:bg-[#b98c59] text-stone-900 font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-white/80 pt-2">
                Don't have an account?{" "}
                <a href="#" className="font-semibold text-[#d3a675] hover:underline">
                  Sign Up
                </a>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;