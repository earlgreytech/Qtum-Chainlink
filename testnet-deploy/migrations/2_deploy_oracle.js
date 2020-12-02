const fs = require('fs');
const Oracle = artifacts.require("Oracle");

// Address of the ChainLink node
const CHAINLINK_ADDRESS = process.env.CHAINLINK_ADDRESS;
// HEX of QTUM Public Key associated with .adapterKey file
const ADAPTER_ADDRESS = process.env.ADAPTER_ADDRESS;

module.exports = async function(deployer) {
	return deployer.deploy(Oracle, CHAINLINK_ADDRESS).then(oracle => {
		// Allow the QTUM TX Adapter wallet to fulfill Oracle's requests
		return oracle.setFulfillmentPermission(ADAPTER_ADDRESS, true);
	});
};
