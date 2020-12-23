const fs = require('fs');
const Oracle = artifacts.require("Oracle");

const LINKTOKEN_ADDRESS = "LINKTOKEN_ADDRESS";
const ADAPTER_ADDRESS = "ADAPTER_ADDRESS";

module.exports = async function(deployer) {
	return deployer.deploy(Oracle, LINKTOKEN_ADDRESS).then(oracle => {
		// Allow the QTUM TX Adapter wallet to fulfill Oracle's requests
		return oracle.setFulfillmentPermission(ADAPTER_ADDRESS, true);
	});
};
