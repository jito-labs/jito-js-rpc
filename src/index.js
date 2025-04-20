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

  async sendRequest(endpoint, method, params, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    let modifiedParams = params;
    if ((method === 'sendBundle' || method === 'sendTransaction') && params) {
      modifiedParams = [
        params[0], 
        { encoding: 'base64' }
      ];
    }
    
    const data = {
      jsonrpc: '2.0',
      id: 1,
      method,
      params: modifiedParams || [],
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

  async getRandomTipAccount() {
    const tipAccountsResponse = await this.getTipAccounts();
    if (tipAccountsResponse.result && Array.isArray(tipAccountsResponse.result) && tipAccountsResponse.result.length > 0) {
      const randomIndex = Math.floor(Math.random() * tipAccountsResponse.result.length);
      return tipAccountsResponse.result[randomIndex];
    } else {
      throw new Error('No tip accounts available');
    }
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

  async getInFlightBundleStatuses(params) {
    const endpoint = this.uuid ? `/bundles?uuid=${this.uuid}` : '/bundles';
    return this.sendRequest(endpoint, 'getInflightBundleStatuses', params);
  }

  async getBundleStatuses(params) {
    const endpoint = this.uuid ? `/bundles?uuid=${this.uuid}` : '/bundles';
    return this.sendRequest(endpoint, 'getBundleStatuses', params);
  }

  async confirmInflightBundle(bundleId, timeoutMs = 60000) {
    const start = Date.now();
    
    while (Date.now() - start < timeoutMs) {
      try {
        const response = await this.getInFlightBundleStatuses([[bundleId]]);
        
        if (response.result && response.result.value && response.result.value.length > 0) {
          const bundleStatus = response.result.value[0];
          
          console.log(`Bundle status: ${bundleStatus.status}, Landed slot: ${bundleStatus.landed_slot}`);
          
          if (bundleStatus.status === "Failed") {
            return bundleStatus;
          } else if (bundleStatus.status === "Landed") {
            // If the bundle has landed, get more detailed status
            const detailedStatus = await this.getBundleStatuses([[bundleId]]);
            if (detailedStatus.result && detailedStatus.result.value && detailedStatus.result.value.length > 0) {
              return detailedStatus.result.value[0];
            } else {
              console.log('No detailed status returned for landed bundle.');
              return bundleStatus;
            }
          }
        } else {
          console.log('No status returned for the bundle. It may be invalid or very old.');
        }
      } catch (error) {
        console.error('Error checking bundle status:', error);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // If we've reached this point, the bundle hasn't reached a final state within the timeout
    console.log(`Bundle ${bundleId} has not reached a final state within ${timeoutMs}ms`);
    return { status: 'Timeout' };
  }

  // Utility method for prettier JSON output
  static prettify(obj) {
    return JSON.stringify(obj, null, 2);
  }
}

module.exports = { JitoJsonRpcClient };