import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  SET_SESSION_EXPIRED: 'SET_SESSION_EXPIRED'
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  sessionExpired: false,
  lastActivity: null
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpired: false,
        lastActivity: Date.now()
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        sessionExpired: false
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        lastActivity: Date.now()
      };
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload,
        lastActivity: Date.now()
      };
    
    case AUTH_ACTIONS.SET_SESSION_EXPIRED:
      return {
        ...state,
        sessionExpired: true,
        isAuthenticated: false
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Session timeout duration (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  // Clear stored authentication data
  const clearStoredAuth = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    // For session auth, we don't store tokens
  };

  // Update last activity timestamp
  const updateLastActivity = () => {
    const now = Date.now();
    localStorage.setItem('lastActivity', now.toString());
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: {} }); // Trigger re-render
  };

  // Logout function
  const logout = useCallback(async (showToast = true) => {
    try {
        if (state.isAuthenticated) {
            await apiService.logout();
        }
    } catch (error) {
        console.error('Logout API call failed:', error);
    } finally {
        clearStoredAuth();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        if (showToast) {
            toast.info('You have been logged out successfully');
        }
        await apiService.initializeCSRF(); // Refresh CSRF token
    }
}, [state.isAuthenticated]);

  // Setup session timeout monitoring
  const setupSessionTimeout = useCallback(() => {
    let timeoutId;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (state.isAuthenticated) {
          logout();
          toast.warning('Session expired due to inactivity');
        }
      }, SESSION_TIMEOUT);
    };
    
    // Reset timeout on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const resetTimeoutHandler = () => {
      if (state.isAuthenticated) {
        updateLastActivity();
        resetTimeout();
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, resetTimeoutHandler, true);
    });
    
    if (state.isAuthenticated) {
      resetTimeout();
    }
    
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeoutHandler, true);
      });
    };
  }, [state.isAuthenticated, logout]);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
    
    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user' && !e.newValue) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        toast.info('You have been logged out from another tab');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Setup session timeout when logout is available
  useEffect(() => {
    const cleanup = setupSessionTimeout();
    return cleanup;
  }, [setupSessionTimeout]);

  // Check existing session
  const checkExistingSession = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const lastActivity = localStorage.getItem('lastActivity');
      
      if (userStr && lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        
        if (timeSinceLastActivity > SESSION_TIMEOUT) {
          // Session expired
          clearStoredAuth();
          dispatch({ type: AUTH_ACTIONS.SET_SESSION_EXPIRED });
          toast.warning('Your session has expired. Please log in again.');
          return;
        }
        
        const user = JSON.parse(userStr);
        
        // Verify session with backend
        try {
          await apiService.verifyToken();
          dispatch({ 
            type: AUTH_ACTIONS.LOGIN_SUCCESS, 
            payload: { user, token: 'session' } // Use placeholder token for session auth
          });
          updateLastActivity();
        } catch (error) {
          // Session is invalid
          clearStoredAuth();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Session check failed:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Login function
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    
    try {
      const response = await apiService.login(credentials);
      
      if (response.success) {
        const { user } = response;
        
        // Store user data in localStorage (session is handled by cookies)
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('lastActivity', Date.now().toString());
        
        dispatch({ 
          type: AUTH_ACTIONS.LOGIN_SUCCESS, 
          payload: { user, token: 'session' } // Use placeholder token for session auth
        });
        
        toast.success(`Welcome back, ${user.first_name || user.username}!`);
        return { success: true };
      } else {
        dispatch({ 
          type: AUTH_ACTIONS.LOGIN_FAILURE, 
          payload: response.message || 'Login failed' 
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const response = await apiService.updateProfile(userData);
      if (response.success) {
        const updatedUser = { ...state.user, ...response.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: response.user });
        toast.success('Profile updated successfully');
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Refresh session (not needed for session auth, but keeping for compatibility)
  const refreshToken = async () => {
    try {
      // For session auth, we just verify the current session
      await apiService.verifyToken();
      return { success: true };
    } catch (error) {
      logout(false);
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!state.user || !state.user.permissions) return false;
    return state.user.permissions.includes(permission);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!state.user || !state.user.roles) return false;
    return state.user.roles.includes(role);
  };

  // Get user subscription info
  const getSubscription = useCallback(() => {
    return state.user?.subscription || null;
  }, [state.user?.subscription]);

  // Check if user can access feature based on subscription
  const canAccessFeature = (feature) => {
    const subscription = getSubscription();
    if (!subscription || !subscription.is_active) return false;
    
    const featureMap = {
      'unlimited_calls': subscription.plan_type === 'pro' || subscription.plan_type === 'enterprise',
      'advanced_analytics': subscription.plan_type === 'pro' || subscription.plan_type === 'enterprise',
      'priority_support': subscription.plan_type === 'pro' || subscription.plan_type === 'enterprise',
      'api_access': subscription.plan_type === 'enterprise',
      'multiple_agents': subscription.plan_type === 'pro' || subscription.plan_type === 'enterprise',
      'agent_creation': true, // All plans can create agents (limited by count)
    };
    
    return featureMap[feature] || false;
  };

  // Get agent limit based on subscription
  const getAgentLimit = useCallback(() => {
    const subscription = getSubscription();
    if (!subscription || !subscription.is_active) return 0;
    
    const limits = {
      'basic': 2,
      'pro': 4, 
      'enterprise': 10
    };
    
    return limits[subscription.plan_type] || 0;
  }, [getSubscription]);

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    updateUser,
    refreshToken,
    clearError,
    
    // Utilities
    hasPermission,
    hasRole,
    getSubscription,
    canAccessFeature,
    getAgentLimit,
    updateLastActivity,
    
    // Session info
    sessionTimeRemaining: () => {
      if (!state.lastActivity) return 0;
      const elapsed = Date.now() - state.lastActivity;
      return Math.max(0, SESSION_TIMEOUT - elapsed);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
