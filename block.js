const fs = require('fs');

function parseTransaction(line) {
  const [txid, fee, weight, parentTxids] = line.split(',');
  return {
    txid,
    fee: parseInt(fee),
    weight: parseInt(weight),
    parentTxids: parentTxids.length > 0 ? parentTxids.split(';') : [],
  };
}

function readMempool(file) {
  const data = fs.readFileSync(file, 'utf8');
  const lines = data.split('\n');
  return lines.map(parseTransaction);
}
function calculateMaxFeeTransactions(transactions) {
  const transactionMap = new Map(transactions.map((tx) => [tx.txid, tx]));

  const dp = new Map();

  function calculateMaxFee(txid) {
    if (dp.has(txid)) {
      return dp.get(txid);
    }

    const transaction = transactionMap.get(txid);
    if (!transaction) {
      return 0;
    }

    let maxFee = transaction.fee;

    for (const parentTxid of transaction.parentTxids) {
      maxFee += calculateMaxFee(parentTxid);
    }

    dp.set(txid, maxFee);

    return maxFee;
  }

  const result = [];

  transactions.sort(
    (a, b) => calculateMaxFee(b.txid) - calculateMaxFee(a.txid)
  );

  let currentWeight = 0;

  for (const transaction of transactions) {
    if (currentWeight + transaction.weight <= 400000) {
      result.push(transaction.txid);
      currentWeight += transaction.weight;
    }
  }

  return result;
}
function main() {
  const file = 'mempool.csv';
  const transactions = readMempool(file);
  const result = calculateMaxFeeTransactions(transactions);
  console.log(result.join('\n'));
}

main();