const fs = require('fs');
const Oracle = artifacts.require("Oracle");

// Address of the ChainLink node
const CHAINLINK_ADDRESS = "0xa8185eA17FC1D2187dF2AA52bE3056916a82737b";
// HEX of QTUM Public Key associated with .adapterKey file
const ADAPTER_ADDRESS = "0x7926223070547D2D15b2eF5e7383E541c338FfE9";

module.exports = async function(deployer) {
	return deployer.deploy(Oracle, CHAINLINK_ADDRESS).then(oracle => {
		// Allow the QTUM TX Adapter wallet to fulfill Oracle's requests
		return oracle.setFulfillmentPermission(ADAPTER_ADDRESS, true);
	});
};
