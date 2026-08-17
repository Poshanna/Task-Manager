import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LayoutDashboard, ListTodo, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="brand-logo">
          <CheckSquare size={26} color="#818cf8" />
          <span>TaskFlow</span>
        </Link>

        <div className="nav-links">
          <Link
            to="/dashboard"
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/tasks"
            className={`nav-item ${isActive('/tasks') ? 'active' : ''}`}
          >
            <ListTodo size={18} />
            <span>Tasks</span>
          </Link>

          <Link
            to="/profile"
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
          >
            <User size={18} />
            <span>Profile</span>
          </Link>

          <div className="user-badge">
            <div className="avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" title="Logout" style={{ padding: '0.4rem 0.75rem' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
