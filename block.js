const fs = require('fs');
const { CLIENT_RENEG_LIMIT } = require('tls');

function parseTransaction(line) {
  const [txid, fee, weight, ...parentTxids] = line.split(",");
  return {
      txid,
      fee: parseInt(fee),
      weight: parseInt(weight),
      parentTxids: [
          ...parentTxids,
          parentTxids[parentTxids.length - 1].slice(
              0,
              parentTxids[parentTxids.length - 1].length - 1
          ),
      ],
  };
}

function readMempool(file) {
  const data = fs.readFileSync(file, 'utf8');
  const lines = data.split('\n');
  return lines.map(parseTransaction);
}
function calculateMaxFeeTransactions(transactions) {
  const sortedTx = transactions.sort((a, b) => b.fee - a.fee);

  let totalTnxPossible = [];
  for (let i = 0; i < sortedTx.length; i++) {
      const currentWeight = totalTnxPossible.reduce(
          (acc, cur) => cur.fee + acc,
          0
      );
      if (currentWeight + sortedTx[i].fee > 4000000) {
          break;
      } else {

          totalTnxPossible.push(sortedTx[i]);
      }
  }
totalTnxPossible.reduce((acc,cur)=>cur.fee + acc,0)
console.log(totalTnxPossible.reduce((acc,cur)=>cur.fee + acc,0))
totalTnxPossible.map(txn=>txn.txid).join("\n")
console.log(totalTnxPossible.map(txn=>txn.txid.slice(1)).join("\n"))
  return totalTnxPossible;
}
function main() {
  const file = 'mempool.csv';
  
  const transactions = readMempool(file);
  const result = calculateMaxFeeTransactions(transactions);
  // console.log(result.join('\n'));
}

main();

