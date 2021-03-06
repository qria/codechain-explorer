import { BlockDoc, ParcelDoc, TransactionDoc, AssetSchemeDoc } from "../db/DocType";

export interface RootState {
    bestBlockNumber?: number;
    blocksByNumber: {
        [n: number]: BlockDoc;
    };
    blocksByHash: {
        [hash: string]: BlockDoc;
    };
    parcelByHash: {
        [hash: string]: ParcelDoc;
    };
    transactionByHash: {
        [hash: string]: TransactionDoc;
    }
    assetSchemeByAssetType: {
        [assetType: string]: AssetSchemeDoc;
    };
    transactionsByAssetType: {
        [assetType: string]: TransactionDoc[];
    }
}

const initialState: RootState = {
    bestBlockNumber: undefined,
    blocksByNumber: {},
    blocksByHash: {},
    parcelByHash: {},
    assetSchemeByAssetType: {},
    transactionByHash: {},
    transactionsByAssetType: {}
};

interface BestBlockNumberAction {
    type: "BEST_BLOCK_NUMBER_ACTION";
    data: number;
}

interface CacheBlockAction {
    type: "CACHE_BLOCK";
    data: BlockDoc;
};

interface CacheParcelAction {
    type: "CACHE_PARCEL";
    data: ParcelDoc;
};

interface CacheTransactionAction {
    type: "CACHE_TRANSACTION";
    data: TransactionDoc;
}

interface CacheAssetSchemeAction {
    type: "CACHE_ASSET_SCHEME";
    data: {
        assetType: string;
        assetScheme: AssetSchemeDoc;
    };
}

interface CacheAssetTransactionsAction {
    type: "CACHE_ASSET_TRANSACTIONS";
    data: {
        assetType: string;
        transactions: TransactionDoc[];
    };
}


type Action = BestBlockNumberAction | CacheAssetSchemeAction | CacheBlockAction | CacheParcelAction | CacheTransactionAction | CacheAssetTransactionsAction;

export const rootReducer = (state = initialState, action: Action) => {
    if (action.type === "BEST_BLOCK_NUMBER_ACTION") {
        return { ...state, bestBlockNumber: action.data }
    } else if (action.type === "CACHE_BLOCK") {
        const { number: n, hash } = action.data as BlockDoc;
        const blocksByNumber = { ...state.blocksByNumber, [n]: action.data };
        const blocksByHash = { ...state.blocksByHash, [hash]: action.data };
        return { ...state, blocksByNumber, blocksByHash };
    } else if (action.type === "CACHE_PARCEL") {
        const parcel = action.data as ParcelDoc;
        const parcelByHash = { ...state.parcelByHash, [parcel.hash]: parcel };
        return { ...state, parcelByHash };
    } else if (action.type === "CACHE_TRANSACTION") {
        const transaction = action.data as TransactionDoc;
        const transactionByHash = { ...state.transactionByHash, [transaction.data.hash]: transaction };
        return { ...state, transactionByHash };
    } else if (action.type === "CACHE_ASSET_SCHEME") {
        const { assetType, assetScheme } = (action as CacheAssetSchemeAction).data;
        const assetSchemeByAssetType = { ...state.assetSchemeByAssetType, [assetType]: assetScheme };
        return { ...state, assetSchemeByAssetType };
    } else if (action.type === "CACHE_ASSET_TRANSACTIONS") {
        const { assetType, transactions } = (action as CacheAssetTransactionsAction).data;
        const transactionsByAssetType = { ...state.transactionsByAssetType, [assetType]: transactions };
        return { ...state, transactionsByAssetType };
    } else {
        return state;
    }
};
