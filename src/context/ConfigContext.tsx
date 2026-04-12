import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';

interface Features {
  lazyPeepsEnabled: boolean;
  assignmentEnabled: boolean;
  [key: string]: boolean | string | number | object;
}

interface ConfigContextType {
  features: Features;
  loading: boolean;
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

interface ConfigProviderProps {
  children: React.ReactNode;
}

import { useAuthStore } from '@/features/auth';

// ...

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const [features, setFeatures] = useState<Features>({
    lazyPeepsEnabled: false,
    assignmentEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONFIG.PUBLIC);
      const data = response.data?.data || {};
      
      // Map API keys to internal feature flags
      setFeatures({
        lazyPeepsEnabled: !!data.feature_lazypeeps_enabled,
        assignmentEnabled: !!data.feature_assignment_enabled,
        ...data,
      });
    } catch (error) {
      console.error('Failed to fetch config:', error);
      // Keep defaults on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [isAuthenticated]);

  const refreshConfig = async () => {
    await fetchConfig();
  };

  return (
    <ConfigContext.Provider value={{ features, loading, refreshConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
