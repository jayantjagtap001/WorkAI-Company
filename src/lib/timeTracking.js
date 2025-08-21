import supabase from './supabase';

/**
 * Get the current time tracking status for a user for today
 */
export const getCurrentTimeStatus = async (userId) => {
  try {
    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Query time entries for today
    const { data, error } = await supabase
      .from('time_entries_9f2d81ac56')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    
    // Determine the current status based on entries
    const status = determineStatus(data);
    
    return { success: true, data: status, error: null };
  } catch (error) {
    console.error('Error getting time status:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Determine the current status based on time entries
 */
const determineStatus = (entries) => {
  if (!entries || entries.length === 0) {
    return {
      currentStatus: null,
      availableActions: ['kommen', 'remote_start'],
      statusText: 'Keine Zeiterfassung heute',
      statusStartTime: null
    };
  }
  
  // Get the last entry
  const lastEntry = entries[entries.length - 1];
  
  // Check the action type of the last entry
  if (lastEntry.action_type === 'kommen') {
    return {
      currentStatus: 'working',
      availableActions: ['gehen', 'pause_start'],
      statusText: 'Anwesend seit',
      statusStartTime: new Date(lastEntry.timestamp)
    };
  } else if (lastEntry.action_type === 'pause_start') {
    return {
      currentStatus: 'break',
      availableActions: ['pause_end'],
      statusText: 'Pause seit',
      statusStartTime: new Date(lastEntry.timestamp)
    };
  } else if (lastEntry.action_type === 'pause_end') {
    return {
      currentStatus: 'working',
      availableActions: ['gehen', 'pause_start'],
      statusText: 'Zurück seit',
      statusStartTime: new Date(lastEntry.timestamp)
    };
  } else if (lastEntry.action_type === 'remote_start') {
    return {
      currentStatus: 'remote',
      availableActions: ['remote_end'],
      statusText: 'Mobiles Arbeiten seit',
      statusStartTime: new Date(lastEntry.timestamp)
    };
  } else if (lastEntry.action_type === 'gehen' || lastEntry.action_type === 'remote_end') {
    return {
      currentStatus: null,
      availableActions: ['kommen', 'remote_start'],
      statusText: 'Arbeitszeit beendet',
      statusStartTime: null
    };
  }
  
  // Default fallback
  return {
    currentStatus: null,
    availableActions: ['kommen', 'remote_start'],
    statusText: 'Status unbekannt',
    statusStartTime: null
  };
};

/**
 * Create a new time entry
 */
export const createTimeEntry = async (userId, companyId, departmentIds, actionType, notes = null) => {
  try {
    // Validate inputs
    if (!userId) throw new Error('Benutzer-ID fehlt');
    if (!companyId) throw new Error('Unternehmens-ID fehlt');
    if (!departmentIds || !departmentIds.length) throw new Error('Abteilungs-IDs fehlen');
    if (!actionType) throw new Error('Aktionstyp fehlt');
    
    // Validate action type
    const validActions = ['kommen', 'gehen', 'pause_start', 'pause_end', 'remote_start', 'remote_end'];
    if (!validActions.includes(actionType)) {
      throw new Error(`Ungültiger Aktionstyp: ${actionType}`);
    }
    
    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Check if the action is valid based on current status
    const { data: status } = await getCurrentTimeStatus(userId);
    
    if (!status.availableActions.includes(actionType)) {
      throw new Error(`Aktion ${actionType} ist im aktuellen Status nicht erlaubt`);
    }
    
    // Create new time entry
    const { data, error } = await supabase
      .from('time_entries_9f2d81ac56')
      .insert({
        user_id: userId,
        company_id: companyId,
        department_ids: departmentIds,
        action_type: actionType,
        notes: notes ? notes.trim() : null,
        source: 'web',
        timestamp: new Date().toISOString(),
        date: today
      })
      .select();
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error creating time entry:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Get daily summary for a user
 */
export const getDailySummary = async (userId, date = null) => {
  try {
    // If no date provided, use today
    const queryDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('time_daily_summaries_9f2d81ac56')
      .select('*')
      .eq('user_id', userId)
      .eq('date', queryDate)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    
    // If no summary exists yet, return zeros
    if (!data) {
      return { 
        success: true, 
        data: {
          total_work_seconds: 0,
          total_break_seconds: 0,
          total_remote_seconds: 0,
          date: queryDate
        }, 
        error: null 
      };
    }
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error getting daily summary:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Format seconds as HH:MM:SS
 */
export const formatDuration = (seconds) => {
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

/**
 * Format seconds as HH:MM (without seconds)
 */
export const formatHoursMinutes = (seconds) => {
  if (!seconds) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0')
  ].join(':');
};