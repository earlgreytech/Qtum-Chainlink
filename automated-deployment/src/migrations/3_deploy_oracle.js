require('dotenv')
const fs = require('fs');
const LinkToken = artifacts.require("LinkToken");
const Oracle = artifacts.require("Oracle");


module.exports = async function(deployer, network, accounts) {
	const linkToken = await LinkToken.deployed();
	return deployer.deploy(Oracle, linkToken.address).then(oracle => {
		// Allow the QTUM TX Adapter wallet to fulfill Oracle's requests

		return ( (network == "qtum") ? oracle.setFulfillmentPermission(process.env.HEX_QTUM_ADDRESS || "0x7926223070547d2d15b2ef5e7383e541c338ffe9", true) : oracle.setFulfillmentPermission(accounts[0], true));
	});
};
