const Oracle = artifacts.require("Oracle");
const Consumer = artifacts.require("Consumer");

const LINKTOKEN_ADDRESS = "0xaFFc2201F5c7b5AC298EBD97A5414B8FFB5a33FA";

module.exports = async function(deployer, networks, accounts) {
	return deployer.deploy(Consumer, LINKTOKEN_ADDRESS, "0x55b08EFE9678e08347d09DdAba46350bb9756EC3", "0x3765393237306162393031623438366339346664373139646235313335323262");
};
