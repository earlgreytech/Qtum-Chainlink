/* Script that requests RIF/BTC price to the Consumer contract */
const url = require('url');

const rpcURL =  process.env.ETH_RPC;
const qtumAccount  = url.parse(rpcURL).auth.split(":")[0]

// assume: node 8 or above
const ora = require("ora")
const parseArgs = require("minimist")

const qtum = require("qtumjs-eth")
const rpc = new qtum.EthRPC(rpcURL, qtumAccount)
const repoData = require("../solar.development.json")
const {
  sender, ...info
} = repoData.contracts['contracts/Consumer.sol']
const consumerContract = new qtum.Contract(rpc, info)

const opts = {gasPrice: 100}

async function requestRIFPrice() {
  console.log(consumerContract)
  const result = await consumerContract.send("requestRIFPrice()",[], opts)
  console.log(result, 'result')
}


async function main() {
  const argv = parseArgs(process.argv.slice(2), {"string": '_'})

  const cmd = argv._[0]

  if (process.env.DEBUG) {
    console.log("argv", argv)
    console.log("cmd", cmd)
  }

  switch (cmd) {
    case "requestRIFPrice":
      await requestRIFPrice()
      break
    default:
      console.log("unrecognized command", cmd)
  }
}

main().catch(err => {
  console.log("error", err)
})

// const Consumer = artifacts.require("Consumer");
// const url = require('url');
// const qtum = require("qtumjs-eth")
// const rpcURL =  'http://0x7926223070547d2d15b2ef5e7383e541c338ffe9:@10.1.60.254:23889';
// const qtumAccount  = url.parse(rpcURL).auth.split(":")[0]
// const rpc = new qtum.EthRPC(rpcURL, qtumAccount)
// const { QtumRPC } = require('qtumjs')
// const qtumConnection = new QtumRPC('http://qtum:testpasswd@qtum:3889')
// const repoData = require("../build/contracts/Consumer.json")
// const {
//   sender,
//   ...info
// } = repoData.contracts['../contracts/Consumer.sol']
// const consumerContract = new qtum.Contract(rpc, info)
// const opts = {gasPrice: 100}

// module.exports = async function(callback) {
// 	try {
// 		const consumer = await consumerContract.call("requestRIFPrice", [], opts );
// 		console.log(consumer.outputs)
// 		console.log('[INFO] - Requesting RIF Price...');
// 		const confirmation = await consumer.confirm(1)
// 		// Watch for the RequestFulfilled event of the Consumer contract
// 		// console.log('[INFO] - Waiting for receipt...');
// 		if (confirmation) {
// 		console.log('Confirmation', confirmation)
// 		const waitTX = setInterval(async () => {
// 			const receipt = await rpc.getTransactionReceipt(consumer.transactionHash);
// 			if (receipt){
// 				clearInterval(waitTX);
// 				pollResponse(receipt.blockNumber + 1, consumer);
// 			}
// 		}, 5000);	
// 	}
// 	}catch(e){
// 		console.error(e);
// 		throw(e);
// 	}

// 	async function pollResponse(fromBlock, consumer){
// 		console.log('[INFO] - Polling for the response...');
// 		const poll = setInterval(async () => {
// 			rpc.getLogs({
// 				'fromBlock': fromBlock,
// 				'toBlock': 'latest',
// 				'address': consumer.address,
// 				'topics': [],
// 			}).then(function(events){
// 				if (events.length > 0){
// 					clearInterval(poll);
// 					consumer.currentPrice().then(function(price){
// 						const priceNum = web3.utils.hexToNumber(price);
// 						if (priceNum !== 0){
// 							console.log('[INFO] - Received RIF price: ' + (priceNum / 100000000) + ' BTC');
// 							return callback();
// 						}
// 					});
// 				}
// 			});
// 		}, 10000);
// 	}
// }