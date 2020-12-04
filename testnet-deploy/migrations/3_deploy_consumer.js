const Oracle = artifacts.require("Oracle");
const Consumer = artifacts.require("Consumer");
const CHAINLINK_ADDRESS = "0xf52cE576e5d916df121DAd40398f5615E084BEBD";
// Job id created from ChainLink Node Operator UI
const JOB_ID = "";

module.exports = async function(deployer, networks, accounts) {
	return deployer.deploy(Consumer, CHAINLINK_ADDRESS, "0x0C544734E7752B7A64404F4b57AD8Cbe77DA296e", web3.utils.toHex(JOB_ID));
};
