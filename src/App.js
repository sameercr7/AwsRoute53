import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Dashboard from './Dashboard';
import NavBar from './NavBar'; // Import the NavBar component

const App = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <div>
      <NavBar
        isAuthenticated={isAuthenticated}
        user={user}
        loginWithRedirect={loginWithRedirect}
        logout={logout}
      />
      {isAuthenticated && <Dashboard />} {/* Only show Dashboard if authenticated */}
    </div>
  );
};

export default App;
