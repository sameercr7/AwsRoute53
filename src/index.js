import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import { createRoot } from 'react-dom/client';

// Configurable Auth0 setup
const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN || 'dev-nkqn1tvo4itiflhx.us.auth0.com';
const auth0ClientId = process.env.REACT_APP_AUTH0_CLIENT_ID || 'Hv04ZZbJ2Ib2upQfAL85MPF5DrSSZj8D';
const auth0Audience = process.env.REACT_APP_AUTH0_AUDIENCE || 'https://dev-nkqn1tvo4itiflhx.us.auth0.com/api/v2/';

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain={auth0Domain}
    clientId={auth0ClientId}
    audience={auth0Audience}
    authorizationParams={{ redirect_uri: window.location.origin }}
  >
    <App />
  </Auth0Provider>
);