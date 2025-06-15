import type { RpcResponse, GetTipAccountsResult, SendBundleParams, SendBundleResult, SendTransactionParams, SendTransactionResult, GetInflightBundleStatusesParams, GetInflightBundleStatusesResult, GetBundleStatusesParams, GetBundleStatusesResult } from './types';
export declare class JitoJsonRpcClient {
    private baseUrl;
    private uuid;
    private client;
    private logger?;
    constructor(baseUrl: string, uuid?: string);
    enableConsoleLog(): void;
    private sendRequest;
    getTipAccounts(): Promise<RpcResponse<GetTipAccountsResult>>;
    getRandomTipAccount(): Promise<string>;
    sendBundle(params: SendBundleParams): Promise<RpcResponse<SendBundleResult>>;
    sendTxn(params: SendTransactionParams, bundleOnly?: boolean): Promise<RpcResponse<SendTransactionResult>>;
    getInFlightBundleStatuses(params: GetInflightBundleStatusesParams): Promise<RpcResponse<GetInflightBundleStatusesResult>>;
    getBundleStatuses(params: GetBundleStatusesParams): Promise<RpcResponse<GetBundleStatusesResult>>;
    confirmInflightBundle(bundleId: string, timeoutMs?: number): Promise<{
        bundle_id: string;
        status: "Invalid" | "Pending" | "Failed" | "Landed";
        landed_slot: number | null;
    } | {
        bundle_id: string;
        transactions: string[];
        slot: number;
        confirmation_status: "processed" | "confirmed" | "finalized";
        err: any;
    } | {
        status: string;
    }>;
}
//# sourceMappingURL=index.d.ts.map