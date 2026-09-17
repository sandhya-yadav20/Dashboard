"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  account,
  ensureProfile,
  getCurrentAccount,
  getProfileByUserId,
  ID,
  isAppwriteReady,
} from "./auth-helpers";
import {
  DEMO_ACCOUNTS,
  findDemoAccount,
  profileFromAccount,
} from "./credentials";
import type { Profile, UserRole } from "./types";

type AuthContextValue = {
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
  login: (email: string, password: string) => Promise<Profile | null>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<Profile>;
  logout: () => Promise<void>;
  useDemo: (role?: UserRole) => Profile;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_KEY = "campusfix_session_v2";

const DEMO_PROFILES: Record<UserRole, Profile> = {
  student: profileFromAccount(DEMO_ACCOUNTS[2]),
  worker: profileFromAccount(DEMO_ACCOUNTS[1]),
  admin: profileFromAccount(DEMO_ACCOUNTS[0]),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isAppwriteReady();

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      if (configured) {
        const user = await getCurrentAccount();
        if (user) {
          const p = await getProfileByUserId(user.$id);
          setProfile(p);
          setLoading(false);
          return;
        }
      }
      // Restore only if user previously signed in — never auto-login as volunteer
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(DEMO_KEY);
        setProfile(raw ? (JSON.parse(raw) as Profile) : null);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const login = async (email: string, password: string) => {
    const demo = findDemoAccount(email, password);
    if (demo) {
      const p = profileFromAccount(demo);
      localStorage.setItem(DEMO_KEY, JSON.stringify(p));
      setProfile(p);
      return p;
    }

    if (!configured) {
      throw new Error("Wrong email or password.");
    }

    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    const p = await getProfileByUserId(user.$id);
    setProfile(p);
    localStorage.removeItem(DEMO_KEY);
    return p;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => {
    if (!configured) {
      throw new Error("Connect Appwrite before registering new users.");
    }
    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    const p = await ensureProfile({
      userId: user.$id,
      name,
      email,
      role,
    });
    setProfile(p);
    localStorage.removeItem(DEMO_KEY);
    return p;
  };

  const logout = async () => {
    if (configured) {
      try {
        await account.deleteSession("current");
      } catch {
        /* ignore */
      }
    }
    localStorage.removeItem(DEMO_KEY);
    setProfile(null);
  };

  const useDemo = (role: UserRole = "student") => {
    const p = DEMO_PROFILES[role];
    localStorage.setItem(DEMO_KEY, JSON.stringify(p));
    setProfile(p);
    return p;
  };

  const value = useMemo(
    () => ({ profile, loading, configured, login, register, logout, useDemo }),
    [profile, loading, configured],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
