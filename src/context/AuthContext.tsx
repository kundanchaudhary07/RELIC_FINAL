import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { UserProfile, UserRole } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://relic-vpzf.onrender.com';

interface RegisterUserData {
  name: string;
  email: string;
  role: UserRole;
  badgeId: string;
  department: string;
  phoneNumber?: string;
  password?: string;
  registeredPhoto: string;
  station?: string;
}

interface BackendUser {
  id: number | string;
  name: string;
  email: string;
  badge_number: string;
  role: string;
  is_active: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  registeredUsers: UserProfile[];

  login: (
    badgeNumber: string,
    password: string,
    role?: UserRole
  ) => Promise<UserProfile>;

  loginUser: (userProfile: UserProfile) => void;

  loginWithGoogle: (
    role?: UserRole,
    googleProfile?: {
      name?: string;
      email?: string;
      photo?: string;
    }
  ) => UserProfile;

  signup: (userData: RegisterUserData) => UserProfile;

  findUserByEmailOrId: (
    identifier: string
  ) => UserProfile | undefined;

  updateUserPassword: (
    email: string,
    newPassword: string
  ) => boolean;

  logout: () => void;

  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const mapBackendUserToProfile = (
  backendUser: BackendUser
): UserProfile => {
  const role =
    backendUser.role === 'POLICE_OFFICER'
      ? 'POLICE_OFFICER'
      : 'CYBERCRIME_INVESTIGATOR';

  return {
    id: String(backendUser.id),

    name: backendUser.name,

    email: backendUser.email,

    role: role as UserRole,

    badgeId: backendUser.badge_number,

    badgeNumber: backendUser.badge_number,

    station: '',

    department: '',

    jurisdiction: '',

    avatar: '',

    registeredPhoto: '',

    phoneNumber: '',

  };
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] =
    useState<UserProfile[]>([]);

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [authLoading, setAuthLoading] =
    useState<boolean>(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('relic_access_token');

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          localStorage.removeItem('relic_access_token');
          localStorage.removeItem('relic_token_type');
          localStorage.removeItem('garuda_user');
          setUser(null);
          setAuthLoading(false);
          return;
        }

        const data = await response.json();

        if (!data.user) {
          throw new Error(
            'Invalid user response from server'
          );
        }

        const backendUser: BackendUser = data.user;

        if (!backendUser.is_active) {
          localStorage.removeItem('relic_access_token');
          localStorage.removeItem('relic_token_type');
          localStorage.removeItem('garuda_user');
          setUser(null);
          setAuthLoading(false);
          return;
        }

        const userProfile =
          mapBackendUserToProfile(backendUser);

        setUser(userProfile);
        setRegisteredUsers([userProfile]);

        localStorage.setItem(
          'garuda_user',
          JSON.stringify(userProfile)
        );
      } catch (error) {
        console.error(
          'Failed to restore authentication session:',
          error
        );

        localStorage.removeItem('relic_access_token');
        localStorage.removeItem('relic_token_type');
        localStorage.removeItem('garuda_user');

        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const findUserByEmailOrId = (
    identifier: string
  ): UserProfile | undefined => {
    if (!identifier) {
      return undefined;
    }

    const clean = identifier
      .trim()
      .toLowerCase();

    return registeredUsers.find(
      (u) =>
        u.email?.toLowerCase() === clean ||
        u.badgeId?.toLowerCase() === clean ||
        u.badgeNumber?.toLowerCase() === clean
    );
  };

  const login = async (
    badgeNumber: string,
    password: string,
    _role?: UserRole
  ): Promise<UserProfile> => {
    const cleanBadgeNumber = badgeNumber.trim();

    if (!cleanBadgeNumber) {
      throw new Error('Badge number is required');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            badge_number: cleanBadgeNumber,
            password: password,
          }),
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'Invalid badge number or password'
          );
        }

        if (response.status === 403) {
          throw new Error(
            'Officer account is inactive'
          );
        }

        throw new Error(
          data?.detail ||
            'Login failed. Please try again.'
        );
      }

      const loginData =
        data as LoginResponse;

      if (!loginData.access_token) {
        throw new Error(
          'Login succeeded but no access token was received'
        );
      }

      localStorage.setItem(
        'relic_access_token',
        loginData.access_token
      );

      localStorage.setItem(
        'relic_token_type',
        loginData.token_type || 'bearer'
      );

      const meResponse = await fetch(
        `${API_BASE_URL}/auth/me`,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${loginData.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!meResponse.ok) {
        localStorage.removeItem(
          'relic_access_token'
        );

        localStorage.removeItem(
          'relic_token_type'
        );

        throw new Error(
          'Unable to retrieve officer profile'
        );
      }

      const meData = await meResponse.json();

      if (!meData.user) {
        throw new Error(
          'Invalid officer profile received from server'
        );
      }

      const backendUser: BackendUser =
        meData.user;

      if (!backendUser.is_active) {
        localStorage.removeItem(
          'relic_access_token'
        );

        localStorage.removeItem(
          'relic_token_type'
        );

        throw new Error(
          'Officer account is inactive'
        );
      }

      const userProfile =
        mapBackendUserToProfile(backendUser);

      setUser(userProfile);
      setRegisteredUsers([userProfile]);

      localStorage.setItem(
        'garuda_user',
        JSON.stringify(userProfile)
      );

      return userProfile;
    } catch (error: any) {
      console.error('Backend login failed:', error);

      localStorage.removeItem(
        'relic_access_token'
      );

      localStorage.removeItem(
        'relic_token_type'
      );

      localStorage.removeItem(
        'garuda_user'
      );

      setUser(null);

      throw new Error(
        error?.message ||
          'Unable to connect to authentication server'
      );
    }
  };

  const loginUser = (
    userProfile: UserProfile
  ) => {
    setUser(userProfile);

    localStorage.setItem(
      'garuda_user',
      JSON.stringify(userProfile)
    );
  };

  const loginWithGoogle = (
    _role: UserRole = 'CYBERCRIME_INVESTIGATOR',
    _googleProfile?: {
      name?: string;
      email?: string;
      photo?: string;
    }
  ): UserProfile => {
    throw new Error(
      'Google login is not enabled. Please use your official badge number and password.'
    );
  };

  const signup = (
    _userData: RegisterUserData
  ): UserProfile => {
    throw new Error(
      'New account registration is disabled. Officer accounts are managed by the backend.'
    );
  };

  const updateUserPassword = (
    _email: string,
    _newPassword: string
  ): boolean => {
    console.warn(
      'Password changes must be performed through the backend.'
    );

    return false;
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem(
      'relic_access_token'
    );

    localStorage.removeItem(
      'relic_token_type'
    );

    localStorage.removeItem(
      'garuda_user'
    );
  };

  const switchRole = (
    newRole: UserRole
  ) => {
    /*
     * Do not allow the frontend to arbitrarily
     * change the authenticated officer's role.
     *
     * The role comes from the backend database.
     */
    if (!user) {
      return;
    }

    if (user.role !== newRole) {
      console.warn(
        'Role changes are controlled by the backend.'
      );
    }
  };

  if (authLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,

        isAuthenticated: !!user,

        registeredUsers,

        login,

        loginUser,

        loginWithGoogle,

        signup,

        findUserByEmailOrId,

        updateUserPassword,

        logout,

        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};