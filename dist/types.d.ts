export type RpcResponse<T> = {
    id: number;
    jsonrpc: string;
    result: T;
};
export type ParamsWithEncoding<T extends any[]> = [...T] | [...T, {
    encoding: 'base58' | 'base64';
}];
export type ResultWithContext<T> = {
    context: {
        slot: number;
    };
    value: T;
};
export type GetTipAccountsResult = string[];
export type SendBundleParams = ParamsWithEncoding<[
    string[]
]>;
export type SendBundleResult = string;
export type SendTransactionParams = ParamsWithEncoding<[
    string
]>;
export type SendTransactionResult = string;
export type GetInflightBundleStatusesParams = [
    string[]
];
export type GetInflightBundleStatusesResult = ResultWithContext<{
    bundle_id: string;
    status: 'Invalid' | 'Pending' | 'Failed' | 'Landed';
    landed_slot: number | null;
}[]> | null;
export type GetBundleStatusesParams = [
    string[]
];
export type GetBundleStatusesResult = ResultWithContext<{
    bundle_id: string;
    transactions: string[];
    slot: number;
    confirmation_status: 'processed' | 'confirmed' | 'finalized';
    err: any;
}[]> | null;
