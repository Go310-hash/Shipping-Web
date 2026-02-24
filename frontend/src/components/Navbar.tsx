import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center">
            <span className="mr-2">📦</span>
            Shipping Tracker
          </Link>
          
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="hover:text-blue-200 transition">
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 transition">
                  Dashboard
                </Link>
                <Link to="/shipments" className="hover:text-blue-200 transition">
                  Shipments
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-md transition"
                >
                  Logout ({user.name})
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;