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

const opts = {gasPrice: "0x64", gasLimit: "0x2dc6c0"}

async function requestRIFPrice() {
  console.log(consumerContract)
  const result = await consumerContract.send("requestRIFPrice()",[], opts)
  console.log(result, 'result')
}

async function requestCurrentPrice() {
  console.log(consumerContract)
  const result = await consumerContract.call("currentPrice()",[], opts)
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
    case "requestCurrentPrice":
      await requestCurrentPrice()
      break
    default:
      console.log("unrecognized command", cmd)
  }
}

main().catch(err => {
  console.log("error", err)
})
