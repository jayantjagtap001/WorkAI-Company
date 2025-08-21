import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiBriefcase, FiCalendar, FiShield, FiUsers, FiLayers } = FiIcons;

const SuperadminDashboard = ({ userProfile }) => {
  const navigate = useNavigate();

  // Navigation handler
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Systemverwaltung</h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3 text-slate-200">Globale Administration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => handleNavigation('/company')}
              className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-5 border border-white/10 text-left"
            >
              <div className="flex items-center mb-2">
                <SafeIcon icon={FiBriefcase} className="w-6 h-6 text-blue-400 mr-3" />
                <h4 className="font-medium text-lg">Mandantenverwaltung</h4>
              </div>
              <p className="text-sm text-slate-300">Unternehmen erstellen und verwalten</p>
            </button>
            
            <button 
              onClick={() => handleNavigation('/team')}
              className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-5 border border-white/10 text-left"
            >
              <div className="flex items-center mb-2">
                <SafeIcon icon={FiUsers} className="w-6 h-6 text-green-400 mr-3" />
                <h4 className="font-medium text-lg">Benutzerverwaltung</h4>
              </div>
              <p className="text-sm text-slate-300">Globale Benutzer und Rollen verwalten</p>
            </button>
            
            <button 
              onClick={() => handleNavigation('/departments')}
              className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-5 border border-white/10 text-left"
            >
              <div className="flex items-center mb-2">
                <SafeIcon icon={FiLayers} className="w-6 h-6 text-amber-400 mr-3" />
                <h4 className="font-medium text-lg">Abteilungen</h4>
              </div>
              <p className="text-sm text-slate-300">Globale Abteilungsstruktur verwalten</p>
            </button>
            
            <button 
              onClick={() => handleNavigation('/settings')}
              className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-5 border border-white/10 text-left"
            >
              <div className="flex items-center mb-2">
                <SafeIcon icon={FiSettings} className="w-6 h-6 text-purple-400 mr-3" />
                <h4 className="font-medium text-lg">Systemeinstellungen</h4>
              </div>
              <p className="text-sm text-slate-300">Globale Einstellungen konfigurieren</p>
            </button>
            
            <button 
              onClick={() => handleNavigation('/admin/dashboard')}
              className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-5 border border-white/10 text-left"
            >
              <div className="flex items-center mb-2">
                <SafeIcon icon={FiCalendar} className="w-6 h-6 text-teal-400 mr-3" />
                <h4 className="font-medium text-lg">Feiertage</h4>
              </div>
              <p className="text-sm text-slate-300">Globale Feiertage und Kalender verwalten</p>
            </button>
            
            <button 
              onClick={() => handleNavigation('/admin/logs')}
              className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-5 border border-white/10 text-left"
            >
              <div className="flex items-center mb-2">
                <SafeIcon icon={FiShield} className="w-6 h-6 text-red-400 mr-3" />
                <h4 className="font-medium text-lg">Sicherheit & Logs</h4>
              </div>
              <p className="text-sm text-slate-300">System-Logs und Sicherheitseinstellungen</p>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3 text-slate-200">System-Status</h3>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-300">Systemstatus</p>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <p>Aktiv</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-300">Letzte Aktualisierung</p>
                <p>{new Date().toLocaleDateString('de-DE', { 
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">Zeitzone</p>
                <p>Europe/Berlin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SuperadminDashboard;