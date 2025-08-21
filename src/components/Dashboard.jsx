import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAccessibleCompanies } from '../lib/auth';
import TimeTracker from './TimeTracker';
import SuperadminDashboard from './SuperadminDashboard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userProfile] = useOutletContext() || [{}];
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Load accessible companies
        const { success, data } = await getAccessibleCompanies();
        if (success) {
          setCompanies(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);

  // Navigation handler
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Check if user has specific role
  const hasRole = (role) => userProfile?.profile?.app_role === role;
  
  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => userProfile?.profile && roles.includes(userProfile.profile.app_role);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Redirect Superadmin to their own dashboard
  if (hasRole('Superadmin')) {
    return <SuperadminDashboard userProfile={userProfile} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Time Tracking Component - Only for Owner, Admin, and User */}
      {hasAnyRole(['Owner', 'Admin', 'User']) && (
        <TimeTracker userProfile={userProfile} />
      )}
      
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Willkommen, {userProfile?.user?.email?.split('@')[0]}</h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3 text-slate-200">Ihre Kontoinformationen</h3>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-300">E-Mail</p>
                <p>{userProfile?.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">Rolle</p>
                <p>{userProfile?.profile?.app_role}</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">Konto erstellt</p>
                <p>{userProfile?.user?.created_at ? new Date(userProfile?.user?.created_at).toLocaleDateString('de-DE') : '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {hasRole('Owner') && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3 text-slate-200">Owner-Funktionen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => handleNavigation('/company')}
                className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-white/10 text-left"
              >
                <h4 className="font-medium">Unternehmensverwaltung</h4>
                <p className="text-sm text-slate-300 mt-1">Unternehmensdaten verwalten</p>
              </button>
              <button 
                onClick={() => handleNavigation('/departments')}
                className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-white/10 text-left"
              >
                <h4 className="font-medium">Abteilungsverwaltung</h4>
                <p className="text-sm text-slate-300 mt-1">Abteilungen erstellen und verwalten</p>
              </button>
              <button 
                onClick={() => handleNavigation('/team')}
                className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-white/10 text-left"
              >
                <h4 className="font-medium">Benutzerverwaltung</h4>
                <p className="text-sm text-slate-300 mt-1">Mitarbeiter verwalten und Abteilungen zuweisen</p>
              </button>
            </div>
            
            {/* Company details for owner */}
            {companies.length > 0 && (
              <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-medium mb-2">Ihr Unternehmen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-300">Name</p>
                    <p>{companies[0].name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Branche</p>
                    <p>{companies[0].industry || 'Nicht angegeben'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Erstellt am</p>
                    <p>{new Date(companies[0].created_at).toLocaleDateString('de-DE')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {hasRole('Admin') && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3 text-slate-200">Admin-Funktionen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => handleNavigation('/team')}
                className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-white/10 text-left"
              >
                <h4 className="font-medium">Benutzer verwalten</h4>
                <p className="text-sm text-slate-300 mt-1">Benutzerkonten in Ihren Abteilungen verwalten</p>
              </button>
              <button 
                onClick={() => handleNavigation('/departments')}
                className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-white/10 text-left"
              >
                <h4 className="font-medium">Abteilungen anzeigen</h4>
                <p className="text-sm text-slate-300 mt-1">Ihre zugewiesenen Abteilungen anzeigen</p>
              </button>
            </div>
          </div>
        )}

        {hasRole('User') && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3 text-slate-200">Ihre Abteilungen</h3>
            <p className="text-slate-300 mb-4">
              Hier werden Ihre zugewiesenen Abteilungen angezeigt. Kontaktieren Sie Ihren Administrator, 
              wenn Sie Zugriff auf weitere Abteilungen benötigen.
            </p>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              {companies.length > 0 ? (
                <div>
                  <h4 className="font-medium mb-2">Unternehmen: {companies[0].name}</h4>
                  <p className="text-sm text-slate-300">
                    Weitere Details finden Sie in Ihrem Profil oder fragen Sie Ihren Administrator.
                  </p>
                </div>
              ) : (
                <p className="text-slate-300 text-center">Keine Abteilungen zugewiesen</p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;