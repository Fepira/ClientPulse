import React, { createContext, useContext, useState, useMemo } from 'react';

const UserRoleContext = createContext(undefined);

export const UserRoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const value = useMemo(() => ({
    role,
    company,
    loading,
    setRole,
    setCompany,
    setLoading
  }), [role, company, loading]);

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};