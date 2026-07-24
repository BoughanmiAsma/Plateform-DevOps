import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8180',
  realm: 'devops-platform',
  clientId: 'react-frontend'
});

export default keycloak;
