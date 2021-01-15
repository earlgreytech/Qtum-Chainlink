require('dotenv')
const fs = require('fs');
const LinkToken = artifacts.require("LinkToken");
const Oracle = artifacts.require("Oracle");

module.exports = async function(deployer) {
	const linkToken = await LinkToken.deployed();
	return deployer.deploy(Oracle, linkToken.address).then(oracle => {
		// Allow the QTUM TX Adapter wallet to fulfill Oracle's requests
		return oracle.setFulfillmentPermission(process.env.HEX_QTUM_ADDRESS, true);
	});
};
