const axios = require('axios');

/**
 * @typedef {Object} JsonRpcRequest
 * @property {string} jsonrpc
 * @property {number} id
 * @property {string} method
 * @property {any[]} params
 */

class JitoJsonRpcClient {
  constructor(baseUrl, uuid) {
    this.baseUrl = baseUrl;
    this.uuid = uuid;
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async sendRequest(endpoint, method, params) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const data = {
      jsonrpc: '2.0',
      id: 1,
      method,
      params: params || [],
    };

    console.log(`Sending request to: ${url}`);
    console.log(`Request body: ${JSON.stringify(data, null, 2)}`);

    try {
      const response = await this.client.post(url, data);
      console.log(`Response status: ${response.status}`);
      console.log(`Response body: ${JSON.stringify(response.data, null, 2)}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`HTTP error: ${error.message}`);
        throw error;
      } else {
        console.error(`Unexpected error: ${error}`);
        throw new Error('An unexpected error occurred');
      }
    }
  }

  async getTipAccounts() {
    const endpoint = this.uuid ? `/bundles?uuid=${this.uuid}` : '/bundles';
    return this.sendRequest(endpoint, 'getTipAccounts');
  }

  async getBundleStatuses(params) {
    const endpoint = this.uuid ? `/bundles?uuid=${this.uuid}` : '/bundles';
    return this.sendRequest(endpoint, 'getBundleStatuses', params);
  }

  async sendBundle(params) {
    const endpoint = this.uuid ? `/bundles?uuid=${this.uuid}` : '/bundles';
    return this.sendRequest(endpoint, 'sendBundle', params);
  }

  async sendTxn(params, bundleOnly = false) {
    let endpoint = '/transactions';
    const queryParams = [];

    if (bundleOnly) {
      queryParams.push('bundleOnly=true');
    }

    if (this.uuid) {
      queryParams.push(`uuid=${this.uuid}`);
    }

    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }

    return this.sendRequest(endpoint, 'sendTransaction', params);
  }

  static prettify(value) {
    return JSON.stringify(value, null, 2);
  }
}

module.exports = { JitoJsonRpcClient };