const Oracle = artifacts.require("Oracle");
const Consumer = artifacts.require("Consumer");

const LINKTOKEN_ADDRESS = "LINKTOKEN_ADDRESS";

module.exports = async function(deployer, networks, accounts) {
	return deployer.deploy(Consumer, LINKTOKEN_ADDRESS, "ORACLE_ADDRESS", "YOUR_JOB_ID_IN_HEX");
};
