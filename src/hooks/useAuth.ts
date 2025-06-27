import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authUtils.isAuthenticated();
      const systemAdmin = authUtils.isSystemAdmin();
      const currentUser = authUtils.getUser();

      setIsAuthenticated(authenticated);
      setIsSystemAdmin(systemAdmin);
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (credentials: any) => {
    authUtils.setUser(credentials);
    setIsAuthenticated(true);
    setIsSystemAdmin(credentials.role === 'systemAdministrator');
    setUser(credentials);
    navigate('/dashboard');
  };

  const logout = () => {
    authUtils.clearAuth();
    setIsAuthenticated(false);
    setIsSystemAdmin(false);
    setUser(null);
    navigate('/login');
  };

  return {
    isAuthenticated,
    isSystemAdmin,
    user,
    loading,
    login,
    logout
  };
};