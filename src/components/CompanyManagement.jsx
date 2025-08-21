import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { 
  getCompanyByOwner, 
  getAllCompanies, 
  updateCompany, 
  deleteCompany,
  getCompanyUsers,
  createCompany
} from '../lib/company';

const { 
  FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiCreditCard, FiFileText, 
  FiSave, FiX, FiAlertTriangle, FiUsers, FiCheck, FiBuilding
} = FiIcons;

const CompanyManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile] = useOutletContext() || [{}];
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBilling, setShowBilling] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Edit/Delete states
  const [editingCompany, setEditingCompany] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ companyId: null, confirmText: '', isOpen: false });
  const [companyUsers, setCompanyUsers] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  
  // Create company states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', industry: '' });

  // Check if this is the billing route
  useEffect(() => {
    if (location.pathname === '/billing') {
      setShowBilling(true);
    } else {
      setShowBilling(false);
    }
  }, [location.pathname]);

  // Check if user has specific role
  const isSuperAdmin = userProfile?.profile?.app_role === 'Superadmin';
  const isOwner = userProfile?.profile?.app_role === 'Owner';

  // Fetch companies based on user role
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        
        if (isSuperAdmin) {
          // For Superadmin: Get all companies from database
          const result = await getAllCompanies();
          if (result.success) {
            setCompanies(result.data || []);
            
            // Load user counts for each company
            const userCounts = {};
            for (const company of result.data || []) {
              const usersResult = await getCompanyUsers(company.id);
              if (usersResult.success) {
                userCounts[company.id] = usersResult.data || [];
              }
            }
            setCompanyUsers(userCounts);
          } else {
            throw new Error(result.error || 'Failed to fetch companies');
          }
        } else if (isOwner) {
          // For Owner: Show only their company
          const userId = userProfile?.user?.id;
          if (!userId) {
            throw new Error('User ID not found');
          }
          
          const result = await getCompanyByOwner(userId);
          if (result.success && result.data) {
            setCompanies([result.data]);
            
            // Load user count for owner's company
            const usersResult = await getCompanyUsers(result.data.id);
            if (usersResult.success) {
              setCompanyUsers({ [result.data.id]: usersResult.data || [] });
            }
          } else {
            setCompanies([]);
          }
        } else {
          // Other roles shouldn't access this page
          setCompanies([]);
          setError('Sie haben keine Berechtigung, Unternehmensinformationen anzuzeigen');
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Fehler beim Laden der Unternehmensdaten');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [userProfile, isSuperAdmin, isOwner]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle create company
  const handleCreateCompany = async () => {
    if (!createForm.name?.trim()) {
      setError('Firmenname ist erforderlich');
      return;
    }

    setActionLoading(true);
    try {
      const result = await createCompany(createForm.name.trim(), createForm.industry?.trim() || null);

      if (result.success) {
        // Add to local state
        setCompanies(prev => [result.data, ...prev]);
        setCompanyUsers(prev => ({ ...prev, [result.data.id]: [] }));
        setShowCreateForm(false);
        setCreateForm({ name: '', industry: '' });
        setSuccessMessage(`Unternehmen "${result.data.name}" wurde erfolgreich erstellt.`);
        setError(null);
      } else {
        throw new Error(result.error || 'Fehler beim Erstellen des Unternehmens');
      }
    } catch (err) {
      console.error('Error creating company:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit company
  const handleEditCompany = (company) => {
    setEditingCompany(company.id);
    setEditForm({
      name: company.name || '',
      industry: company.industry || ''
    });
  };

  // Handle save edit
  const handleSaveEdit = async (companyId) => {
    if (!editForm.name?.trim()) {
      setError('Firmenname ist erforderlich');
      return;
    }

    setActionLoading(true);
    try {
      const result = await updateCompany(companyId, {
        name: editForm.name.trim(),
        industry: editForm.industry?.trim() || null
      });

      if (result.success) {
        // Update local state
        setCompanies(prev => prev.map(company => 
          company.id === companyId 
            ? { ...company, ...result.data }
            : company
        ));
        setEditingCompany(null);
        setSuccessMessage(`Unternehmen "${result.data.name}" wurde erfolgreich aktualisiert.`);
        setError(null);
      } else {
        throw new Error(result.error || 'Fehler beim Aktualisieren des Unternehmens');
      }
    } catch (err) {
      console.error('Error updating company:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCompany(null);
    setEditForm({});
    setError(null);
  };

  // Handle delete confirmation
  const handleDeleteClick = (companyId) => {
    const users = companyUsers[companyId] || [];
    const activeUsers = users.filter(user => user.is_active !== false);
    
    if (activeUsers.length > 0) {
      setError(`Das Unternehmen kann nicht gelöscht werden. Es sind noch ${activeUsers.length} aktive Benutzer zugeordnet. Deaktivieren Sie zuerst alle Benutzer.`);
      return;
    }

    setDeleteConfirm({
      companyId,
      confirmText: '',
      isOpen: true
    });
    setError(null);
  };

  // Handle delete company
  const handleDeleteCompany = async () => {
    if (deleteConfirm.confirmText !== 'delete') {
      setError('Bitte geben Sie "delete" ein, um das Löschen zu bestätigen');
      return;
    }

    setActionLoading(true);
    try {
      const companyToDelete = companies.find(c => c.id === deleteConfirm.companyId);
      const result = await deleteCompany(deleteConfirm.companyId);
      
      if (result.success) {
        // Remove from local state
        setCompanies(prev => prev.filter(company => company.id !== deleteConfirm.companyId));
        setCompanyUsers(prev => {
          const updated = { ...prev };
          delete updated[deleteConfirm.companyId];
          return updated;
        });
        setDeleteConfirm({ companyId: null, confirmText: '', isOpen: false });
        setSuccessMessage(`Unternehmen "${companyToDelete?.name}" wurde erfolgreich gelöscht.`);
        setError(null);
      } else {
        throw new Error(result.error || 'Fehler beim Löschen des Unternehmens');
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirm({ companyId: null, confirmText: '', isOpen: false });
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Billing view
  if (showBilling) {
    if (!companies.length) {
      return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-center p-8">
            <p>Keine Abrechnungsinformationen gefunden.</p>
          </div>
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
            <h2 className="text-2xl font-bold">Abrechnung</h2>
            <button 
              className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <SafeIcon icon={FiCreditCard} className="w-5 h-5 mr-2" />
              Zahlungsmethode ändern
            </button>
          </div>
          
          {/* Current plan */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3 text-slate-200">Aktueller Tarif</h3>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                      <SafeIcon icon={FiDollarSign} className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-medium">Enterprise</h4>
                      <p className="text-slate-300">499 € / Monat</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <p className="text-sm text-slate-300">Nächste Abrechnung</p>
                  <p>{new Date('2024-06-15').toLocaleDateString('de-DE')}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment methods */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3 text-slate-200">Zahlungsmethoden</h3>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <SafeIcon icon={FiCreditCard} className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">VISA ****4242</p>
                    <p className="text-sm text-slate-300">Läuft ab: 06/2025</p>
                  </div>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 rounded-lg text-xs bg-green-600/30 text-green-300">Standard</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Billing history */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-slate-200">Rechnungsverlauf</h3>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left">Datum</th>
                    <th className="px-4 py-3 text-left">Beschreibung</th>
                    <th className="px-4 py-3 text-right">Betrag</th>
                    <th className="px-4 py-3 text-right">Rechnung</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3">01.05.2024</td>
                    <td className="px-4 py-3">Enterprise Plan - Mai 2024</td>
                    <td className="px-4 py-3 text-right">499,00 €</td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <SafeIcon icon={FiFileText} className="w-5 h-5 text-blue-300" />
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3">01.04.2024</td>
                    <td className="px-4 py-3">Enterprise Plan - April 2024</td>
                    <td className="px-4 py-3 text-right">499,00 €</td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <SafeIcon icon={FiFileText} className="w-5 h-5 text-blue-300" />
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3">01.03.2024</td>
                    <td className="px-4 py-3">Enterprise Plan - März 2024</td>
                    <td className="px-4 py-3 text-right">499,00 €</td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <SafeIcon icon={FiFileText} className="w-5 h-5 text-blue-300" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Company management view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Unternehmen verwalten</h2>
          {isSuperAdmin && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
              Unternehmen hinzufügen
            </button>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 flex items-start"
          >
            <SafeIcon icon={FiCheck} className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-green-200">{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-400 hover:text-green-300"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Error Display */}
        {error && !editingCompany && !deleteConfirm.isOpen && !showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start"
          >
            <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-200">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        
        {companies.length === 0 ? (
          <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
            <SafeIcon icon={FiBuilding} className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-300">Keine Unternehmen gefunden.</p>
            {isSuperAdmin && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Erstes Unternehmen erstellen
              </button>
            )}
          </div>
        ) : (
          /* Companies table */
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Branche</th>
                    <th className="px-4 py-3 text-left">Erstellt am</th>
                    {isSuperAdmin && (
                      <th className="px-4 py-3 text-left">Benutzer</th>
                    )}
                    <th className="px-4 py-3 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map(company => {
                    const users = companyUsers[company.id] || [];
                    const activeUsers = users.filter(user => user.is_active !== false);
                    
                    return (
                      <tr key={company.id} className="border-b border-white/5">
                        <td className="px-4 py-3">
                          {editingCompany === company.id ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Firmenname"
                            />
                          ) : (
                            company.name
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingCompany === company.id ? (
                            <input
                              type="text"
                              value={editForm.industry}
                              onChange={(e) => setEditForm(prev => ({ ...prev, industry: e.target.value }))}
                              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Branche"
                            />
                          ) : (
                            company.industry || '-'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(company.created_at).toLocaleDateString('de-DE')}
                        </td>
                        {isSuperAdmin && (
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <SafeIcon icon={FiUsers} className="w-4 h-4 mr-1 text-blue-300" />
                              <span className="text-sm">
                                {users.length} ({activeUsers.length} aktiv)
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {editingCompany === company.id ? (
                              <>
                                <button 
                                  onClick={() => handleSaveEdit(company.id)}
                                  disabled={actionLoading}
                                  className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                                  title="Speichern"
                                >
                                  {actionLoading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-green-300 rounded-full border-t-transparent"></div>
                                  ) : (
                                    <SafeIcon icon={FiSave} className="w-5 h-5 text-green-300" />
                                  )}
                                </button>
                                <button 
                                  onClick={handleCancelEdit}
                                  disabled={actionLoading}
                                  className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                                  title="Abbrechen"
                                >
                                  <SafeIcon icon={FiX} className="w-5 h-5 text-red-300" />
                                </button>
                              </>
                            ) : (
                              <>
                                {isSuperAdmin && (
                                  <button 
                                    onClick={() => handleEditCompany(company)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Bearbeiten"
                                  >
                                    <SafeIcon icon={FiEdit2} className="w-5 h-5 text-blue-300" />
                                  </button>
                                )}
                                {isSuperAdmin && (
                                  <button 
                                    onClick={() => handleDeleteClick(company.id)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Löschen"
                                  >
                                    <SafeIcon icon={FiTrash2} className="w-5 h-5 text-red-300" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Company Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl max-w-md w-full"
            >
              <div className="flex items-center mb-4">
                <SafeIcon icon={FiBuilding} className="w-6 h-6 text-blue-400 mr-3" />
                <h3 className="text-lg font-bold">Neues Unternehmen erstellen</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="company-name" className="block text-sm font-medium text-slate-200 mb-1">
                    Firmenname *
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Musterfirma GmbH"
                  />
                </div>
                
                <div>
                  <label htmlFor="company-industry" className="block text-sm font-medium text-slate-200 mb-1">
                    Branche
                  </label>
                  <input
                    id="company-industry"
                    type="text"
                    value={createForm.industry}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Technologie, Marketing, Beratung"
                  />
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateForm({ name: '', industry: '' });
                    setError(null);
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreateCompany}
                  disabled={actionLoading || !createForm.name?.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                      Erstellen...
                    </>
                  ) : (
                    'Erstellen'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl max-w-md w-full"
            >
              <div className="flex items-center mb-4">
                <SafeIcon icon={FiAlertTriangle} className="w-6 h-6 text-red-400 mr-3" />
                <h3 className="text-lg font-bold">Unternehmen löschen</h3>
              </div>
              
              <p className="text-slate-300 mb-4">
                Sind Sie sicher, dass Sie dieses Unternehmen löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-red-300 text-sm font-medium">⚠️ Warnung:</p>
                <ul className="text-red-200 text-sm mt-1 list-disc list-inside">
                  <li>Alle Abteilungen werden gelöscht</li>
                  <li>Alle Zeiterfassungsdaten werden gelöscht</li>
                  <li>Alle Benutzer-Zuordnungen werden entfernt</li>
                </ul>
              </div>
              
              <p className="text-sm text-slate-400 mb-4">
                Geben Sie <strong>"delete"</strong> ein, um das Löschen zu bestätigen:
              </p>
              
              <input
                type="text"
                value={deleteConfirm.confirmText}
                onChange={(e) => setDeleteConfirm(prev => ({ ...prev, confirmText: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="delete"
              />
              
              {error && (
                <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteCompany}
                  disabled={actionLoading || deleteConfirm.confirmText !== 'delete'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                      Löschen...
                    </>
                  ) : (
                    'Löschen'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CompanyManagement;