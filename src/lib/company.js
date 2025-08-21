// company.js - Enhanced with better error handling and validation
import supabase from './supabase';

/**
 * Fetch company by owner ID
 */
export const getCompanyByOwner = async (ownerId) => {
  try {
    const { data, error } = await supabase
      .from('companies_28d7f5a9c4')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error fetching company:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Get all companies (for Superadmin)
 */
export const getAllCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from('companies_28d7f5a9c4')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error fetching all companies:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Get all users associated with a company
 */
export const getCompanyUsers = async (companyId) => {
  try {
    // Get all departments for this company
    const { data: departments, error: deptError } = await supabase
      .from('departments_28d7f5a9c4')
      .select('id')
      .eq('company_id', companyId);
    
    if (deptError) throw deptError;
    
    if (!departments || departments.length === 0) {
      return { success: true, data: [], error: null };
    }
    
    const departmentIds = departments.map(dept => dept.id);
    
    // Get all users in these departments
    const { data: userDepartments, error: userDeptError } = await supabase
      .from('user_departments_28d7f5a9c4')
      .select(`
        user_id,
        profiles_fec4a7b9d6 (
          id,
          app_role,
          is_active
        )
      `)
      .in('department_id', departmentIds);
    
    if (userDeptError) throw userDeptError;
    
    // Get unique users with their profile information
    const uniqueUsers = [];
    const userIds = new Set();
    
    for (const userDept of userDepartments || []) {
      if (!userIds.has(userDept.user_id)) {
        userIds.add(userDept.user_id);
        
        try {
          // Get user email from auth.users
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userDept.user_id);
          
          uniqueUsers.push({
            user_id: userDept.user_id,
            email: authUser?.user?.email || 'Unknown',
            app_role: userDept.profiles_fec4a7b9d6?.app_role,
            is_active: userDept.profiles_fec4a7b9d6?.is_active !== false // Default to true if null
          });
        } catch (authError) {
          console.warn('Could not get user email for user:', userDept.user_id);
          uniqueUsers.push({
            user_id: userDept.user_id,
            email: 'Unknown',
            app_role: userDept.profiles_fec4a7b9d6?.app_role,
            is_active: userDept.profiles_fec4a7b9d6?.is_active !== false
          });
        }
      }
    }
    
    return { success: true, data: uniqueUsers, error: null };
  } catch (error) {
    console.error('Error fetching company users:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Create a new company
 */
export const createCompany = async (name, industry = null) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    
    // Validate input
    if (!name || name.trim().length === 0) {
      throw new Error('Company name is required');
    }
    
    // Check if user already has a company (only owners should have companies)
    const { data: existingCompany } = await supabase
      .from('companies_28d7f5a9c4')
      .select('id')
      .eq('owner_id', userData.user.id)
      .single();
      
    if (existingCompany) {
      throw new Error('User already has a company');
    }
    
    const { data, error } = await supabase
      .from('companies_28d7f5a9c4')
      .insert({
        name: name.trim(),
        industry: industry?.trim() || null,
        owner_id: userData.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error creating company:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Update an existing company
 */
export const updateCompany = async (companyId, updates) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    
    // Validate input
    if (updates.name && updates.name.trim().length === 0) {
      throw new Error('Company name cannot be empty');
    }
    
    // Get user role
    const { data: profile } = await supabase
      .from('profiles_fec4a7b9d6')
      .select('app_role')
      .eq('id', userData.user.id)
      .single();
      
    if (!profile) throw new Error('User profile not found');
    
    // Check if user is allowed to update this company
    if (profile.app_role !== 'Superadmin') {
      const { data: company } = await supabase
        .from('companies_28d7f5a9c4')
        .select('owner_id')
        .eq('id', companyId)
        .single();
        
      if (!company || company.owner_id !== userData.user.id) {
        throw new Error('Not authorized to update this company');
      }
    }
    
    // Prepare update data
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Clean up the data
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.industry) updateData.industry = updateData.industry.trim();
    
    const { data, error } = await supabase
      .from('companies_28d7f5a9c4')
      .update(updateData)
      .eq('id', companyId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error updating company:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Delete a company (only if no active users)
 */
export const deleteCompany = async (companyId) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    
    // Get user role
    const { data: profile } = await supabase
      .from('profiles_fec4a7b9d6')
      .select('app_role')
      .eq('id', userData.user.id)
      .single();
      
    if (!profile) throw new Error('User profile not found');
    
    // Only Superadmin can delete companies
    if (profile.app_role !== 'Superadmin') {
      throw new Error('Only Superadmin can delete companies');
    }
    
    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies_28d7f5a9c4')
      .select('id, name')
      .eq('id', companyId)
      .single();
    
    if (companyError || !company) {
      throw new Error('Company not found');
    }
    
    // Check if company has any active users
    const usersResult = await getCompanyUsers(companyId);
    if (!usersResult.success) {
      throw new Error('Failed to check company users');
    }
    
    const activeUsers = usersResult.data.filter(user => user.is_active !== false);
    if (activeUsers.length > 0) {
      throw new Error(`Cannot delete company "${company.name}". ${activeUsers.length} active users are still associated with this company. Please deactivate all users first.`);
    }
    
    // Start transaction-like deletion
    // First, delete all time entries for users in this company
    const { error: timeEntriesError } = await supabase
      .from('time_entries_9f2d81ac56')
      .delete()
      .eq('company_id', companyId);
    
    if (timeEntriesError) {
      console.warn('Warning: Could not delete time entries:', timeEntriesError.message);
    }
    
    // Delete all time summaries for this company
    const { error: summariesError } = await supabase
      .from('time_daily_summaries_9f2d81ac56')
      .delete()
      .eq('company_id', companyId);
    
    if (summariesError) {
      console.warn('Warning: Could not delete time summaries:', summariesError.message);
    }
    
    // Delete all user-department relationships for departments in this company
    const { data: departments } = await supabase
      .from('departments_28d7f5a9c4')
      .select('id')
      .eq('company_id', companyId);
    
    if (departments && departments.length > 0) {
      const departmentIds = departments.map(d => d.id);
      
      const { error: userDeptError } = await supabase
        .from('user_departments_28d7f5a9c4')
        .delete()
        .in('department_id', departmentIds);
      
      if (userDeptError) {
        console.warn('Warning: Could not delete user-department relationships:', userDeptError.message);
      }
    }
    
    // Delete all departments (this should cascade properly due to foreign keys)
    const { error: deptDeleteError } = await supabase
      .from('departments_28d7f5a9c4')
      .delete()
      .eq('company_id', companyId);
    
    if (deptDeleteError) {
      throw new Error(`Failed to delete company departments: ${deptDeleteError.message}`);
    }
    
    // Finally, delete the company
    const { error } = await supabase
      .from('companies_28d7f5a9c4')
      .delete()
      .eq('id', companyId);
    
    if (error) {
      throw new Error(`Failed to delete company: ${error.message}`);
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting company:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all departments for a company
 */
export const getDepartmentsByCompany = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('departments_28d7f5a9c4')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error fetching departments:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Create a new department
 */
export const createDepartment = async (companyId, name) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    
    // Validate input
    if (!name || name.trim().length === 0) {
      throw new Error('Department name is required');
    }
    
    // Get user role
    const { data: profile } = await supabase
      .from('profiles_fec4a7b9d6')
      .select('app_role')
      .eq('id', userData.user.id)
      .single();
      
    if (!profile) throw new Error('User profile not found');
    
    // Check if user is allowed to create departments in this company
    if (profile.app_role !== 'Superadmin' && profile.app_role !== 'Owner') {
      throw new Error('Only Owners and Superadmins can create departments');
    }
    
    if (profile.app_role === 'Owner') {
      // Verify owner owns this company
      const { data: company } = await supabase
        .from('companies_28d7f5a9c4')
        .select('id')
        .eq('id', companyId)
        .eq('owner_id', userData.user.id)
        .single();
        
      if (!company) {
        throw new Error('Not authorized to create departments in this company');
      }
    }
    
    const { data, error } = await supabase
      .from('departments_28d7f5a9c4')
      .insert({
        name: name.trim(),
        company_id: companyId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error creating department:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Update a department
 */
export const updateDepartment = async (departmentId, name) => {
  try {
    if (!name || name.trim().length === 0) {
      throw new Error('Department name is required');
    }
    
    const { data, error } = await supabase
      .from('departments_28d7f5a9c4')
      .update({ 
        name: name.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', departmentId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error updating department:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Delete a department
 */
export const deleteDepartment = async (departmentId) => {
  try {
    // First, remove all user assignments from this department
    const { error: userDeptError } = await supabase
      .from('user_departments_28d7f5a9c4')
      .delete()
      .eq('department_id', departmentId);
    
    if (userDeptError) {
      console.warn('Warning: Could not delete user-department relationships:', userDeptError.message);
    }
    
    // Then delete the department
    const { error } = await supabase
      .from('departments_28d7f5a9c4')
      .delete()
      .eq('id', departmentId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting department:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Assign a user to a department
 */
export const assignUserToDepartment = async (userId, departmentId) => {
  try {
    const { data, error } = await supabase
      .from('user_departments_28d7f5a9c4')
      .insert({
        user_id: userId,
        department_id: departmentId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error assigning user to department:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Remove a user from a department
 */
export const removeUserFromDepartment = async (userId, departmentId) => {
  try {
    const { error } = await supabase
      .from('user_departments_28d7f5a9c4')
      .delete()
      .match({ user_id: userId, department_id: departmentId });
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing user from department:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all departments a user belongs to
 */
export const getUserDepartments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_departments_28d7f5a9c4')
      .select(`
        department_id,
        departments_28d7f5a9c4 (
          id,
          name,
          company_id,
          companies_28d7f5a9c4 (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { 
      success: true, 
      data: data.map(item => ({
        departmentId: item.department_id,
        department: item.departments_28d7f5a9c4
      })), 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching user departments:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Get all users in a department
 */
export const getDepartmentUsers = async (departmentId) => {
  try {
    const { data, error } = await supabase
      .from('user_departments_28d7f5a9c4')
      .select(`
        user_id,
        profiles_fec4a7b9d6 (
          id,
          app_role,
          is_active
        )
      `)
      .eq('department_id', departmentId);
    
    if (error) throw error;
    
    // Get user emails from auth.users for each user
    const usersWithEmails = [];
    
    for (const item of data || []) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(item.user_id);
        
        usersWithEmails.push({
          userId: item.user_id,
          role: item.profiles_fec4a7b9d6?.app_role,
          email: authUser?.user?.email || 'Unknown',
          is_active: item.profiles_fec4a7b9d6?.is_active !== false
        });
      } catch (authError) {
        console.warn('Could not get user email for user:', item.user_id);
        usersWithEmails.push({
          userId: item.user_id,
          role: item.profiles_fec4a7b9d6?.app_role,
          email: 'Unknown',
          is_active: item.profiles_fec4a7b9d6?.is_active !== false
        });
      }
    }
    
    return { 
      success: true, 
      data: usersWithEmails, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching department users:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Deactivate a user (set is_active to false)
 */
export const deactivateUser = async (userId) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    
    // Get current user's role
    const { data: profile } = await supabase
      .from('profiles_fec4a7b9d6')
      .select('app_role')
      .eq('id', userData.user.id)
      .single();
      
    if (!profile) throw new Error('User profile not found');
    
    // Only Superadmin and Owner can deactivate users
    if (!['Superadmin', 'Owner'].includes(profile.app_role)) {
      throw new Error('Not authorized to deactivate users');
    }
    
    const { data, error } = await supabase
      .from('profiles_fec4a7b9d6')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error deactivating user:', error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Activate a user (set is_active to true)
 */
export const activateUser = async (userId) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    
    // Get current user's role
    const { data: profile } = await supabase
      .from('profiles_fec4a7b9d6')
      .select('app_role')
      .eq('id', userData.user.id)
      .single();
      
    if (!profile) throw new Error('User profile not found');
    
    // Only Superadmin and Owner can activate users
    if (!['Superadmin', 'Owner'].includes(profile.app_role)) {
      throw new Error('Not authorized to activate users');
    }
    
    const { data, error } = await supabase
      .from('profiles_fec4a7b9d6')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error activating user:', error);
    return { success: false, data: null, error: error.message };
  }
};