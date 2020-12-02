const Oracle = artifacts.require("Oracle");
const Consumer = artifacts.require("Consumer");

const CHAINLINK_ADDRESS = process.env.CHAINLINK_ADDRESS;
// Job id created from ChainLink Node Operator UI
const JOB_ID = process.env.JOB_ID;

module.exports = async function(deployer, networks, accounts) {
	const oracle = await Oracle.deployed();
	return deployer.deploy(Consumer, CHAINLINK_ADDRESS, oracle.address, JOB_ID);
};
