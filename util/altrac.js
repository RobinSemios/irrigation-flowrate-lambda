'use strict';

const moduleExports = {

  validateConfig() {
    if (moduleExports.altracClient) return true;

    return false;
  },

  init(altracApiKey) {
    const credentials = {
      apiHost: altracApiKey.apiHost,
      apiPort: null,
      apiVersion: altracApiKey.apiVersion,
    };

    moduleExports.altracClient = credentials;
  },
};

module.exports = moduleExports;
