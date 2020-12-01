const fs = require('fs');
// const SideToken_v1 = artifacts.require("SideToken_v1");
const Oracle = artifacts.require("Oracle");
const adapterKey = fs.readFileSync("/run/secrets/adapter_key").toString().trim();

module.exports = async function(deployer) {
	// await web3.eth.accounts.wallet.add({privateKey: '0x' + adapterKey});
	const adapterAccount = web3.eth.accounts.wallet[0].address;

	// const sideToken = await SideToken_v1.deployed();
	return deployer.deploy(Oracle, '0xa8185eA17FC1D2187dF2AA52bE3056916a82737b').then(oracle => {
		// Allow the RSK TX Adapter wallet to fulfill Oracle's requests
		return oracle.setFulfillmentPermission('0x7926223070547D2D15b2eF5e7383E541c338FfE9', true);
	});
};
