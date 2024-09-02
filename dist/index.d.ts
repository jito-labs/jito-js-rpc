export declare class JitoJsonRpcClient {
    private baseUrl;
    private uuid;
    private client;
    constructor(baseUrl: string, uuid?: string);
    private sendRequest;
    getTipAccounts(): Promise<any>;
    getBundleStatuses(params?: any): Promise<any>;
    sendBundle(params?: any): Promise<any>;
    sendTxn(params?: any, bundleOnly?: boolean): Promise<any>;
    static prettify(value: any): string;
}
