import * as React from "react";
import * as _ from "lodash";
import * as moment from "moment";
import { Table } from "reactstrap";

import "./LatestTransactions.scss";
import HexString from "../../util/HexString/HexString";
import { Type, AssetMintTransactionDoc, AssetTransferTransactionDoc, TransactionDoc } from "../../../../db/DocType";
import { Link } from "react-router-dom";
import { TypeBadge } from "../../util/TypeBadge/TypeBadge";
import { ImageLoader } from "../../util/ImageLoader/ImageLoader";

interface Props {
    transactions: TransactionDoc[];
}

const LatestTransactions = (props: Props) => {
    const { transactions } = props;
    return <div className="latest-transactions">
        <h1>Latest Transactions</h1>
        <div className="latest-container">
            <Table striped={true} className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: '20%' }}>Type</th>
                        <th style={{ width: '20%' }}>Hash</th>
                        <th style={{ width: '25%' }}>Assets</th>
                        <th style={{ width: '15%' }}>Amount</th>
                        <th style={{ width: '20%' }}>Age</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        _.map(transactions.slice(0, 10), (transaction) => {
                            return (
                                <tr key={`home-transaction-hash-${transaction.data.hash}`}>
                                    <td><TypeBadge transaction={transaction} /> </td>
                                    <td scope="row"><HexString link={`/tx/0x${transaction.data.hash}`} text={transaction.data.hash} /></td>
                                    <td>{Type.isAssetMintTransactionDoc(transaction) ?
                                        <span>
                                            <ImageLoader size={18} className="icon" url={Type.getMetadata((transaction as AssetMintTransactionDoc).data.metadata).icon_url} data={(transaction as AssetMintTransactionDoc).data.output.assetType} />
                                            <HexString link={`/asset/0x${(transaction as AssetMintTransactionDoc).data.output.assetType}`} text={(transaction as AssetMintTransactionDoc).data.output.assetType} />
                                        </span>
                                        : (Type.isAssetTransferTransactionDoc(transaction) ?
                                            <span>
                                                <ImageLoader size={18} className="icon" data={(transaction as AssetTransferTransactionDoc).data.inputs[0].prevOut.assetType} url={Type.getMetadata((transaction as AssetTransferTransactionDoc).data.inputs[0].prevOut.assetScheme.metadata).icon_url} />
                                                <HexString link={`/asset/0x${(transaction as AssetTransferTransactionDoc).data.inputs[0].prevOut.assetType}`} text={(transaction as AssetTransferTransactionDoc).data.inputs[0].prevOut.assetType} />
                                            </span> : "")}</td>
                                    <td>{Type.isAssetMintTransactionDoc(transaction) ? ((transaction as AssetMintTransactionDoc).data.output.amount ? ((transaction as AssetMintTransactionDoc).data.output.amount as number).toLocaleString() : 0) : (Type.isAssetTransferTransactionDoc(transaction) ? _.sumBy((transaction as AssetTransferTransactionDoc).data.inputs, (input) => input.prevOut.amount) : "").toLocaleString()}</td>
                                    <td>{moment.unix(transaction.data.timestamp).fromNow()}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </Table>
            {
                <div className="mt-small">
                    <Link to={"/txs"}>
                        <button type="button" className="btn btn-primary w-100">
                            <span>View all transactions</span>
                        </button>
                    </Link>
                </div>
            }
        </div>
    </div>
};

export default LatestTransactions;
