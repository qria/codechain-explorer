import * as cors from 'cors';
import * as express from 'express';
import { ServerContext } from './context';

const corsOptions = {
    origin: true,
    credentials: true,
    exposedHeaders: ["Location", "Link"]
}

export function createApiRouter(context: ServerContext, useCors = false) {
    const router = express.Router();

    if (useCors) {
        router
            .options("*", cors(corsOptions))
            .use(cors(corsOptions));
    }

    router.get("/ping", async (req, res, next) => {
        const { codechainSdk } = context;
        codechainSdk.ping().then(text => {
            res.send(JSON.stringify(text));
        }).catch(next);
    });

    router.get("/blockNumber", async (req, res, next) => {
        context.codechainSdk.getBlockNumber().then(text => {
            res.send(JSON.stringify(text));
        }).catch(next);
    });

    router.get("/block/:blockNumber/hash", async (req, res, next) => {
        const { blockNumber } = req.params;
        context.codechainSdk.getBlockHash(Number.parseInt(blockNumber)).then(hash => {
            res.send(JSON.stringify(hash));
        }).catch(next);
    });

    router.get("/block/:id", async (req, res, next) => {
        const { id } = req.params;
        try {
            const hash = id.length === 66
                ? { value: id.slice(2) }
                : await context.codechainSdk.getBlockHash(Number.parseInt(id));
            const block = await context.codechainSdk.getBlock(hash);
            res.send(JSON.stringify(block));
        } catch (e) {
            next(e);
        }
    });

    router.get("/tx/:txhash", async (req, res, next) => {
        const { txhash } = req.params;
        // FIXME: implement when sdk support getTransaction
        try {
            const hash = await context.codechainSdk.getBlockHash(1);
            const block = await context.codechainSdk.getBlock(hash);
            res.send(JSON.stringify(block.transactions[0]));
        } catch (e) { next(e); }
    });

    router.get("/tx/:txhash/invoice", async (req, res, next) => {
        const { txhash } = req.params;
        context.codechainSdk.getTransactionInvoice({ value: txhash.slice(2) } as any, 0).then(invoice => {
            res.send(JSON.stringify(invoice));
        }).catch(next);
    });

    router.get("/account/:address", async (req, res, next) => {
        const { address } = req.params;
        Promise.all([
            context.codechainSdk.getNonce({ value: address.slice(2) } as any)
        ]).then(([nonce]) => {
            // FIXME: getBalance is not implemented yet
            res.send(JSON.stringify({ nonce, balance: nonce }));
        });
    });

    router.get("/account/:address/nonce", async (req, res, next) => {
        const { address } = req.params;
        context.codechainSdk.getNonce({ value: address.slice(2) } as any).then(nonce => {
            res.send(JSON.stringify(nonce));
        }).catch(next);
    });

    router.get("/account/:address/balance", async (req, res, next) => {
        const { address } = req.params;
        // FIXME: not implemented
        res.sendStatus(501);
    });

    return router;
}
