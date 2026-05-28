import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/services/supabase';
import { db, User } from '@/services/database';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapUser = (supabaseUser: any): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email!,
  fullName: supabaseUser.user_metadata?.full_name || '',
  avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(mapUser(session.user));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(mapUser(session.user));
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await db.login(email, password);
    setUser(loggedInUser);
  };

  const register = async (email: string, password: string, fullName: string) => {
    // Tidak set user di sini — tunggu konfirmasi email dulu
    await db.register(email, password, fullName);
  };

  const logout = async () => {
    await db.logout();
    setUser(null);
  };

  // Dipanggil setelah update foto/nama agar avatar di header langsung terupdate
  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) setUser(mapUser(data.user));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
