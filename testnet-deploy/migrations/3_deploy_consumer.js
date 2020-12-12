const Oracle = artifacts.require("Oracle");
const Consumer = artifacts.require("Consumer");
// LinkToken Address
const CHAINLINK_ADDRESS = "0x7284d2FaEcbfD8C7bFE731C9d3A15F068f55178b";
// Oracle Address defined in Job Spex
const ORACLE_ADDRESS = "0x9cb84d64A33B7Cc16C69b0e9642dCF1Dba13fef9";
// Job id created from ChainLink Node Operator UI
const JOB_ID = "c88784bc7e52479fa78378385db156d7";

module.exports = async function(deployer, networks, accounts) {
	return deployer.deploy(Consumer, CHAINLINK_ADDRESS, ORACLE_ADDRESS, web3.utils.toHex(JOB_ID));
};
