import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Package, LogOut, FileText } from 'lucide-react';

export default function AppLayout() {
  const { role, backendUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-green-600">Kabadiwala Connect</h2>
          <p className="text-sm text-gray-500 mt-1 capitalize">{role?.toLowerCase()} Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => navigate(`/${role?.toLowerCase()}/dashboard`)} className="flex items-center gap-3 w-full p-3 text-left rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-700">
            <Home size={20} /> Home
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-left rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-700">
            <Package size={20} /> My Lots
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-left rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-700">
            <FileText size={20} /> Transactions
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-gray-900">{backendUser?.name}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-left rounded-lg hover:bg-red-50 text-red-600">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-bold text-green-600">Kabadiwala Connect</h2>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-600"><LogOut size={20} /></button>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-10">
        <button onClick={() => navigate(`/${role?.toLowerCase()}/dashboard`)} className="flex flex-col items-center text-green-600">
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <Package size={24} />
          <span className="text-xs mt-1">Lots</span>
        </button>
        <button className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <FileText size={24} />
          <span className="text-xs mt-1">History</span>
        </button>
      </nav>
    </div>
  );
}