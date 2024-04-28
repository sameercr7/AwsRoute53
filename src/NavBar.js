import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import './navbar.css';

const NavBar = ({ isAuthenticated, user, loginWithRedirect, logout }) => {
  return (
    <AppBar position="static" className="navbar">
      <Toolbar>
        <Typography variant="h6" className="navbar-title">
          DNS Dashboard
        </Typography>
        <div className="navbar-spacer" /> {/* To push other elements to the right */}
        {isAuthenticated ? (
          <>
            <Typography className="navbar-welcome">
              Welcome, {user.name} {/* Show user's name */}
            </Typography>
            <Button
              color="inherit"
              onClick={() => logout({ returnTo: window.location.origin })}
              className="navbar-button"
            >
              Logout
            </Button>
          </>
        ) : (
          <Button
            color="inherit"
            onClick={() => loginWithRedirect()}
            className="navbar-button"
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
