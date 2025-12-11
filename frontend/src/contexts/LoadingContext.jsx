import { createContext, useState, useContext, useCallback } from 'react';
import Loader from '../components/ui/Loader';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const value = {
    isLoading,
    startLoading,
    stopLoading,
  };
  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <Loader />}
    </LoadingContext.Provider>
  );
};
