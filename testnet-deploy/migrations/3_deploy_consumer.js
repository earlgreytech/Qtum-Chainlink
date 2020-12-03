const Oracle = artifacts.require("Oracle");
const Consumer = artifacts.require("Consumer");
const CHAINLINK_ADDRESS = "0xa8185eA17FC1D2187dF2AA52bE3056916a82737b";
// Job id created from ChainLink Node Operator UI
const JOB_ID = "b28daa894496486cae3b96e091e0604b";

module.exports = async function(deployer, networks, accounts) {
	return deployer.deploy(Consumer, CHAINLINK_ADDRESS, "0x0C544734E7752B7A64404F4b57AD8Cbe77DA296e", web3.utils.toHex(JOB_ID));
};
