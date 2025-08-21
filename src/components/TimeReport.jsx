import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDailySummary, formatHoursMinutes } from '../lib/timeTracking';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiHome } = FiIcons;

const TimeReport = ({ userId, date = null }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use today's date if none provided
  const reportDate = date || new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    const loadSummary = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const { success, data, error } = await getDailySummary(userId, reportDate);
        
        if (!success) throw new Error(error);
        
        setSummary(data);
      } catch (error) {
        console.error('Error loading time summary:', error);
        setError('Fehler beim Laden der Zeitübersicht');
      } finally {
        setLoading(false);
      }
    };
    
    loadSummary();
  }, [userId, reportDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-5 w-5 border-3 border-blue-500 rounded-full border-t-transparent mr-2"></div>
        <span className="text-sm">Lade Zeitübersicht...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
        {error}
      </div>
    );
  }

  // Format the date for display
  const displayDate = new Date(reportDate).toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 rounded-xl p-4 border border-white/10 mt-4"
    >
      <h4 className="font-medium mb-3 flex items-center">
        <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2 text-blue-400" />
        Zeitübersicht für {displayDate}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center mb-1">
            <SafeIcon icon={FiClock} className="w-4 h-4 mr-2 text-green-400" />
            <span className="text-sm text-slate-300">Arbeitszeit</span>
          </div>
          <p className="text-xl font-bold">{formatHoursMinutes(summary?.total_work_seconds || 0)}</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center mb-1">
            <SafeIcon icon={FiClock} className="w-4 h-4 mr-2 text-amber-400" />
            <span className="text-sm text-slate-300">Pausenzeit</span>
          </div>
          <p className="text-xl font-bold">{formatHoursMinutes(summary?.total_break_seconds || 0)}</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center mb-1">
            <SafeIcon icon={FiHome} className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-sm text-slate-300">Mobile Arbeit</span>
          </div>
          <p className="text-xl font-bold">{formatHoursMinutes(summary?.total_remote_seconds || 0)}</p>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-slate-400 text-right">
        Letzte Aktualisierung: {summary?.last_calculated_at ? new Date(summary.last_calculated_at).toLocaleTimeString('de-DE') : '-'}
      </div>
    </motion.div>
  );
};

export default TimeReport;