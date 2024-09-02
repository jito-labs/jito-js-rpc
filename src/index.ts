import axios, { AxiosInstance } from 'axios';

interface JsonRpcRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: any[];
}

export class JitoJsonRpcClient {
  private baseUrl: string;
  private uuid: string | undefined;
  private client: AxiosInstance;

  constructor(baseUrl: string, uuid?: string) {
    this.baseUrl = baseUrl;
    this.uuid = uuid;
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async sendRequest(endpoint: string, method: string, params?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const data: JsonRpcRequest = {
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

  async getTipAccounts(): Promise<any> {
    const endpoint = this.uuid ? `/bundles?uuid=${this.uuid}` : '/bundles';
    return this.sendRequest(endpoint, 'getTipAccounts');
  }

  async getBundleStatuses(params?: any): Promise<any> {
    const endpoint = this.uuid ? `/bundles?uuid=${this.uuid}` : '/bundles';
    return this.sendRequest(endpoint, 'getBundleStatuses', params);
  }

  async sendBundle(params?: any): Promise<any> {
    const endpoint = this.uuid ? `/bundles?uuid=${this.uuid}` : '/bundles';
    return this.sendRequest(endpoint, 'sendBundle', params);
  }

  async sendTxn(params?: any, bundleOnly: boolean = false): Promise<any> {
    let endpoint = '/transactions';
    const queryParams: string[] = [];

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

  static prettify(value: any): string {
    return JSON.stringify(value, null, 2);
  }
}