import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="admin-layout flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="sidebar w-64 bg-gray-800 text-white p-4">
        <div className="logo mb-8 p-2">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/admin/dashboard" className="block px-4 py-2 rounded hover:bg-gray-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/blog" className="block px-4 py-2 rounded hover:bg-gray-700">
                Blog Posts
              </Link>
            </li>
            <li>
              <Link to="/admin/projects" className="block px-4 py-2 rounded hover:bg-gray-700">
                Projects
              </Link>
            </li>
            <li>
              <Link to="/admin/skills" className="block px-4 py-2 rounded hover:bg-gray-700">
                Skills
              </Link>
            </li>
            <li>
              <Link to="/admin/messages" className="block px-4 py-2 rounded hover:bg-gray-700">
                Messages
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-700">
                Users
              </Link>
            </li>
            <li>
              <Link to="/admin/settings" className="block px-4 py-2 rounded hover:bg-gray-700">
                Settings
              </Link>
            </li>
            <li>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 mt-4"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <div className="user-info flex items-center space-x-2">
              <span>Welcome, Admin</span>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;