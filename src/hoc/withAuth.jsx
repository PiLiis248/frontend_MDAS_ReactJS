import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import PATHS from '../constants/path';
import tokenMethod from '../api/token';
import authService from '../services/authService';

// HOC to handle authentication logic
const withAuth = (WrappedComponent, requireAuth = true) => {
  const WithAuthComponent = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      const storedUser = tokenMethod.get();
      if (storedUser && storedUser !== user) {
        setUser(storedUser);
      }
      setIsLoading(false);
    }, []);
    

    const login = async (username, password, rememberMe) => {
      try {
        const userData = await authService.login(username, password, rememberMe, setUser);
        
        if (!userData || !userData.user) {
          throw new Error("Your account has not been registered!");
        }
    
        if (userData.user.status !== "ACTIVE") {
          throw new Error("Your account is not activated. Please check your email.");
        }
    
        if (JSON.stringify(user) !== JSON.stringify(userData)) { 
          setUser(userData);
        }
        setIsAuthenticated(true);
        navigate(PATHS.manageGroup);
        return userData;
      } catch (error) {
        throw new Error(error.message || "Invalid username or password"); 
      }
    };
    

    const logout = async () => {
      await authService.logout(setUser);
      setIsAuthenticated(false);
      setUser(null);
      navigate(PATHS.login);
    };

    if (isLoading) {
      // Optional: Show loading indicator while checking authentication
      return <div>Loading...</div>;
    }

    // Redirect logic based on authentication requirements
    if (requireAuth && !isAuthenticated) {
      return <Navigate to={PATHS.login} />;
    }

    if (!requireAuth && isAuthenticated) {
      return <Navigate to={PATHS.manageGroup} />;
    }

    // Pass all authentication-related props to the wrapped component
    const authProps = {
      isAuthenticated,
      user,
      login,
      logout,
      setUser
    };

    return <WrappedComponent {...props} {...authProps} />;
  };

  // Optional: Set display name for better debugging
  WithAuthComponent.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;
  
  return WithAuthComponent;
};

// Helper function to get the display name of a component
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAuth;