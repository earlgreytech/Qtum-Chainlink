const Oracle = artifacts.require("Oracle");
const Consumer = artifacts.require("Consumer");
const CHAINLINK_ADDRESS = "0x7284d2FaEcbfD8C7bFE731C9d3A15F068f55178b";
// Job id created from ChainLink Node Operator UI
const JOB_ID = "0x6530383631633432663038613438666661306139363230363733346465633463";

module.exports = async function(deployer, networks, accounts) {
	return deployer.deploy(Consumer, CHAINLINK_ADDRESS, "0xce8Fa0ae1b6aC804B9a28cC2F98ff318bC7D1ed1", JOB_ID);
};
