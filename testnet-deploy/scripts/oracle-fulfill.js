/* Script that sets fullfilment permission for Adapter to fulfill oracle requests*/
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
} = repoData.contracts['contracts/Oracle.sol']
const oracleContract = new qtum.Contract(rpc, info)

const opts = {gasPrice: 100}

async function setFulfillmentPermission(adapterAddress, allow) {
  console.log(oracleContract)
  const result = await oracleContract.send("setFulfillmentPermission",[adapterAddress, allow], opts)
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
    case "setFulfillmentPermission":
      const adapterAddress = argv._[1]
      const allow = argv._[2]
      console.log(oracleContract)
      await setFulfillmentPermission(adapterAddress, allow)
      break
    default:
      console.log("unrecognized command", cmd)
  }
}

main().catch(err => {
  console.log("error", err)
})
