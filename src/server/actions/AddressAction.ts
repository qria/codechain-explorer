import { Router } from "express";
import { ServerContext } from "../ServerContext";
import * as _ from "lodash";
import { H256 } from "codechain-sdk/lib/core/classes";
import { PlatformAddress, AssetTransferAddress } from "codechain-sdk/lib/key/classes";
import { TransactionDoc } from "../../db/DocType";

function handle(context: ServerContext, router: Router) {
    router.get("/addr-platform-account/:address", async (req, res, next) => {
        const { address } = req.params;
        let accountId;
        try {
            accountId = PlatformAddress.fromString(address).getAccountId();
        } catch (e) {
            res.send(JSON.stringify(null));
            return;
        }
        try {
            const balance = await context.codechainSdk.rpc.chain.getBalance(accountId);
            const nonce = await context.codechainSdk.rpc.chain.getNonce(accountId);
            const account = {
                balance: balance.value,
                nonce: nonce.value
            }
            res.send(account);
        } catch (e) {
            next(e);
        }
    });

    router.get("/addr-platform-blocks/:address", async (req, res, next) => {
        const { address } = req.params;
        const accountId = PlatformAddress.fromString(address).getAccountId();
        try {
            const blocks = await context.db.getBlocksByAccountId(accountId);
            res.send(blocks);
        } catch (e) {
            next(e);
        }
    });

    router.get("/addr-platform-parcels/:address", async (req, res, next) => {
        const { address } = req.params;
        const accountId = PlatformAddress.fromString(address).getAccountId();
        try {
            const parcels = await context.db.getParcelsByAccountId(accountId);
            res.send(parcels);
        } catch (e) {
            next(e);
        }
    });

    router.get("/addr-platform-assets/:address", async (req, res, next) => {
        const { address } = req.params;
        const accountId = PlatformAddress.fromString(address).getAccountId();
        try {
            const assetBundles = await context.db.getAssetBundlesByAccountId(accountId);
            res.send(assetBundles);
        } catch (e) {
            next(e);
        }
    });

    router.get("/addr-asset-utxo/:address", async (req, res, next) => {
        const { address } = req.params;
        let lockscriptHashAndParams;
        try {
            lockscriptHashAndParams = AssetTransferAddress.fromString(address).getLockScriptHashAndParameters();
        } catch (e) {
            res.send([]);
            return;
        }
        try {
            if (lockscriptHashAndParams.lockScriptHash.value !== "f42a65ea518ba236c08b261c34af0521fa3cd1aa505e1c18980919cb8945f8f3") {
                // FIXME : Currently only standard scripts are available
                res.send([]);
                return;
            }
            const pubKey = lockscriptHashAndParams.parameters[0].toString("hex");
            const assets = await context.db.getAssetsByPubKey(new H256(pubKey));
            const utxoPromise = _.map(assets, async (asset) => {
                const getAssetResult = await context.codechainSdk.rpc.chain.getAsset(new H256(asset.transactionHash), asset.transactionOutputIndex);
                if (!getAssetResult) {
                    return null;
                }
                return asset;
            });
            const utxoResult = await Promise.all(utxoPromise);
            const utxoList = _.compact(utxoResult);
            const utxoResponsePromise = _.map(utxoList, async (utxo) => {
                return {
                    asset: utxo,
                    assetScheme: await context.db.getAssetScheme(new H256(utxo.assetType))
                }
            })
            const utxoPresponse = await Promise.all(utxoResponsePromise);
            res.send(utxoPresponse);
        } catch (e) {
            next(e);
        }
    });

    router.get("/addr-asset-txs/:address", async (req, res, next) => {
        const { address } = req.params;
        let lockscriptHashAndParams;
        try {
            lockscriptHashAndParams = AssetTransferAddress.fromString(address).getLockScriptHashAndParameters();
        } catch (e) {
            res.send([]);
            return;
        }
        try {
            if (lockscriptHashAndParams.lockScriptHash.value !== "f42a65ea518ba236c08b261c34af0521fa3cd1aa505e1c18980919cb8945f8f3") {
                // FIXME : Currently only standard scripts are available
                res.send([]);
                return;
            }
            const pubKey = lockscriptHashAndParams.parameters[0].toString("hex");
            const transactions: TransactionDoc[] = await context.db.getTransactionsByPubKey(new H256(pubKey));
            res.send(transactions);
        } catch (e) {
            next(e);
        }
    });
}

export const AddressAction = {
    handle
}
