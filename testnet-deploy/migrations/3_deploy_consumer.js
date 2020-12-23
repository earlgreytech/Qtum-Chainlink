const Oracle = artifacts.require("Oracle");
const Consumer = artifacts.require("Consumer");

const LINKTOKEN_ADDRESS = "LINKTOKEN_ADDRESS";
const JOB_SPEC = "YOUR_JOB_ID";

module.exports = async function(deployer, networks, accounts) {
	const oracle = await Oracle.deployed();
	return deployer.deploy(Consumer, LINKTOKEN_ADDRESS, oracle.address, web3.utils.toHex(JOB_SPEC));
};
