const fs = require('fs');
const Oracle = artifacts.require("Oracle");

const LINKTOKEN_ADDRESS = "0xaFFc2201F5c7b5AC298EBD97A5414B8FFB5a33FA";
const ADAPTER_ADDRESS = "0x7926223070547d2d15b2ef5e7383e541c338ffe9";

module.exports = async function(deployer) {
	return deployer.deploy(Oracle, LINKTOKEN_ADDRESS).then(oracle => {
		// Allow the QTUM TX Adapter wallet to fulfill Oracle's requests
		return oracle.setFulfillmentPermission(ADAPTER_ADDRESS, true);
	});
};
