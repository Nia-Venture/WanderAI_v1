import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  name: string;
  account_type: 'traveller' | 'local';
  created_at: string;
}

export interface LocalSignUpData {
  name: string;
  email: string;
  password: string;
  city: string;
  years_local: number;
  languages: string;
  bio: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUpTraveller: (name: string, email: string, password: string) => Promise<void>;
  signUpLocal: (data: LocalSignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  authLoading: true,
  signIn: async () => {},
  signUpTraveller: async () => {},
  signUpLocal: async () => {},
  signOut: async () => {},
});

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, name, account_type, created_at')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

// For OAuth users (Google), create a profile if one doesn't exist yet.
// Uses ignoreDuplicates to avoid a race with signUpTraveller/signUpLocal,
// which insert the profile right after auth.signUp() returns.
async function ensureProfile(user: User): Promise<Profile | null> {
  const existing = await fetchProfile(user.id);
  if (existing) return existing;

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'User';

  await supabase
    .from('profiles')
    .upsert({ id: user.id, name, account_type: 'traveller' }, { onConflict: 'id', ignoreDuplicates: true });

  return fetchProfile(user.id);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user).then((p) => {
          setProfile(p);
          setAuthLoading(false);
        });
      } else {
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const p = await ensureProfile(session.user);
          setProfile(p);
        } else {
          setProfile(null);
        }
        setAuthLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUpTraveller(name: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Registration failed — please try again.');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, name, account_type: 'traveller' });
    if (profileError) throw profileError;
  }

  async function signUpLocal(form: LocalSignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (error) throw error;
    if (!data.user) throw new Error('Registration failed — please try again.');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, name: form.name, account_type: 'local' });
    if (profileError) throw profileError;

    const { error: localError } = await supabase.from('local_profiles').insert({
      user_id: data.user.id,
      city: form.city,
      years_local: form.years_local,
      languages: form.languages,
      bio: form.bio,
      verification_status: 'pending',
    });
    if (localError) throw localError;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, authLoading, signIn, signUpTraveller, signUpLocal, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export async function trackCityVisit(userId: string, city: string): Promise<void> {
  await supabase.from('city_visits').insert({ user_id: userId, city: city.toLowerCase() });
}

export function useAuth() {
  return useContext(AuthContext);
}
