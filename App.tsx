import React, { createContext, useContext, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, User, UserRole } from './types';
import { dbService } from './services/dbService';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/Auth';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PaymentSimulation } from './pages/PaymentSimulation';

// --- Auth Context ---
const AuthContext = createContext<AuthState | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// --- Protected Route Wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: UserRole }> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect User attempting to access Admin pages back to User Dashboard
    return <Navigate to="/user" replace />;
  }
  return <>{children}</>;
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for "session" (simple persistence)
    const storedEmail = localStorage.getItem('ngo_current_email');
    if (storedEmail) {
      const foundUser = dbService.findUserByEmail(storedEmail);
      if (foundUser) setUser(foundUser);
    }
  }, []);

  const login = async (email: string) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));

    const foundUser = dbService.findUserByEmail(email);
    if (!foundUser) throw new Error("User not found. Please register.");

    setUser(foundUser);
    localStorage.setItem('ngo_current_email', email);
    return true;
  };

  const register = async (name: string, email: string, password: string) => {
    await new Promise(r => setTimeout(r, 500));
    const newUser = dbService.createUser(name, email, password);
    setUser(newUser);
    localStorage.setItem('ngo_current_email', email);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ngo_current_email');
  };

  const authState: AuthState = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={authState}>
      <HashRouter>
        <Routes>
          <Route path="/payment-gateway" element={<PaymentSimulation />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/login" element={!user ? <AuthPage /> : <Navigate to={user.role === 'ADMIN' ? '/admin' : '/user'} />} />

                <Route
                  path="/user"
                  element={
                    <ProtectedRoute requiredRole={UserRole.USER}>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole={UserRole.ADMIN}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
