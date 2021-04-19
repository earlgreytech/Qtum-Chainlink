/* Script that requests QTUM/BTC price to the Consumer contract */
const Consumer = artifacts.require("Consumer");


module.exports = async function main(callback) {
  try {

    const accounts = await web3.eth.getAccounts();
    console.log(accounts)

    const consumer = await Consumer.deployed()

    const request = await consumer.requestQTUMPrice({from: "0x7926223070547d2d15b2ef5e7383e541c338ffe9", gas: "0x186a0", gasPrice: "0x64"})

    console.log(request)
    callback(0);
    
  } catch (error) {
    console.error(error);
    callback(1)
  }
}

