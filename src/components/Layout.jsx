import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser } from '../lib/auth';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiBriefcase, FiLayers, FiCreditCard, FiUserPlus } = FiIcons;

const Layout = ({ userProfile: initialUserProfile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(initialUserProfile);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Update current path when location changes
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const result = await logoutUser();
      if (result.success) {
        navigate('/login');
      } else {
        console.error('Logout failed:', result.error);
        // Force navigation even if there was an error
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Force navigation even if there was an exception
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Navigation handler
  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  // Check if a path is active
  const isActive = (path) => {
    if (path === '/dashboard' && currentPath === '/dashboard') {
      return true;
    }
    // Special case for team management
    if (path === '/team' && (currentPath === '/team' || currentPath === '/user-management')) {
      return true;
    }
    // Special case for billing
    if (path === '/billing' && currentPath === '/billing') {
      return true;
    }
    return currentPath === path;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return userProfile?.profile && roles.includes(userProfile.profile.app_role);
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Set page title based on current path
  let pageTitle = "Dashboard";
  if (currentPath === '/company') pageTitle = "Unternehmen verwalten";
  if (currentPath === '/departments') pageTitle = "Abteilungen";
  if (currentPath === '/team' || currentPath === '/user-management') pageTitle = "Team verwalten";
  if (currentPath === '/billing') pageTitle = "Abrechnung";
  if (currentPath === '/settings') pageTitle = "Einstellungen";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - FIXED: Now always visible on desktop with position fixed only on mobile */}
      <div className="hidden lg:block lg:w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 flex-shrink-0">
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center">
            <div 
              onClick={() => handleNavigation('/dashboard')}
              className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center cursor-pointer"
            >
              <span className="text-xl font-bold">M</span>
            </div>
            <h1 className="ml-3 text-xl font-bold cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
              Manage.tools
            </h1>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="font-medium text-sm">
                {userProfile?.user?.email?.substring(0, 2).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3 overflow-hidden">
              <div className="font-medium truncate">{userProfile?.user?.email}</div>
              <div className="text-xs text-slate-300">{userProfile?.profile?.app_role}</div>
            </div>
          </div>
        </div>

        {/* Navigation for desktop */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => handleNavigation('/dashboard')}
                className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                  isActive('/dashboard') 
                    ? 'bg-blue-600/30 text-blue-100' 
                    : 'hover:bg-white/10'
                }`}
              >
                <SafeIcon icon={FiHome} className="w-5 h-5 mr-3" />
                Dashboard
              </button>
            </li>
            
            {/* Company Management - Only for Owner and Superadmin */}
            {hasAnyRole(['Owner', 'Superadmin']) && (
              <li>
                <button 
                  onClick={() => handleNavigation('/company')}
                  className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                    isActive('/company') 
                      ? 'bg-blue-600/30 text-blue-100' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <SafeIcon icon={FiBriefcase} className="w-5 h-5 mr-3" />
                  Unternehmen
                </button>
              </li>
            )}
            
            {/* Department Management - Only for Owner and Superadmin */}
            {hasAnyRole(['Owner', 'Superadmin']) && (
              <li>
                <button 
                  onClick={() => handleNavigation('/departments')}
                  className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                    isActive('/departments') 
                      ? 'bg-blue-600/30 text-blue-100' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <SafeIcon icon={FiLayers} className="w-5 h-5 mr-3" />
                  Abteilungen
                </button>
              </li>
            )}
            
            {/* User Management - For Owner, Admin and Superadmin */}
            {hasAnyRole(['Owner', 'Admin', 'Superadmin']) && (
              <li>
                <button 
                  onClick={() => handleNavigation('/team')}
                  className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                    isActive('/team') 
                      ? 'bg-blue-600/30 text-blue-100' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <SafeIcon icon={FiUserPlus} className="w-5 h-5 mr-3" />
                  Team verwalten
                </button>
              </li>
            )}

            {/* Billing - For Owner and Superadmin */}
            {hasAnyRole(['Owner', 'Superadmin']) && (
              <li>
                <button 
                  onClick={() => handleNavigation('/billing')}
                  className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                    isActive('/billing') 
                      ? 'bg-blue-600/30 text-blue-100' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <SafeIcon icon={FiCreditCard} className="w-5 h-5 mr-3" />
                  Abrechnung
                </button>
              </li>
            )}
            
            {/* Settings - For all users */}
            <li>
              <button 
                onClick={() => handleNavigation('/settings')}
                className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                  isActive('/settings') 
                    ? 'bg-blue-600/30 text-blue-100' 
                    : 'hover:bg-white/10'
                }`}
              >
                <SafeIcon icon={FiSettings} className="w-5 h-5 mr-3" />
                Einstellungen
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout for desktop */}
        <div className="p-4 border-t border-white/20">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-2 rounded-xl text-white hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin h-5 w-5 mr-3 border-2 border-white rounded-full border-t-transparent"></div>
                Abmelden...
              </>
            ) : (
              <>
                <SafeIcon icon={FiLogOut} className="w-5 h-5 mr-3" />
                Abmelden
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: sidebarOpen ? 0 : -280,
          width: 256
        }}
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 flex flex-col lg:hidden`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center">
            <div 
              onClick={() => handleNavigation('/dashboard')}
              className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center cursor-pointer"
            >
              <span className="text-xl font-bold">M</span>
            </div>
            <h1 className="ml-3 text-xl font-bold cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
              Manage.tools
            </h1>
            
            {/* Close button (mobile only) */}
            <button 
              className="ml-auto lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="font-medium text-sm">
                {userProfile?.user?.email?.substring(0, 2).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3 overflow-hidden">
              <div className="font-medium truncate">{userProfile?.user?.email}</div>
              <div className="text-xs text-slate-300">{userProfile?.profile?.app_role}</div>
            </div>
          </div>
        </div>

        {/* Navigation for mobile */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => handleNavigation('/dashboard')}
                className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                  isActive('/dashboard') 
                    ? 'bg-blue-600/30 text-blue-100' 
                    : 'hover:bg-white/10'
                }`}
              >
                <SafeIcon icon={FiHome} className="w-5 h-5 mr-3" />
                Dashboard
              </button>
            </li>
            
            {/* Company Management - Only for Owner and Superadmin */}
            {hasAnyRole(['Owner', 'Superadmin']) && (
              <li>
                <button 
                  onClick={() => handleNavigation('/company')}
                  className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                    isActive('/company') 
                      ? 'bg-blue-600/30 text-blue-100' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <SafeIcon icon={FiBriefcase} className="w-5 h-5 mr-3" />
                  Unternehmen
                </button>
              </li>
            )}
            
            {/* Department Management - Only for Owner and Superadmin */}
            {hasAnyRole(['Owner', 'Superadmin']) && (
              <li>
                <button 
                  onClick={() => handleNavigation('/departments')}
                  className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                    isActive('/departments') 
                      ? 'bg-blue-600/30 text-blue-100' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <SafeIcon icon={FiLayers} className="w-5 h-5 mr-3" />
                  Abteilungen
                </button>
              </li>
            )}
            
            {/* User Management - For Owner, Admin and Superadmin */}
            {hasAnyRole(['Owner', 'Admin', 'Superadmin']) && (
              <li>
                <button 
                  onClick={() => handleNavigation('/team')}
                  className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                    isActive('/team') 
                      ? 'bg-blue-600/30 text-blue-100' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <SafeIcon icon={FiUserPlus} className="w-5 h-5 mr-3" />
                  Team verwalten
                </button>
              </li>
            )}

            {/* Billing - For Owner and Superadmin */}
            {hasAnyRole(['Owner', 'Superadmin']) && (
              <li>
                <button 
                  onClick={() => handleNavigation('/billing')}
                  className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                    isActive('/billing') 
                      ? 'bg-blue-600/30 text-blue-100' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <SafeIcon icon={FiCreditCard} className="w-5 h-5 mr-3" />
                  Abrechnung
                </button>
              </li>
            )}
            
            {/* Settings - For all users */}
            <li>
              <button 
                onClick={() => handleNavigation('/settings')}
                className={`flex items-center w-full px-3 py-2 rounded-xl text-white transition-colors text-left ${
                  isActive('/settings') 
                    ? 'bg-blue-600/30 text-blue-100' 
                    : 'hover:bg-white/10'
                }`}
              >
                <SafeIcon icon={FiSettings} className="w-5 h-5 mr-3" />
                Einstellungen
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout for mobile */}
        <div className="p-4 border-t border-white/20">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-2 rounded-xl text-white hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin h-5 w-5 mr-3 border-2 border-white rounded-full border-t-transparent"></div>
                Abmelden...
              </>
            ) : (
              <>
                <SafeIcon icon={FiLogOut} className="w-5 h-5 mr-3" />
                Abmelden
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 h-16 flex items-center px-4">
          {/* Mobile menu button */}
          <button 
            className="mr-4 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <SafeIcon icon={FiMenu} className="w-6 h-6" />
          </button>
          
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center lg:hidden">
                <span className="text-base font-bold">M</span>
              </div>
              <h2 className="text-xl font-semibold ml-2 lg:ml-0">{pageTitle}</h2>
            </div>
            
            {/* User profile preview on large screens */}
            <div className="hidden md:flex items-center">
              <span className="text-sm text-slate-300 mr-3">
                {userProfile?.user?.email}
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="font-medium text-xs">
                  {userProfile?.user?.email?.substring(0, 2).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <Outlet context={[userProfile]} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;