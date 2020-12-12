const fs = require('fs');
const Oracle = artifacts.require("Oracle");

// Address of the ChainLink node
const CHAINLINK_ADDRESS = "0x9Fd9cbef8e3f236bb49E57c8f55F897BD5c9b386";
// HEX of QTUM Public Key associated with .adapterKey file
const ADAPTER_ADDRESS = "0x7926223070547D2D15b2eF5e7383E541c338FfE9";

module.exports = async function(deployer) {
	return deployer.deploy(Oracle, CHAINLINK_ADDRESS).then(oracle => {
		// Allow the QTUM TX Adapter wallet to fulfill Oracle's requests
		return oracle.setFulfillmentPermission(ADAPTER_ADDRESS, true);
	});
};
