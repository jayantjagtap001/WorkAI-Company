import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX } = FiIcons;

const UserManagement = () => {
  const navigate = useNavigate();
  const [userProfile] = useOutletContext() || [{}];
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulating API call to get users
    setTimeout(() => {
      const mockUsers = [
        {
          id: '1',
          email: 'admin@example.com',
          app_role: 'Admin',
          created_at: '2023-01-15',
          department: 'IT'
        },
        {
          id: '2',
          email: 'user1@example.com',
          app_role: 'User',
          created_at: '2023-02-20',
          department: 'Marketing'
        },
        {
          id: '3',
          email: 'user2@example.com',
          app_role: 'User',
          created_at: '2023-03-10',
          department: 'Sales'
        },
        {
          id: '4',
          email: 'manager@example.com',
          app_role: 'Admin',
          created_at: '2023-01-05',
          department: 'Management'
        }
      ];
      
      setUsers(mockUsers);
      setLoading(false);
    }, 800);
  }, []);

  // Check if user has specific role
  const isSuperAdmin = userProfile?.profile?.app_role === 'Superadmin';
  const isOwner = userProfile?.profile?.app_role === 'Owner';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Team verwalten</h2>
          <button 
            className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
            Benutzer hinzufügen
          </button>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Suche nach Benutzern..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
        
        {/* Users table */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left">E-Mail</th>
                  <th className="px-4 py-3 text-left">Rolle</th>
                  {(isSuperAdmin || isOwner) && (
                    <th className="px-4 py-3 text-left">Abteilung</th>
                  )}
                  <th className="px-4 py-3 text-left">Erstellt am</th>
                  <th className="px-4 py-3 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-white/5">
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs ${
                        user.app_role === 'Admin' ? 'bg-purple-600/30 text-purple-300' : 
                        user.app_role === 'User' ? 'bg-green-600/30 text-green-300' :
                        'bg-blue-600/30 text-blue-300'
                      }`}>
                        {user.app_role}
                      </span>
                    </td>
                    {(isSuperAdmin || isOwner) && (
                      <td className="px-4 py-3">{user.department}</td>
                    )}
                    <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString('de-DE')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                          <SafeIcon icon={FiEdit2} className="w-5 h-5 text-blue-300" />
                        </button>
                        <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                          <SafeIcon icon={FiTrash2} className="w-5 h-5 text-red-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Zeige 1-{users.length} von {users.length} Benutzern
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-50">
              Zurück
            </button>
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg">
              1
            </button>
            <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-50">
              Weiter
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserManagement;