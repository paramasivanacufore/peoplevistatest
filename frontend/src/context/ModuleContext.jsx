import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllModules as fetchModulesApi } from '../utils/modules/apiUtils';

const ModuleContext = createContext();

export const useModules = () => {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error('useModules must be used within a ModuleProvider');
  return ctx;
};

export const ModuleProvider = ({ children }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchModulesApi();

      const newModules =
        Array.isArray(data?.data) ? data.data :
        Array.isArray(data) ? data :
        data.modules || [];

      setModules(newModules);
      setError(null);

    } catch (err) {
      console.error("ModuleContext fetch error:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch only once (no repeated polling)
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const value = {
    modules,
    loading,
    error,
    refreshModules: fetchModules, // manual refresh if needed
  };

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
};

export default ModuleContext;
