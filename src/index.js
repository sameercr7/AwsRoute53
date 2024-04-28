import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

// Configurable Auth0 setup
const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN || 'dev-nkqn1tvo4itiflhx.us.auth0.com';
const auth0ClientId = process.env.REACT_APP_AUTH0_CLIENT_ID || 'Hv04ZZbJ2Ib2upQfAL85MPF5DrSSZj8D';
const auth0secret=process.env.REACT_APP_AUTH0_Secret||'fzgzHSKObp9Q1fEOkoJHsz-Z2uiTnK2Fy-Kd2R7xX_Sv7a1Aj7si1eRAJ1wJRvLN'
const auth0Audience = process.env.REACT_APP_AUTH0_AUDIENCE || 'https://dev-nkqn1tvo4itiflhx.us.auth0.com/api/v2/';

ReactDOM.render(
  <Auth0Provider
    domain={auth0Domain}
    clientId={auth0ClientId}
    audience={auth0Audience}
    redirectUri={window.location.origin}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
);
