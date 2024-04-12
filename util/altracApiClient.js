'use strict';

const jose = require('node-jose');
const crypto = require('crypto');
const fetch = require('node-fetch');

const {
  JWE,
  JWK,
} = jose;

const DEFAULT_API_HOST = 'https://stage.altrac-api.com';
let DEFAULT_API_PORT;
const DEFAULT_API_VERSION = '2018.11.30';

const keystore = JWK.createKeyStore();

const getKeystore = async (clientId, secretKey) => {
  if (!keystore.get(clientId)) {
    // Add secret key to JOSE keystore
    const keyProps = {
      kty: 'oct',
      kid: clientId,
      use: 'enc',
      alg: 'A128GCM',
      k: secretKey,
    };

    await keystore.add(keyProps);
    keystore.get(clientId);
  }

  return keystore;
};

/**
* Creates a new Altrac API client.
* @class
*/
exports.AltracClient = class AltracClient {
  /**
  * Instantiates an AltracClient using the credentials.
  * @constructor
  * @param {Object} credentials - apiHost, apiPort, apiVersion, clientId, secretKey
  */
  constructor(credentials) {
    // create data properties
    this.accessToken = undefined;
    this.apiHost = DEFAULT_API_HOST;
    this.apiPort = DEFAULT_API_PORT;
    this.apiVersion = DEFAULT_API_VERSION;
    this.clientId = undefined;
    this.clientSignature = undefined;
    this.headers = undefined;
    this.secretKey = undefined;
    this.tokenExpiresAt = 0;

    this.update(credentials);

    if (!this.clientId) {
      console.log('clientId required');
    }

    if (!this.secretKey) {
      console.log('secretKey required');
    }

    // Authenticate the clientId to use as lookup header
    const clientIdHMAC = crypto.createHmac('sha256', this.secretKey);
    clientIdHMAC.update(this.clientId);

    this.clientSignature = clientIdHMAC.digest('base64');

    // do async things here
    // eslint-disable-next-line no-constructor-return
    return (async () => {
      await this.authenticate();
      return this; // done
    })();
  }

  /**
  * Is authentication valid?
  * @instance
  * @returns {boolean}
  */
  isAuthenticated() {
    return this.tokenExpiresAt > Date.now();
  }

  /**
  * Provides token valid for authentication request.
  * @instance
  * @returns {string}- JWE token
  */
  async requestClientAuthToken() {
    const ks = await getKeystore(this.clientId, this.secretKey);
    const key = ks.get(this.clientId);
    const input = Buffer.from(this.clientId.toString());

    // eslint-disable-next-line no-return-await
    return await JWE.createEncrypt({ format: 'compact' }, key)
      .update(input)
      .final()
      .then((result) => result);
  }

  /**
  * Provides a valid HTTP header object.
  * @param {string} token - JWE token
  * @return {object} HTTP header structure
  */
  headersFor(token) {
    return {
      'accept-version': this.apiVersion,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Altrac-Client': this.clientId,
    };
  }

  /**
  * Authenticates with Altrac API server.
  */
  async authenticate() {
    const accessToken = await this.requestClientAuthToken();
    const headers = this.headersFor(accessToken);

    const authEndpoint = this.apiPort ? `${this.apiHost}:${this.apiPort}/auth` : `${this.apiHost}/auth`;

    const authResponse = await fetch(authEndpoint, {
      headers,
      method: 'POST',
    });
    const auth = await authResponse.json();

    if (auth.token) {
      this.accessToken = auth.token;
      this.customer_id = auth.customer_id;
      this.headers = this.headersFor(auth.token);
      const ONE_DAY = (24 * 60 * 60 * 1000);
      this.tokenExpiresAt = Date.now() + ONE_DAY;
    } else {
      console.log('Not authenticated');
    }
  }

  /**
  * Performs HTTP GET supplying valid authentication headers.
  * @function AltracClient#get
  * @param {string} endpoint - default "https://stage.altrac.com"
  * @param {object} options - see REST API documentation
  * @returns {string} - JSON updated entity
  * @memberOf AltracClient
  */
  async get(endpoint, options) {
    return this.request('GET', endpoint, options);
  }

  /**
  * Performs HTTP POST supplying valid authentication headers.
  * @function AltracClient#post
  * @param {string} endpoint - default "https://stage.altrac.com"
  * @param {object} options - see REST API documentation
  * @param {object} data  - entity data attributes
  * @returns {string} - JSON updated entity
  * @memberOf AltracClient
  */
  async post(endpoint, options, data) {
    return this.request('POST', endpoint, { ...options, data });
  }

  /**
  * Performs HTTP PUT supplying valid authentication headers.
  * @function AltracClient#put
  * @param {string} endpoint - default "https://stage.altrac.com"
  * @param {object} options - see REST API documentation
  * @param {object} data  - entity data attributes
  * @returns {string} - JSON updated entity
  * @memberOf AltracClient
  */
  async put(endpoint, options, data) {
    return this.request('PUT', endpoint, { ...options, data });
  }

  /**
  * Performs HTTP DELETE supplying valid authentication headers.
  * @function AltracClient#put
  * @param {string} endpoint - default "https://stage.altrac.com"
  * @param {object} options - see REST API documentation
  * @param {object} data  - entity data attributes
  * @returns {string} - JSON updated entity
  * @memberOf AltracClient
  */
  async delete(endpoint, options, data) {
    return this.request('DELETE', endpoint, { ...options, data });
  }

  /**
  * Performs REST call supplying valid authentication headers.
  * @function AltracClient#request
  * @param {string} method - one of GET/POST/PUT
  * @param {string} endpoint - default "https://stage.altrac.com"
  * @param {object} options  - see REST API documentation
  * @param {object} data  - entity data attributes
  * @returns {string} - JSON updated entity
  * @memberOf AltracClient
  */
  async request(method, resourcePath, options) {
    if (!method.match(/^GET|POST|PUT|DELETE$/i)) {
      console.log(`method '${method}' not one of GET / POST / PUT / DELETE`);
    }

    if (!this.isAuthenticated()) {
      try {
        await this.authenticate();
      } catch (exception) {
        console.log('altrac-client-api/request - authentication error');
        console.table(exception);
        return Promise.reject(new Error('Authentication failed'));
      }
    }

    let path = this.apiPort
      ? `${this.apiHost}:${this.apiPort}/${resourcePath}`
      : `${this.apiHost}/${resourcePath}`;

    const {
      data,
      id,
      params,
      path: providedPath,
    } = options || {};

    if (id) {
      path += `/${id}`;
      delete options.id;
    }

    if (providedPath) {
      path += `/${providedPath}`;
      delete options.path;
    }

    const url = new URL(path);

    if (params) {
      Object.keys(params).forEach((key) => {
        url.searchParams.append(key, params[key]);
      });

      delete options.params;
    }

    if (method.match(/^POST|PUT|DELETE$/i)) {
      if (data) {
        options.body = JSON.stringify(data);
        delete options.data;
      }
      else {
        console.log(`for HTTP ${method.toUpperCase()} options.data property is required`);
      }
    }

    const fetchOptions = {
      ...options,
      headers: this.headers,
      method,
    };
    const fetchResult = await fetch(url, fetchOptions);
    const result = await fetchResult.json();

    // if fetch request has a non-ok HTTP response code, throw an error
    if (!fetchResult.ok) {
      console.log(`request error status: ${fetchResult.status} (${fetchResult.statusText}), text: ${JSON.stringify(result)}`);
    }

    return result;
  }

  /**
   * copy attributes in data because the ellipsis operator (...) doesn't work
   * for instances of a class.
   * @param {Object} data
  */
  update(data) {
    const thisInstance = this;
    Object.keys(data).forEach((key) => {
      thisInstance[key] = data[key];
    });
  }
};
