// auth.js
import supabase from './supabase';

/**
 * Registriert einen neuen User und übergibt die Rolle im user_metadata.
 * Der DB-Trigger übernimmt app_role direkt aus den user_metadata.
 * @param {string} email - E-Mail des Users
 * @param {string} password - Passwort des Users
 * @param {string} role - Benutzerrolle (z. B. Superadmin, Owner, Admin, User)
 */
export const registerUser = async (email, password, role) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { app_role: role } }, // Rolle an den Trigger übergeben
    });

    if (authError) throw authError;

    return { success: true, data: authData, error: null };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Meldet einen User an und lädt das Profil inkl. Rolle.
 * @param {string} email - E-Mail des Users
 * @param {string} password - Passwort des Users
 */
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Profil inkl. Rolle laden
    const { data: profileData, error: profileError } = await supabase
      .from('profiles_fec4a7b9d6')
      .select('app_role')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      success: true,
      data: { ...data, profile: profileData },
      error: null,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Meldet den aktuellen User ab.
 */
export const logoutUser = async () => {
  try {
    // Fix: Use the correct method to sign out
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
    
    // Add a small delay to allow the auth state to update properly
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Holt den aktuellen User inkl. Profilinformationen aus der Datenbank.
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) return { user: null, profile: null };

    const { data: profile, error: profileError } = await supabase
      .from('profiles_fec4a7b9d6')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    return { user, profile };
  } catch (error) {
    console.error('Get user error:', error);
    return { user: null, profile: null };
  }
};

/**
 * Prüft, ob der aktuelle Benutzer eine bestimmte Rolle hat
 * @param {string} role - Die zu prüfende Rolle
 * @returns {Promise<boolean>} - true, wenn der Benutzer die Rolle hat
 */
export const hasRole = async (role) => {
  const { user, profile } = await getCurrentUser();
  return user && profile && profile.app_role === role;
};

/**
 * Prüft, ob der aktuelle Benutzer eine der angegebenen Rollen hat
 * @param {string[]} roles - Array der zu prüfenden Rollen
 * @returns {Promise<boolean>} - true, wenn der Benutzer eine der Rollen hat
 */
export const hasAnyRole = async (roles) => {
  const { user, profile } = await getCurrentUser();
  return user && profile && roles.includes(profile.app_role);
};

/**
 * Prüft, ob der aktuelle Benutzer einen anderen Benutzer verwalten darf
 * @param {string} targetUserId - ID des Zielbenutzers
 * @returns {Promise<boolean>} - true, wenn der Benutzer den Zielbenutzer verwalten darf
 */
export const canManageUser = async (targetUserId) => {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return false;
    
    // Superadmin kann alle verwalten
    if (profile.app_role === 'Superadmin') return true;
    
    // Owner kann alle in seinem Unternehmen verwalten
    if (profile.app_role === 'Owner') {
      const { data: company } = await supabase
        .from('companies_28d7f5a9c4')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      
      if (!company) return false;
      
      // Prüfe, ob der Zielbenutzer in einer Abteilung des Unternehmens ist
      const { data: userDepartments } = await supabase
        .from('user_departments_28d7f5a9c4')
        .select(`
          department_id,
          departments_28d7f5a9c4 (
            company_id
          )
        `)
        .eq('user_id', targetUserId);
      
      return userDepartments?.some(
        dept => dept.departments_28d7f5a9c4?.company_id === company.id
      ) || false;
    }
    
    // Admin kann nur Benutzer in seinen Abteilungen verwalten
    if (profile.app_role === 'Admin') {
      // Hole die Abteilungen des Admins
      const { data: adminDepts } = await supabase
        .from('user_departments_28d7f5a9c4')
        .select('department_id')
        .eq('user_id', user.id);
      
      if (!adminDepts?.length) return false;
      
      const adminDeptIds = adminDepts.map(d => d.department_id);
      
      // Prüfe, ob der Zielbenutzer in einer der Abteilungen des Admins ist
      const { data: targetUserDepts } = await supabase
        .from('user_departments_28d7f5a9c4')
        .select('department_id')
        .eq('user_id', targetUserId)
        .in('department_id', adminDeptIds);
      
      return targetUserDepts?.length > 0 || false;
    }
    
    // Alle anderen Rollen können niemanden verwalten
    return false;
  } catch (error) {
    console.error('Error checking management permission:', error);
    return false;
  }
};

/**
 * Holt alle Unternehmen, die der aktuelle Benutzer sehen darf
 */
export const getAccessibleCompanies = async () => {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user) return { success: false, data: [], error: "Nicht angemeldet" };
    
    let query = supabase.from('companies_28d7f5a9c4').select('*');
    
    // Superadmin sieht alle Unternehmen
    if (profile.app_role === 'Superadmin') {
      // Keine Einschränkung
    } 
    // Owner sieht nur sein eigenes Unternehmen
    else if (profile.app_role === 'Owner') {
      query = query.eq('owner_id', user.id);
    } 
    // Admins und User sehen Unternehmen basierend auf ihren Abteilungen
    else {
      const { data: userDepts } = await supabase
        .from('user_departments_28d7f5a9c4')
        .select(`
          departments_28d7f5a9c4 (
            company_id
          )
        `)
        .eq('user_id', user.id);
      
      if (!userDepts?.length) {
        return { success: true, data: [], error: null };
      }
      
      const companyIds = [...new Set(
        userDepts
          .map(d => d.departments_28d7f5a9c4?.company_id)
          .filter(id => id)
      )];
      
      if (!companyIds.length) {
        return { success: true, data: [], error: null };
      }
      
      query = query.in('id', companyIds);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error fetching companies:', error);
    return { success: false, data: [], error: error.message };
  }
};