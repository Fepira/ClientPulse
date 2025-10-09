import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const TestModeContext = createContext(undefined);

export const TestModeProvider = ({ children }) => {
  const [isTestMode, setIsTestMode] = useState(false);
  const [testModeCompany, setTestModeCompany] = useState(null);

  const enterTestMode = useCallback((company) => {
    setTestModeCompany(company);
    setIsTestMode(true);
  }, []);

  const exitTestMode = useCallback(() => {
    setIsTestMode(false);
    setTestModeCompany(null);
  }, []);

  const value = useMemo(() => ({
    isTestMode,
    testModeCompany,
    enterTestMode,
    exitTestMode,
  }), [isTestMode, testModeCompany, enterTestMode, exitTestMode]);

  return (
    <TestModeContext.Provider value={value}>
      {children}
    </TestModeContext.Provider>
  );
};

export const useTestMode = () => {
  const context = useContext(TestModeContext);
  if (context === undefined) {
    throw new Error('useTestMode must be used within a TestModeProvider');
  }
  return context;
};