const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, { service, validator, tokenManager }) => {
    const authenticationsHandler = new AuthenticationsHandler(service, validator, tokenManager);
    server.route(routes(authenticationsHandler));
  },
};
