import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Verify token by fetching user profile
          const res = await api.get('/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (error) {
          console.error("Token invalid", error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    const { token } = res.data;
    localStorage.setItem('auth_token', token);
    
    // Fetch user data after login
    const userRes = await api.get('/me');
    const userData = userRes.data;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, password_confirmation) => {
    await api.post('/register', { name, email, password, password_confirmation });
    // After register, login to get token
    await login(email, password);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (major_id, student_id, semester) => {
    const res = await api.patch('/profile', { 
      major_id, 
      student_id, 
      semester 
    });
    const updatedUser = res.data.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
