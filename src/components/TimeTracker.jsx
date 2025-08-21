import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiPlay, FiPause, FiHome, FiCheck, FiX, FiLoader } = FiIcons;

const TimeTracker = ({ userProfile }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null); // null, 'working', 'break', 'remote'
  const [currentActions, setCurrentActions] = useState([]);
  const [statusText, setStatusText] = useState('');
  const [statusStartTime, setStatusStartTime] = useState(null);
  const [statusDuration, setStatusDuration] = useState(null);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [departmentIds, setDepartmentIds] = useState([]);
  const [companyId, setCompanyId] = useState(null);

  // Load user's company and departments
  useEffect(() => {
    const loadUserData = async () => {
      if (!userProfile?.user?.id) return;

      try {
        // Get user's departments
        const { data: userDepts } = await supabase
          .from('user_departments_28d7f5a9c4')
          .select(`
            department_id,
            departments_28d7f5a9c4 (
              id,
              company_id
            )
          `)
          .eq('user_id', userProfile.user.id);

        if (userDepts && userDepts.length > 0) {
          // Extract department IDs
          const deptIds = userDepts.map(d => d.department_id);
          setDepartmentIds(deptIds);

          // Extract company ID from the first department
          const companyId = userDepts[0]?.departments_28d7f5a9c4?.company_id;
          if (companyId) {
            setCompanyId(companyId);
          } else {
            // No company ID found, set loading to false
            setLoading(false);
            setError('Keine Unternehmenszuordnung gefunden');
          }
        } else {
          // No departments found, set loading to false
          setLoading(false);
          setError('Keine Abteilungszuordnung gefunden');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
        setError('Fehler beim Laden der Benutzerdaten');
      }
    };

    if (userProfile?.user?.id) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  // Load current status on component mount and when user data changes
  useEffect(() => {
    const loadCurrentStatus = async () => {
      if (!userProfile?.user?.id || !companyId) return;
      
      setLoading(true);
      try {
        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        
        // Query time entries for today
        const { data: entries, error } = await supabase
          .from('time_entries_9f2d81ac56')
          .select('*')
          .eq('user_id', userProfile.user.id)
          .eq('date', today)
          .order('timestamp', { ascending: true });
        
        if (error) throw error;
        
        if (entries && entries.length > 0) {
          determineCurrentStatus(entries);
        } else {
          // No entries for today
          setCurrentStatus(null);
          setCurrentActions(['kommen', 'remote_start']);
          setStatusText('Keine Zeiterfassung heute');
        }
      } catch (error) {
        console.error('Error loading time entries:', error);
        setError('Fehler beim Laden der Zeiterfassung');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      loadCurrentStatus();
    }
  }, [userProfile, companyId]);

  // Update duration counter every second
  useEffect(() => {
    if (!statusStartTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - statusStartTime) / 1000);
      setStatusDuration(diff);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [statusStartTime]);

  // Determine current status based on time entries
  const determineCurrentStatus = (entries) => {
    if (!entries || entries.length === 0) {
      setCurrentStatus(null);
      setCurrentActions(['kommen', 'remote_start']);
      return;
    }
    
    // Get the last entry
    const lastEntry = entries[entries.length - 1];
    
    // Check if there are any open entries
    if (lastEntry.action_type === 'kommen') {
      setCurrentStatus('working');
      setCurrentActions(['gehen', 'pause_start']);
      setStatusText('Anwesend seit');
      setStatusStartTime(new Date(lastEntry.timestamp));
    } else if (lastEntry.action_type === 'pause_start') {
      setCurrentStatus('break');
      setCurrentActions(['pause_end']);
      setStatusText('Pause seit');
      setStatusStartTime(new Date(lastEntry.timestamp));
    } else if (lastEntry.action_type === 'pause_end') {
      setCurrentStatus('working');
      setCurrentActions(['gehen', 'pause_start']);
      setStatusText('Zurück seit');
      setStatusStartTime(new Date(lastEntry.timestamp));
    } else if (lastEntry.action_type === 'remote_start') {
      setCurrentStatus('remote');
      setCurrentActions(['remote_end']);
      setStatusText('Mobiles Arbeiten seit');
      setStatusStartTime(new Date(lastEntry.timestamp));
    } else if (lastEntry.action_type === 'gehen' || lastEntry.action_type === 'remote_end') {
      // Day is ended
      setCurrentStatus(null);
      setCurrentActions(['kommen', 'remote_start']);
      setStatusText('Arbeitszeit beendet');
      setStatusStartTime(null);
    }
  };

  // Format duration as HH:MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Handle time action
  const handleTimeAction = async (action) => {
    if (!userProfile?.user?.id || !companyId || departmentIds.length === 0) {
      setError('Fehler: Benutzer- oder Unternehmensdaten fehlen');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Create new time entry
      const { data, error } = await supabase
        .from('time_entries_9f2d81ac56')
        .insert({
          user_id: userProfile.user.id,
          company_id: companyId,
          department_ids: departmentIds,
          action_type: action,
          notes: notes.trim() || null,
          source: 'web',
          // Use server timestamp for consistency
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0]
        })
        .select();
      
      if (error) throw error;
      
      // Clear notes field
      setNotes('');
      
      // Get all entries for today to update the status
      const today = new Date().toISOString().split('T')[0];
      const { data: entries, error: fetchError } = await supabase
        .from('time_entries_9f2d81ac56')
        .select('*')
        .eq('user_id', userProfile.user.id)
        .eq('date', today)
        .order('timestamp', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      // Update current status
      determineCurrentStatus(entries);
    } catch (error) {
      console.error('Error recording time action:', error);
      setError(`Fehler: ${error.message || 'Unbekannter Fehler'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Get button style based on action type
  const getButtonStyle = (action) => {
    switch(action) {
      case 'kommen':
      case 'pause_end':
        return 'bg-green-600 hover:bg-green-700';
      case 'gehen':
        return 'bg-red-600 hover:bg-red-700';
      case 'pause_start':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'remote_start':
      case 'remote_end':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  // Get icon based on action type
  const getActionIcon = (action) => {
    switch(action) {
      case 'kommen':
        return FiPlay;
      case 'gehen':
        return FiX;
      case 'pause_start':
      case 'pause_end':
        return FiPause;
      case 'remote_start':
      case 'remote_end':
        return FiHome;
      default:
        return FiClock;
    }
  };

  // Get action label
  const getActionLabel = (action) => {
    switch(action) {
      case 'kommen':
        return 'Kommen';
      case 'gehen':
        return 'Gehen';
      case 'pause_start':
        return 'Pause starten';
      case 'pause_end':
        return 'Pause beenden';
      case 'remote_start':
        return 'Mobiles Arbeiten starten';
      case 'remote_end':
        return 'Mobiles Arbeiten beenden';
      default:
        return action;
    }
  };

  // If user is Superadmin, don't show time tracking
  if (userProfile?.profile?.app_role === 'Superadmin') {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl mb-6 flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-4 border-blue-500 rounded-full border-t-transparent mr-2"></div>
        <span>Zeiterfassung wird geladen...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl mb-6"
    >
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiClock} className="w-6 h-6 mr-2 text-blue-400" />
        <h2 className="text-xl font-bold">Zeiterfassung</h2>
      </div>

      {/* Status display */}
      <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-3 md:mb-0 text-center md:text-left">
            <p className="text-sm text-slate-300">{statusText}</p>
            <p className="text-2xl font-bold">
              {statusStartTime ? (
                <>
                  {new Date(statusStartTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  <span className="text-sm text-slate-300 ml-2">({formatDuration(statusDuration)})</span>
                </>
              ) : (
                'Keine aktive Sitzung'
              )}
            </p>
          </div>
          
          <div className="flex flex-row items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              currentStatus === 'working' ? 'bg-green-500' :
              currentStatus === 'break' ? 'bg-amber-500' :
              currentStatus === 'remote' ? 'bg-blue-500' :
              'bg-gray-500'
            }`}></div>
            <span>
              {currentStatus === 'working' ? 'Anwesend' :
               currentStatus === 'break' ? 'Pause' :
               currentStatus === 'remote' ? 'Mobiles Arbeiten' :
               'Nicht erfasst'}
            </span>
          </div>
        </div>
      </div>

      {/* Optional notes */}
      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm text-slate-300 mb-1">Notizen (optional)</label>
        <input
          type="text"
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="z.B. Meeting, Home Office..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentActions.map(action => (
          <motion.button
            key={action}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitting}
            onClick={() => handleTimeAction(action)}
            className={`${getButtonStyle(action)} text-white rounded-xl py-3 px-4 flex items-center justify-center text-lg font-medium transition-colors`}
          >
            {submitting ? (
              <SafeIcon icon={FiLoader} className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <SafeIcon icon={getActionIcon(action)} className="w-5 h-5 mr-2" />
            )}
            {getActionLabel(action)}
          </motion.button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
          {error}
        </div>
      )}
    </motion.div>
  );
};

export default TimeTracker;