export const authUtils = {
  setUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearAuth: () => {
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    const user = authUtils.getUser();
    return !!user && !!user.token;
  },

  isSystemAdmin: (): boolean => {
    const user = authUtils.getUser();
    return user?.role === 'systemAdministrator';
  },

  isShopManager: (): boolean => {
    const user = authUtils.getUser();
    return user?.role === 'shopManager';
  },

  getAuthHeaders: () => {
    const user = authUtils.getUser();
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  },
};