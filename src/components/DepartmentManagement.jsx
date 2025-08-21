import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit2, FiTrash2, FiUsers } = FiIcons;

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const [userProfile] = useOutletContext() || [{}];
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulating API call to get departments
    setTimeout(() => {
      const mockDepartments = [
        {
          id: '1',
          name: 'IT',
          company_name: 'Acme Corporation',
          user_count: 12,
          created_at: '2023-01-10'
        },
        {
          id: '2',
          name: 'Marketing',
          company_name: 'Acme Corporation',
          user_count: 8,
          created_at: '2023-01-15'
        },
        {
          id: '3',
          name: 'Sales',
          company_name: 'Acme Corporation',
          user_count: 15,
          created_at: '2023-01-20'
        },
        {
          id: '4',
          name: 'HR',
          company_name: 'Acme Corporation',
          user_count: 5,
          created_at: '2023-02-05'
        }
      ];
      
      setDepartments(mockDepartments);
      setLoading(false);
    }, 800);
  }, []);

  // Check if user has specific role
  const isSuperAdmin = userProfile?.profile?.app_role === 'Superadmin';
  const isOwner = userProfile?.profile?.app_role === 'Owner';
  const canCreateDepartment = isSuperAdmin || isOwner;

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
          <h2 className="text-2xl font-bold">Abteilungen verwalten</h2>
          {canCreateDepartment && (
            <button 
              className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
              Abteilung erstellen
            </button>
          )}
        </div>
        
        {/* Department cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(department => (
            <div 
              key={department.id}
              className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg">{department.name}</h3>
                <div className="flex space-x-2">
                  {(isSuperAdmin || isOwner) && (
                    <>
                      <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <SafeIcon icon={FiEdit2} className="w-4 h-4 text-blue-300" />
                      </button>
                      <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <SafeIcon icon={FiTrash2} className="w-4 h-4 text-red-300" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-sm text-slate-300">
                {department.company_name}
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center text-sm">
                  <SafeIcon icon={FiUsers} className="w-4 h-4 mr-1 text-blue-300" />
                  <span>{department.user_count} Mitarbeiter</span>
                </div>
                <div className="text-xs text-slate-400">
                  Erstellt: {new Date(department.created_at).toLocaleDateString('de-DE')}
                </div>
              </div>
              
              <button 
                className="mt-4 w-full py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors text-center"
              >
                Details anzeigen
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DepartmentManagement;