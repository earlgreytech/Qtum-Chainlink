/* Script that requests QTUM/BTC price to the Consumer contract */
const Consumer = artifacts.require("Consumer");
const Oracle = artifacts.require("Oracle");

module.exports = async function main(callback) {
  try {

    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    const oracle = await Oracle.deployed();

    await oracle.setFulfillmentPermission("0x7926223070547d2d15b2ef5e7383e541c338ffe9", true);

    const consumer = await Consumer.deployed();

    const request = await consumer.requestQTUMPrice()

    console.log(request)

    const currentPrice = await consumer.currentPrice.call();
    console.log(web3.utils.hexToNumber(currentPrice))
    callback(0);
    
  } catch (error) {
    console.error(error);
    callback(1)
  }
}